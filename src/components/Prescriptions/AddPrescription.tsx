import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"

import { PrescriptionsService, CasesService, MedicinesService } from "@/client"
import type { PrescriptionCreate, PrescriptionMedicineCreate } from "@/client/PrescriptionsService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

// Schema for existing medicine mode
const existingMedicineSchema = z.object({
  mode: z.literal("existing"),
  medicine_id: z.coerce.number().pipe(z.number()),
  quantity_prescribed: z.string().optional(),
})

// Schema for quick-add medicine mode
const quickAddMedicineSchema = z.object({
  mode: z.literal("quickadd"),
  name: z.string().min(1, "Medicine name is required"),
  potency: z.string().min(1, "Potency is required"),
  potency_scale: z.enum(["C", "X", "Q"]).optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  quantity_prescribed: z.string().optional(),
})

const medicineSchema = z.union([existingMedicineSchema, quickAddMedicineSchema])

const formSchema = z.object({
  case_id: z.string().min(1, { message: "Case is required" }),
  prescription_type: z.enum([
    "Constitutional",
    "Classical",
    "Inter Current",
    "Pure Bio Chemic",
    "Mother Tincture",
    "Patent",
  ]).optional(),
  dosage: z.string().optional(),
  prescription_duration: z.string().optional(),
  instructions: z.string().optional(),
  follow_up_advice: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  avoidance: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
})

const AddPrescription = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch cases for dropdown
  const { data: casesData, error: casesError } = useQuery({
    queryKey: ["cases"],
    queryFn: () => CasesService.readCases({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Fetch medicines for dropdown (global catalog)
  const { data: medicinesData, error: medicinesError } = useQuery({
    queryKey: ["medicines-all"],
    queryFn: () => MedicinesService.searchMedicines({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      case_id: "",
      prescription_type: "Constitutional",
      dosage: "",
      prescription_duration: "",
      instructions: "",
      follow_up_advice: "",
      dietary_restrictions: "",
      avoidance: "",
      notes: "",
      medicines: [{ mode: "existing", medicine_id: 0, quantity_prescribed: "" } as any],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  })

  const mutation = useMutation({
    mutationFn: (data: PrescriptionCreate) =>
      PrescriptionsService.createPrescription({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Prescription created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const medicines: PrescriptionMedicineCreate[] = data.medicines.map((m) => {
      if (m.mode === "existing") {
        return {
          medicine_id: m.medicine_id,
          quantity_prescribed: m.quantity_prescribed || undefined,
        }
      } else {
        return {
          new_medicine: {
            name: m.name,
            potency: m.potency,
            potency_scale: m.potency_scale || "C",
            form: m.form,
            manufacturer: m.manufacturer,
            description: m.description,
          },
          quantity_prescribed: m.quantity_prescribed || undefined,
        }
      }
    })

    const prescriptionData: PrescriptionCreate = {
      case_id: data.case_id,
      prescription_type: data.prescription_type,
      dosage: data.dosage || undefined,
      prescription_duration: data.prescription_duration || undefined,
      instructions: data.instructions || undefined,
      follow_up_advice: data.follow_up_advice || undefined,
      dietary_restrictions: data.dietary_restrictions || undefined,
      avoidance: data.avoidance || undefined,
      notes: data.notes || undefined,
      medicines,
    }
    mutation.mutate(prescriptionData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="my-4"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <Plus className="mr-2" />
          Add Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
          <DialogDescription>
            Create a new prescription for a patient case. You can use existing medicines or quickly add new ones.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Case Selection */}
              <FormField
                control={form.control}
                name="case_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Case <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casesError ? (
                          <div className="p-2 text-sm text-destructive">Failed to load cases</div>
                        ) : casesData?.data && casesData.data.length > 0 ? (
                          casesData.data.map((caseItem) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.patient_name || `Case ${caseItem.case_number}`} - {caseItem.chief_complaint_patient}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No cases available</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prescription Type */}
              <FormField
                control={form.control}
                name="prescription_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescription Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Constitutional">Constitutional</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Inter Current">Inter Current</SelectItem>
                        <SelectItem value="Pure Bio Chemic">Pure Bio Chemic</SelectItem>
                        <SelectItem value="Mother Tincture">Mother Tincture</SelectItem>
                        <SelectItem value="Patent">Patent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dosage & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2 tablets twice daily"
                          {...field}
                        />
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
                        <Input
                          placeholder="e.g., 7 days, 2 weeks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Medicines Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <FormLabel>
                    Medicines <span className="text-destructive">*</span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ mode: "existing", medicine_id: 0, quantity_prescribed: "" } as any)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const medicineMode = form.watch(`medicines.${index}.mode`)
                  return (
                    <div key={field.id} className="mb-4 p-4 border rounded-lg">
                      {/* Mode Selection */}
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.mode`}
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>How to add this medicine?</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
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

                      {/* Existing Medicine Mode */}
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
                                <Select
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={field.value ? String(field.value) : ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select medicine" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {medicinesError ? (
                                      <div className="p-2 text-sm text-destructive">
                                        Failed to load medicines
                                      </div>
                                    ) : medicinesData?.data && medicinesData.data.length > 0 ? (
                                      medicinesData.data.map((medicine) => (
                                        <SelectItem
                                          key={medicine.id}
                                          value={String(medicine.id)}
                                        >
                                          {medicine.name} - {medicine.potency}{medicine.potency_scale}{" "}
                                          {medicine.form}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <div className="p-2 text-sm text-muted-foreground">
                                        No medicines available
                                      </div>
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
                                  <Input
                                    placeholder="e.g., 2 tablets, 10 drops"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Quick Add Mode */}
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
                                  <Input
                                    placeholder="e.g., Arnica Montana"
                                    {...field}
                                  />
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
                                  <Input
                                    placeholder="e.g., 30, 200, 1M"
                                    {...field}
                                  />
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
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="X">X</SelectItem>
                                    <SelectItem value="Q">Q</SelectItem>
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
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Globules">Globules</SelectItem>
                                    <SelectItem value="Tablets">Tablets</SelectItem>
                                    <SelectItem value="Powder">Powder</SelectItem>
                                    <SelectItem value="Liquid">Liquid</SelectItem>
                                    <SelectItem value="Drops">Drops</SelectItem>
                                    <SelectItem value="Ointment">Ointment</SelectItem>
                                    <SelectItem value="Syrup">Syrup</SelectItem>
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
                                <FormControl>
                                  <Input placeholder="e.g., Schwabe" {...field} />
                                </FormControl>
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
                                  <Input
                                    placeholder="e.g., 2 tablets, 10 drops"
                                    {...field}
                                  />
                                </FormControl>
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
                                  <Textarea
                                    placeholder="Optional: Description or uses"
                                    {...field}
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Remove Button */}
                      {fields.length > 1 && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {form.formState.errors.medicines && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.medicines.message}
                  </p>
                )}
              </div>

              {/* Additional Information */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instructions for taking the medicine"
                        {...field}
                        rows={2}
                      />
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
                      <Textarea
                        placeholder="Follow-up instructions"
                        {...field}
                        rows={2}
                      />
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
                      <Textarea
                        placeholder="Foods/drinks to avoid"
                        {...field}
                        rows={2}
                      />
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
                      <Textarea
                        placeholder="Activities or situations to avoid"
                        {...field}
                        rows={2}
                      />
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
                      <Textarea
                        placeholder="Any additional notes"
                        {...field}
                        rows={2}
                      />
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
                Create Prescription
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPrescription
