import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useForm, type Resolver } from "react-hook-form"
import { z } from "zod"

import { EnumsService, MedicinesService, PrescriptionsService } from "@/client"
import type {
    PrescriptionMedicineCreate,
    PrescriptionPublic,
    PrescriptionUpdate,
} from "@/client/PrescriptionsService"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { parseDoctorEnumOptions } from "@/lib/doctorEnums"
import { handleError } from "@/utils"

const existingMedicineSchema = z.object({
    mode: z.literal("existing"),
    medicine_id: z.string().min(1, "Medicine is required"),
    quantity_prescribed: z.string().optional(),
    frequency: z.string().min(1, "Frequency is required"),
})

const quickAddMedicineSchema = z.object({
    mode: z.literal("quickadd"),
    name: z.string().min(1, "Medicine name is required"),
    potency: z.string().min(1, "Potency is required"),
    potency_scale: z.string().optional(),
    form: z.string().optional(),
    manufacturer: z.string().optional(),
    description: z.string().optional(),
    quantity_prescribed: z.string().optional(),
    frequency: z.string().min(1, "Frequency is required"),
})

const medicineSchema = z.union([existingMedicineSchema, quickAddMedicineSchema])

const formSchema = z.object({
    dosage: z.string().optional(),
    prescription_duration: z.string().optional(),
    instructions: z.string().optional(),
    follow_up_advice: z.string().optional(),
    dietary_restrictions: z.string().optional(),
    avoidance: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().min(1, "Status is required").optional(),
    medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
})

type FormData = z.infer<typeof formSchema>

interface EditPrescriptionProps {
    prescription: PrescriptionPublic
    onSuccess: () => void
}

const EditPrescription = ({ prescription, onSuccess }: EditPrescriptionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: medicinesData, error: medicinesError } = useQuery({
        queryKey: ["medicines-all"],
        queryFn: () => MedicinesService.searchMedicines({ skip: 0, limit: 1000 }),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: prescriptionStatusesData } = useQuery({
        queryKey: ["doctor-enum", "PrescriptionStatus"],
        queryFn: () => EnumsService.readDoctorEnum("PrescriptionStatus"),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: repetitionData } = useQuery({
        queryKey: ["doctor-enum", "RepetitionEnum"],
        queryFn: () => EnumsService.readDoctorEnum("RepetitionEnum"),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: scaleEnumData } = useQuery({
        queryKey: ["doctor-enum", "ScaleEnum"],
        queryFn: () => EnumsService.readDoctorEnum("ScaleEnum"),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: formEnumData } = useQuery({
        queryKey: ["doctor-enum", "FormEnum"],
        queryFn: () => EnumsService.readDoctorEnum("FormEnum"),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: manufacturerEnumData } = useQuery({
        queryKey: ["doctor-enum", "ManufacturerEnum"],
        queryFn: () => EnumsService.readDoctorEnum("ManufacturerEnum"),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const prescriptionStatusOptions = parseDoctorEnumOptions(prescriptionStatusesData)
    const repetitionOptions = parseDoctorEnumOptions(repetitionData)
    const scaleOptions = parseDoctorEnumOptions(scaleEnumData)
    const formOptions = parseDoctorEnumOptions(formEnumData)
    const manufacturerOptions = parseDoctorEnumOptions(manufacturerEnumData)

    const form = useForm<FormData, unknown, FormData>({
        resolver: zodResolver(formSchema) as Resolver<FormData>,
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            dosage: prescription.dosage || undefined,
            prescription_duration: prescription.prescription_duration || undefined,
            instructions: prescription.instructions || undefined,
            follow_up_advice: prescription.follow_up_advice || undefined,
            dietary_restrictions: prescription.dietary_restrictions || undefined,
            avoidance: prescription.avoidance || undefined,
            notes: prescription.notes || undefined,
            status: prescription.status || "",
            medicines:
                prescription.medicines.length > 0
                    ? prescription.medicines.map((medicine) => ({
                        mode: "existing",
                        medicine_id: medicine.medicine_id,
                        quantity_prescribed: medicine.quantity_prescribed || undefined,
                        frequency: medicine.frequency || "",
                    }))
                    : [{ mode: "existing", medicine_id: "", quantity_prescribed: "", frequency: "" } as any],
        },
    })

    useEffect(() => {
        if (isOpen && !form.getValues("status") && prescriptionStatusOptions.length > 0) {
            form.setValue("status", prescriptionStatusOptions[0].value)
        }
    }, [form, isOpen, prescriptionStatusOptions])

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "medicines",
    })

    const mutation = useMutation({
        mutationFn: (data: PrescriptionUpdate) =>
            PrescriptionsService.updatePrescription({
                prescriptionId: prescription.id,
                requestBody: data,
            }),
        onSuccess: () => {
            showSuccessToast("Prescription updated successfully")
            setIsOpen(false)
            onSuccess()
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
        },
    })

    const onSubmit = (data: FormData) => {
        const medicines: PrescriptionMedicineCreate[] = data.medicines.map((medicine) => {
            if (medicine.mode === "existing") {
                return {
                    medicine_id: medicine.medicine_id,
                    quantity_prescribed: medicine.quantity_prescribed || undefined,
                    frequency: (medicine.frequency || undefined) as any,
                }
            }

            return {
                new_medicine: {
                    name: medicine.name,
                    potency: medicine.potency,
                    potency_scale: medicine.potency_scale || undefined,
                    form: medicine.form || undefined,
                    manufacturer: medicine.manufacturer || undefined,
                    description: medicine.description || undefined,
                },
                quantity_prescribed: medicine.quantity_prescribed || undefined,
                frequency: (medicine.frequency || undefined) as any,
            }
        })

        const updateData: PrescriptionUpdate = {
            dosage: data.dosage || undefined,
            prescription_duration: data.prescription_duration || undefined,
            instructions: data.instructions || undefined,
            follow_up_advice: data.follow_up_advice || undefined,
            dietary_restrictions: data.dietary_restrictions || undefined,
            avoidance: data.avoidance || undefined,
            notes: data.notes || undefined,
            status: (data.status || undefined) as any,
            medicines,
        }

        mutation.mutate(updateData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setIsOpen(true)}>
                <Pencil />
                Edit Prescription
            </DropdownMenuItem>

            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Edit Prescription</DialogTitle>
                            <DialogDescription>
                                Update the prescription details below. You can modify medicines, instructions, and other details.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {prescriptionStatusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dosage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dosage</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 2 tablets twice daily" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="prescription_duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 7 days, 2 weeks" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="border-t pt-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <FormLabel>Medicines</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            append({
                                                mode: "existing",
                                                medicine_id: "",
                                                quantity_prescribed: "",
                                                frequency: repetitionOptions[0]?.value || "",
                                            } as any)
                                        }
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Medicine
                                    </Button>
                                </div>

                                {fields.map((fieldItem, index) => {
                                    const medicineMode = form.watch(`medicines.${index}.mode`)

                                    return (
                                        <div key={fieldItem.id} className="mb-4 rounded-lg border p-4">
                                            <FormField
                                                control={form.control}
                                                name={`medicines.${index}.mode`}
                                                render={({ field }) => (
                                                    <FormItem className="mb-4">
                                                        <FormLabel>How to add this medicine?</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="existing">Use from Catalog</SelectItem>
                                                                <SelectItem value="quickadd">Quick Add New</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {medicineMode === "existing" && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.medicine_id`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Medicine <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select medicine" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {medicinesError ? (
                                                                            <div className="p-2 text-sm text-destructive">Failed to load medicines</div>
                                                                        ) : medicinesData?.data && medicinesData.data.length > 0 ? (
                                                                            medicinesData.data.map((medicine) => (
                                                                                <SelectItem key={medicine.id} value={String(medicine.id)}>
                                                                                    {medicine.name} - {medicine.potency}
                                                                                    {medicine.potency_scale} {medicine.form}
                                                                                </SelectItem>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-2 text-sm text-muted-foreground">No medicines available</div>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.quantity_prescribed`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity Prescribed</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 2 tablets, 10 drops" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.frequency`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Frequency <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select frequency" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {repetitionOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {medicineMode === "quickadd" && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Medicine Name <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., Arnica Montana" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.potency`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Potency <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 30, 200, 1M" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.potency_scale`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Scale</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select scale" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {scaleOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.form`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Form</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select form" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {formOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.manufacturer`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Manufacturer</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select manufacturer" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {manufacturerOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.quantity_prescribed`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity Prescribed</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 2 tablets, 10 drops" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.frequency`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Frequency <span className="text-destructive">*</span>
                                                                </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select frequency" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {repetitionOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`medicines.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem className="col-span-2">
                                                                <FormLabel>Description</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Optional: Description or uses" {...field} rows={2} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            {fields.length > 1 && (
                                                <div className="mt-4 flex justify-end">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {form.formState.errors.medicines && (
                                    <p className="mt-2 text-sm text-destructive">{form.formState.errors.medicines.message}</p>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Instructions for taking the medicine" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="follow_up_advice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Follow-up Advice</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Follow-up instructions" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dietary_restrictions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dietary Restrictions</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Foods/drinks to avoid" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="avoidance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lifestyle Avoidance</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Activities or situations to avoid" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Any additional notes" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={mutation.isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={mutation.isPending}>
                                Update Prescription
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditPrescription
