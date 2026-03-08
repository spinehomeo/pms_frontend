import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { MedicinesService, OnsiteConsultationService } from "@/client"
import type { OnsiteConsultationResponse } from "@/client/OnsiteConsultationService"
import type { MedicinePublic } from "@/client/MedicinesService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

// ============================================================================
// Schema
// ============================================================================

const medicineEntrySchema = z
    .object({
        mode: z.enum(["existing", "new"]),
        medicine_id: z.string().optional(),
        new_medicine_name: z.string().optional(),
        new_medicine_potency: z.string().optional(),
        new_medicine_potency_scale: z.string().optional(),
        new_medicine_form: z.string().optional(),
        quantity_prescribed: z.string().optional(),
        frequency: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.mode === "existing") return !!data.medicine_id
            return !!data.new_medicine_name && !!data.new_medicine_potency
        },
        {
            message:
                "Select an existing medicine or provide name and potency for a new one",
        },
    )

const consultationBaseSchema = z.object({
    // Appointment
    consultation_type: z.string().min(1, "Consultation type is required"),
    duration_minutes: z.coerce.number().min(15).optional(),
    reason: z.string().optional(),
    appointment_notes: z.string().optional(),

    // Case
    chief_complaint_patient: z
        .string()
        .min(1, "Chief complaint is required")
        .max(500),
    chief_complaint_duration: z
        .string()
        .min(1, "Complaint duration is required")
        .max(100),
    physicals: z.string().optional(),
    noted_complaint_doctor: z.string().max(500).optional(),
    peculiar_symptoms: z.string().optional(),
    causation: z.string().optional(),
    lab_reports: z.string().optional(),

    // Prescription toggle
    include_prescription: z.boolean(),

    // Prescription fields
    prescription_type: z.string().optional(),
    dosage: z.string().optional(),
    prescription_duration: z.string().optional(),
    duration_days: z.coerce.number().min(1).optional(),
    instructions: z.string().optional(),
    dietary_restrictions: z.string().optional(),
    avoidance: z.string().optional(),
    prescription_notes: z.string().optional(),
    medicines: z.array(medicineEntrySchema).optional(),

    // Follow-up toggle
    include_follow_up: z.boolean(),

    // Follow-up fields
    next_follow_up_date: z.string().optional(),
    interval_days: z.coerce.number().min(7).optional(),
})

const consultationSchema = consultationBaseSchema
    .refine(
        (data) => {
            if (data.include_prescription) {
                return (
                    !!data.prescription_type &&
                    !!data.dosage &&
                    !!data.prescription_duration &&
                    data.medicines &&
                    data.medicines.length > 0
                )
            }
            return true
        },
        {
            message:
                "Prescription requires type, dosage, duration, and at least one medicine",
            path: ["prescription_type"],
        },
    )
    .refine(
        (data) => {
            if (data.include_follow_up) {
                if (!data.include_prescription) return false
                return !!data.next_follow_up_date
            }
            return true
        },
        {
            message: "Follow-up requires a prescription and a next visit date",
            path: ["next_follow_up_date"],
        },
    )

type ConsultationFormData = z.infer<typeof consultationBaseSchema>

// ============================================================================
// Component
// ============================================================================

interface ConsultationFormProps {
    patientName: string
    patientPhone: string
    onBack: () => void
    onSuccess: (result: OnsiteConsultationResponse) => void
}

export function ConsultationForm({
    patientName,
    patientPhone,
    onBack,
    onSuccess,
}: ConsultationFormProps) {
    const [showPrescription, setShowPrescription] = useState(false)
    const [showFollowUp, setShowFollowUp] = useState(false)
    const [medicineSearch, setMedicineSearch] = useState("")
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<ConsultationFormData>({
        resolver: zodResolver(consultationSchema) as any,
        defaultValues: {
            consultation_type: "",
            duration_minutes: 30,
            reason: "",
            appointment_notes: "",
            chief_complaint_patient: "",
            chief_complaint_duration: "",
            physicals: "",
            noted_complaint_doctor: "",
            peculiar_symptoms: "",
            causation: "",
            lab_reports: "",
            include_prescription: false,
            prescription_type: "",
            dosage: "",
            prescription_duration: "",
            duration_days: undefined,
            instructions: "",
            dietary_restrictions: "",
            avoidance: "",
            prescription_notes: "",
            medicines: [],
            include_follow_up: false,
            next_follow_up_date: "",
            interval_days: undefined,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "medicines",
    })

    // Fetch medicines for the picker
    const { data: medicinesData } = useQuery({
        queryKey: ["medicines-all"],
        queryFn: () => MedicinesService.listAllMedicines(),
        enabled: showPrescription,
    })

    const filteredMedicines = medicinesData?.data?.filter(
        (m: MedicinePublic) =>
            m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
            m.potency.toLowerCase().includes(medicineSearch.toLowerCase()),
    )

    const mutation = useMutation({
        mutationFn: (data: ConsultationFormData) => {
            const request = {
                patient: {
                    full_name: patientName,
                    phone: patientPhone,
                },
                appointment: {
                    consultation_type: data.consultation_type,
                    duration_minutes: data.duration_minutes || undefined,
                    reason: data.reason || undefined,
                    notes: data.appointment_notes || undefined,
                },
                case: {
                    chief_complaint_patient: data.chief_complaint_patient,
                    chief_complaint_duration: data.chief_complaint_duration,
                    physicals: data.physicals || undefined,
                    noted_complaint_doctor: data.noted_complaint_doctor || undefined,
                    peculiar_symptoms: data.peculiar_symptoms || undefined,
                    causation: data.causation || undefined,
                    lab_reports: data.lab_reports || undefined,
                },
                prescription: data.include_prescription
                    ? {
                        prescription_type: data.prescription_type!,
                        dosage: data.dosage!,
                        prescription_duration: data.prescription_duration!,
                        duration_days:
                            data.duration_days
                                ? Number(data.duration_days)
                                : undefined,
                        instructions: data.instructions || undefined,
                        dietary_restrictions:
                            data.dietary_restrictions || undefined,
                        avoidance: data.avoidance || undefined,
                        notes: data.prescription_notes || undefined,
                        medicines: (data.medicines || []).map((m) => {
                            if (m.mode === "existing") {
                                return {
                                    medicine_id: m.medicine_id!,
                                    quantity_prescribed:
                                        m.quantity_prescribed || undefined,
                                    frequency: m.frequency || undefined,
                                }
                            }
                            return {
                                new_medicine: {
                                    name: m.new_medicine_name!,
                                    potency: m.new_medicine_potency!,
                                    potency_scale:
                                        m.new_medicine_potency_scale || "C",
                                    form: m.new_medicine_form || "Globules",
                                },
                                quantity_prescribed:
                                    m.quantity_prescribed || undefined,
                                frequency: m.frequency || undefined,
                            }
                        }),
                    }
                    : undefined,
                follow_up:
                    data.include_follow_up && data.include_prescription
                        ? {
                            next_follow_up_date: data.next_follow_up_date!,
                            interval_days:
                                data.interval_days
                                    ? Number(data.interval_days)
                                    : undefined,
                        }
                        : undefined,
            }

            return OnsiteConsultationService.createConsultation(
                request,
                crypto.randomUUID(),
            )
        },
        onSuccess: (result) => {
            showSuccessToast("Consultation created successfully")
            onSuccess(result)
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: ConsultationFormData) => {
        mutation.mutate(data)
    }

    const handleTogglePrescription = () => {
        const next = !showPrescription
        setShowPrescription(next)
        form.setValue("include_prescription", next)
        if (!next) {
            setShowFollowUp(false)
            form.setValue("include_follow_up", false)
        }
    }

    const handleToggleFollowUp = () => {
        const next = !showFollowUp
        setShowFollowUp(next)
        form.setValue("include_follow_up", next)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {/* Patient Summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">
                                    Consultation for {patientName}
                                </CardTitle>
                                <CardDescription>{patientPhone}</CardDescription>
                            </div>
                            <Badge variant="outline">Onsite</Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Appointment Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Appointment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="consultation_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Type <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="first">First Visit</SelectItem>
                                                <SelectItem value="follow_up">Follow-up</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                                <SelectItem value="onsite">Onsite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2 lg:col-span-1">
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Reason for visit" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Case Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Case Details</CardTitle>
                        <CardDescription>
                            Document the patient's complaints and examination findings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="chief_complaint_patient"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>
                                            Chief Complaint{" "}
                                            <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Patient's own words about their complaint..."
                                                className="min-h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chief_complaint_duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Duration{" "}
                                            <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='e.g. "3 days", "2 weeks"'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="physicals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Physical Examination</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="BP, Pulse, etc."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="noted_complaint_doctor"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Doctor's Assessment</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Doctor's observation & assessment..."
                                                className="min-h-15"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="peculiar_symptoms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peculiar Symptoms</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Unusual symptoms..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="causation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Causation</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Possible cause..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lab_reports"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Lab Reports</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Lab report details..."
                                                className="min-h-15"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Prescription Section (Optional) */}
                <Card>
                    <CardHeader>
                        <div
                            className="flex cursor-pointer items-center justify-between"
                            onClick={handleTogglePrescription}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                    handleTogglePrescription()
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div>
                                <CardTitle className="text-base">
                                    Prescription
                                    <Badge variant="secondary" className="ml-2">
                                        Optional
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Add medicines and dosage instructions
                                </CardDescription>
                            </div>
                            {showPrescription ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                    </CardHeader>
                    {showPrescription && (
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="prescription_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Type{" "}
                                                <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="constitutional">
                                                        Constitutional
                                                    </SelectItem>
                                                    <SelectItem value="acute">Acute</SelectItem>
                                                    <SelectItem value="chronic">Chronic</SelectItem>
                                                    <SelectItem value="palliative">
                                                        Palliative
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dosage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Dosage{" "}
                                                <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. 3 times daily"
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
                                            <FormLabel>
                                                Duration{" "}
                                                <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. 14 days"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration_days"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (days)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="14"
                                                    {...field}
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
                                                <Input
                                                    placeholder="e.g. Avoid coffee"
                                                    {...field}
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
                                            <FormLabel>Avoidance</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Lifestyle avoidance..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="instructions"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2 lg:col-span-3">
                                            <FormLabel>Instructions</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Additional instructions..."
                                                    className="min-h-15"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Medicines */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">
                                        Medicines{" "}
                                        <span className="text-destructive">*</span>
                                    </h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            append({
                                                mode: "existing",
                                                medicine_id: "",
                                                new_medicine_name: "",
                                                new_medicine_potency: "",
                                                new_medicine_potency_scale: "C",
                                                new_medicine_form: "Globules",
                                                quantity_prescribed: "",
                                                frequency: "",
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Add Medicine
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No medicines added yet. Click "Add Medicine" to start.
                                    </p>
                                )}

                                {fields.map((field, index) => (
                                    <MedicineEntryCard
                                        key={field.id}
                                        index={index}
                                        form={form}
                                        medicines={filteredMedicines || []}
                                        medicineSearch={medicineSearch}
                                        onMedicineSearchChange={setMedicineSearch}
                                        onRemove={() => remove(index)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Follow-up Section (Optional, requires prescription) */}
                {showPrescription && (
                    <Card>
                        <CardHeader>
                            <div
                                className="flex cursor-pointer items-center justify-between"
                                onClick={handleToggleFollowUp}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ")
                                        handleToggleFollowUp()
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <div>
                                    <CardTitle className="text-base">
                                        Follow-up
                                        <Badge variant="secondary" className="ml-2">
                                            Optional
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Schedule the patient's next visit
                                    </CardDescription>
                                </div>
                                {showFollowUp ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                        {showFollowUp && (
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="next_follow_up_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Next Visit Date{" "}
                                                    <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="interval_days"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Interval (days)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={7}
                                                        placeholder="30"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        disabled={mutation.isPending}
                    >
                        Back
                    </Button>
                    <LoadingButton type="submit" loading={mutation.isPending}>
                        Create Consultation
                    </LoadingButton>
                </div>
            </form>
        </Form>
    )
}

// ============================================================================
// Medicine Entry Card
// ============================================================================

function MedicineEntryCard({
    index,
    form,
    medicines,
    medicineSearch,
    onMedicineSearchChange,
    onRemove,
}: {
    index: number
    form: ReturnType<typeof useForm<ConsultationFormData>>
    medicines: MedicinePublic[]
    medicineSearch: string
    onMedicineSearchChange: (s: string) => void
    onRemove: () => void
}) {
    const mode = form.watch(`medicines.${index}.mode`)

    return (
        <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medicine #{index + 1}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>

            {/* Toggle between existing / new */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={mode === "existing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => form.setValue(`medicines.${index}.mode`, "existing")}
                >
                    Existing
                </Button>
                <Button
                    type="button"
                    variant={mode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => form.setValue(`medicines.${index}.mode`, "new")}
                >
                    New Medicine
                </Button>
            </div>

            {mode === "existing" ? (
                <div className="space-y-2">
                    <Input
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onChange={(e) => onMedicineSearchChange(e.target.value)}
                    />
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.medicine_id`}
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select medicine" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {medicines.slice(0, 50).map((med) => (
                                            <SelectItem
                                                key={med.id}
                                                value={String(med.id)}
                                            >
                                                {med.name} — {med.potency}
                                                {med.potency_scale} ({med.form})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.new_medicine_name`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Medicine name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.new_medicine_potency`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Potency *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 30" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.new_medicine_potency_scale`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scale</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "C"}
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
                        name={`medicines.${index}.new_medicine_form`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Form</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "Globules"}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Globules">Globules</SelectItem>
                                        <SelectItem value="Dilutions">Dilutions</SelectItem>
                                        <SelectItem value="Diskette">Diskette</SelectItem>
                                        <SelectItem value="SOM">SOM</SelectItem>
                                        <SelectItem value="Bio Chemic">Bio Chemic</SelectItem>
                                        <SelectItem value="Homoeo Tabs">Homoeo Tabs</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {/* Common fields: quantity + frequency */}
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={form.control}
                    name={`medicines.${index}.quantity_prescribed`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 10 drops" {...field} />
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
                            <FormLabel>Frequency</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. TDS, BD" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
