import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { EnumsService, MedicinesService, OnsiteConsultationService, DoctorPreferencesService } from "@/client"
import type { OnsiteConsultationResponse } from "@/client/OnsiteConsultationService"
import type { MedicinePublic } from "@/client/MedicinesService"
import type { DoctorField } from "@/client/DoctorPreferencesService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchableSelect } from "@/components/ui/searchable-select"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { parseDoctorEnumOptions } from "@/lib/doctorEnums"

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
        new_medicine_manufacturer: z.string().optional(),
        new_medicine_description: z.string().optional(),
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

    // Prescription toggle
    include_prescription: z.boolean(),

    // Prescription fields
    prescription_type: z.string().optional(),
    prescription_duration: z.string().optional(),
    instructions: z.string().optional(),
    dietary_restrictions: z.string().optional(),
    avoidance: z.string().optional(),
    prescription_notes: z.string().optional(),
    medicines: z.array(medicineEntrySchema).optional(),

    // Follow-up toggle
    include_follow_up: z.boolean(),

    // Follow-up fields
    next_follow_up_date: z.string().optional(),
    interval_days: z.coerce.number().min(1).optional(),
}).catchall(z.unknown()) // Allow optional custom fields from doctor preferences

const consultationSchema = consultationBaseSchema
    .refine(
        (data) => {
            if (data.include_prescription) {
                return (
                    !!data.prescription_type &&
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

type ConsultationFormData = z.infer<typeof consultationSchema>

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
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form: UseFormReturn<ConsultationFormData, any, ConsultationFormData> = useForm<ConsultationFormData, any, ConsultationFormData>({
        resolver: zodResolver(consultationSchema) as any,
        defaultValues: {
            consultation_type: "onsite",
            duration_minutes: 30,
            appointment_notes: "",
            chief_complaint_patient: "",
            chief_complaint_duration: "",
            include_prescription: false,
            prescription_type: "",
            prescription_duration: "",
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

    // Fetch doctor preferences for case and follow-up custom fields
    const { data: casePreferencesData } = useQuery({
        queryKey: ["doctor-preferences", "cases"],
        queryFn: () => DoctorPreferencesService.getFields("cases"),
        retry: false,
        throwOnError: false,
    })

    const { data: followupPreferencesData } = useQuery({
        queryKey: ["doctor-preferences", "followups"],
        queryFn: () => DoctorPreferencesService.getFields("followups"),
        retry: false,
        throwOnError: false,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "medicines" as never,
    })

    // Fetch enum options from API
    const { data: consultationTypeData } = useQuery({
        queryKey: ["doctor-enum", "ConsultationType"],
        queryFn: () => EnumsService.readDoctorEnum("ConsultationType"),
    })
    const consultationTypeOptions = parseDoctorEnumOptions(consultationTypeData)

    const { data: prescriptionTypeData } = useQuery({
        queryKey: ["doctor-enum", "PrescriptionType"],
        queryFn: () => EnumsService.readDoctorEnum("PrescriptionType"),
        enabled: showPrescription,
    })
    const prescriptionTypeOptions = parseDoctorEnumOptions(prescriptionTypeData)

    const { data: repetitionData } = useQuery({
        queryKey: ["doctor-enum", "RepetitionEnum"],
        queryFn: () => EnumsService.readDoctorEnum("RepetitionEnum"),
        enabled: showPrescription,
    })
    const repetitionOptions = parseDoctorEnumOptions(repetitionData)

    const { data: scaleData } = useQuery({
        queryKey: ["doctor-enum", "ScaleEnum"],
        queryFn: () => EnumsService.readDoctorEnum("ScaleEnum"),
        enabled: showPrescription,
    })
    const scaleOptions = parseDoctorEnumOptions(scaleData)

    const { data: formEnumData } = useQuery({
        queryKey: ["doctor-enum", "FormEnum"],
        queryFn: () => EnumsService.readDoctorEnum("FormEnum"),
        enabled: showPrescription,
    })
    const formEnumOptions = parseDoctorEnumOptions(formEnumData)

    const { data: manufacturerData } = useQuery({
        queryKey: ["doctor-enum", "ManufacturerEnum"],
        queryFn: () => EnumsService.readDoctorEnum("ManufacturerEnum"),
        enabled: showPrescription,
    })
    const manufacturerOptions = parseDoctorEnumOptions(manufacturerData)

    // Fetch medicines for the picker
    const { data: medicinesData } = useQuery({
        queryKey: ["medicines-all"],
        queryFn: () => MedicinesService.listAllMedicines(),
        enabled: showPrescription,
    })

    const mutation = useMutation({
        mutationFn: (data: ConsultationFormData) => {
            // Collect custom fields for case
            const standardCaseFields = [
                "chief_complaint_patient", "chief_complaint_duration"
            ]
            const caseCustomFields: Record<string, string> = {}
            Object.entries(data).forEach(([key, value]) => {
                if (!standardCaseFields.includes(key) && !key.startsWith("include_") &&
                    !key.startsWith("prescription_") && !key.startsWith("consultation_") &&
                    !key.startsWith("appointment_") && !key.startsWith("duration_") &&
                    !key.startsWith("next_follow_up_") && !key.startsWith("interval_") &&
                    key !== "medicines" && value) {
                    caseCustomFields[key] = value as string
                }
            })

            // Collect custom fields for follow-up
            const standardFollowupFields = ["next_follow_up_date", "interval_days"]
            const followupCustomFields: Record<string, string> = {}
            if (data.include_follow_up) {
                Object.entries(data).forEach(([key, value]) => {
                    if (!standardFollowupFields.includes(key) && !standardCaseFields.includes(key) &&
                        !key.startsWith("include_") && !key.startsWith("prescription_") &&
                        !key.startsWith("consultation_") && !key.startsWith("appointment_") &&
                        !key.startsWith("duration_") && key !== "medicines" && value) {
                        followupCustomFields[key] = value as string
                    }
                })
            }

            const request = {
                patient: {
                    full_name: patientName,
                    phone: patientPhone,
                },
                appointment: {
                    consultation_type: data.consultation_type,
                    duration_minutes: data.duration_minutes || undefined,
                    notes: data.appointment_notes || undefined,
                },
                case: {
                    chief_complaint_patient: data.chief_complaint_patient,
                    chief_complaint_duration: data.chief_complaint_duration,
                    custom_fields: Object.keys(caseCustomFields).length > 0 ? caseCustomFields : undefined,
                },
                prescription: data.include_prescription
                    ? {
                        prescription_type: data.prescription_type!,
                        dosage: data.instructions || data.prescription_duration!,
                        prescription_duration: data.prescription_duration!,
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
                                        m.new_medicine_potency_scale || undefined,
                                    form: m.new_medicine_form || undefined,
                                    manufacturer: m.new_medicine_manufacturer || undefined,
                                    description: m.new_medicine_description || undefined,
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
                            custom_fields: Object.keys(followupCustomFields).length > 0 ? followupCustomFields : undefined,
                        }
                        : undefined,
            }

            return OnsiteConsultationService.createConsultation(
                request,
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
                                        <FormControl>
                                            <SearchableSelect
                                                options={consultationTypeOptions.map((o) => ({
                                                    value: o.value,
                                                    label: o.label,
                                                }))}
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
                                                placeholder="Select type"
                                                searchPlaceholder="Search types..."
                                                emptyMessage="No types found."
                                            />
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="chief_complaint_patient"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>
                                            Chief Complaint{" "}
                                            <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Patient's own words about their complaint..."
                                                className="min-h-20"
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
                                name="chief_complaint_duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Complaint Duration{" "}
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
                        </div>

                        {/* Dynamic Custom Fields from Doctor Preferences */}
                        {casePreferencesData && casePreferencesData.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {casePreferencesData.map((customField: DoctorField) => (
                                    <FormField
                                        key={customField.field_name}
                                        control={form.control}
                                        name={customField.field_name as any}
                                        render={({ field }) => (
                                            <FormItem className={customField.field_type === 'textarea' ? 'col-span-2' : ''}>
                                                <FormLabel>
                                                    {customField.display_name}
                                                    {customField.is_required && <span className="text-destructive">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    {customField.field_type === 'textarea' ? (
                                                        <Textarea
                                                            placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                                            className="min-h-15"
                                                            {...field}
                                                            value={typeof field.value === "string" ? field.value : ""}
                                                            rows={2}
                                                        />
                                                    ) : (
                                                        <Input
                                                            placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                                            {...field}
                                                            value={typeof field.value === "string" ? field.value : ""}
                                                        />
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        )}
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
                                            <FormControl>
                                                <SearchableSelect
                                                    options={prescriptionTypeOptions.map((o) => ({
                                                        value: o.value,
                                                        label: o.label,
                                                    }))}
                                                    value={field.value || ""}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select type"
                                                    searchPlaceholder="Search types..."
                                                    emptyMessage="No types found."
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
                                                Prescription Duration{" "}
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
                                        medicines={medicinesData?.data || []}
                                        repetitionOptions={repetitionOptions}
                                        scaleOptions={scaleOptions}
                                        formEnumOptions={formEnumOptions}
                                        manufacturerOptions={manufacturerOptions}
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
                                                        min={1}
                                                        placeholder="30"
                                                        {...field}
                                                        value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Dynamic Custom Fields from Doctor Preferences */}
                                {followupPreferencesData && followupPreferencesData.length > 0 && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                                        {followupPreferencesData.map((customField: DoctorField) => (
                                            <FormField
                                                key={customField.field_name}
                                                control={form.control}
                                                name={customField.field_name as any}
                                                render={({ field }) => (
                                                    <FormItem className={customField.field_type === 'textarea' ? 'sm:col-span-2' : ''}>
                                                        <FormLabel>
                                                            {customField.display_name}
                                                            {customField.is_required && <span className="text-destructive">*</span>}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {customField.field_type === 'textarea' ? (
                                                                <Textarea
                                                                    placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                                                    className="min-h-15"
                                                                    {...field}
                                                                    value={typeof field.value === "string" ? field.value : ""}
                                                                />
                                                            ) : (
                                                                <Input
                                                                    placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                                                    {...field}
                                                                    value={typeof field.value === "string" ? field.value : ""}
                                                                />
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
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
    repetitionOptions,
    scaleOptions,
    formEnumOptions,
    manufacturerOptions,
    onRemove,
}: {
    index: number
    form: UseFormReturn<ConsultationFormData, any, ConsultationFormData>
    medicines: MedicinePublic[]
    repetitionOptions: { value: string; label: string }[]
    scaleOptions: { value: string; label: string }[]
    formEnumOptions: { value: string; label: string }[]
    manufacturerOptions: { value: string; label: string }[]
    onRemove: () => void
}) {
    const mode = form.watch(`medicines.${index}.mode`)

    const medicineOptions = medicines.map((med) => ({
        value: String(med.id),
        label: `${med.name} — ${med.potency}${med.potency_scale || ""} (${med.form || ""})`.trim(),
    }))

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
                <FormField
                    control={form.control}
                    name={`medicines.${index}.medicine_id`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <SearchableSelect
                                    options={medicineOptions}
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    placeholder="Search medicines..."
                                    searchPlaceholder="Type to search medicines..."
                                    emptyMessage="No medicines found."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                                <FormControl>
                                    <SearchableSelect
                                        options={scaleOptions.map((o) => ({
                                            value: o.value,
                                            label: o.label,
                                        }))}
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                        placeholder="Select scale"
                                        searchPlaceholder="Search scales..."
                                        emptyMessage="No scales found."
                                    />
                                </FormControl>
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
                                <FormControl>
                                    <SearchableSelect
                                        options={formEnumOptions.map((o) => ({
                                            value: o.value,
                                            label: o.label,
                                        }))}
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                        placeholder="Select form"
                                        searchPlaceholder="Search forms..."
                                        emptyMessage="No forms found."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.new_medicine_manufacturer`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manufacturer</FormLabel>
                                <FormControl>
                                    <SearchableSelect
                                        options={manufacturerOptions.map((o) => ({
                                            value: o.value,
                                            label: o.label,
                                        }))}
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                        placeholder="Select manufacturer"
                                        searchPlaceholder="Search manufacturers..."
                                        emptyMessage="No manufacturers found."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`medicines.${index}.new_medicine_description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Description" {...field} />
                                </FormControl>
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
                                <SearchableSelect
                                    options={repetitionOptions.map((o) => ({
                                        value: o.value,
                                        label: o.label,
                                    }))}
                                    value={field.value || ""}
                                    onValueChange={field.onChange}
                                    placeholder="Select frequency"
                                    searchPlaceholder="Search frequencies..."
                                    emptyMessage="No frequencies found."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
