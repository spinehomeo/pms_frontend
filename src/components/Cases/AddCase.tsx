import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Search } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { AppointmentsService, CasesService, PatientsService } from "@/client"
import type { CaseCreate } from "@/client/CasesService"
import type { PatientPublic } from "@/client/PatientsService"
import { DoctorPreferencesService, type DoctorField } from "@/client/DoctorPreferencesService"
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
const formSchema = z.object({
  patient_id: z.string().min(1, { message: "Patient is required" }),
  appointment_id: z.string().optional(),
  chief_complaint_patient: z.string().min(1, { message: "Chief complaint is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  physicals: z.string().optional(),
  noted_complaint_doctor: z.string().optional(),
  peculiar_symptoms: z.string().optional(),
  causation: z.string().optional(),
  lab_reports: z.string().optional(),
}).catchall(z.string()) // Allow custom fields

type FormData = z.infer<typeof formSchema>

const AddCase = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false)
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null)
  const [prefillPatientId, setPrefillPatientId] = useState<string | null>(null)
  const [prefillAppointmentId, setPrefillAppointmentId] = useState<string | null>(null)
  const [patientSearchInput, setPatientSearchInput] = useState("")
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<PatientPublic | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const shouldOpen = searchParams.get("openAdd") === "true"
    const flow = searchParams.get("flow")
    const patientId = searchParams.get("patientId")
    const appointmentId = searchParams.get("appointmentId")

    if (shouldOpen && flow === "appointment-to-case" && patientId) {
      setPrefillPatientId(patientId)
      if (appointmentId) {
        setPrefillAppointmentId(appointmentId)
      }
      setIsOpen(true)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  // Fetch patients for dropdown
  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => PatientsService.readPatients({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Fetch appointments for dropdown
  const { data: appointmentsData } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => AppointmentsService.readAppointments({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Fetch doctor preferences for custom fields
  const { data: preferencesData } = useQuery({
    queryKey: ["doctor-preferences"],
    queryFn: () => DoctorPreferencesService.getFields(),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Filter patients based on search input
  const filteredPatients = useMemo(() => {
    if (!patientsData?.data) return []
    if (!patientSearchInput.trim()) return patientsData.data

    const query = patientSearchInput.toLowerCase()
    return patientsData.data.filter((patient) => {
      return (
        patient.full_name?.toLowerCase().includes(query) ||
        patient.city?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query)
      )
    })
  }, [patientsData?.data, patientSearchInput])

  useEffect(() => {
    if (!prefillPatientId || !patientsData?.data) return

    const patient = patientsData.data.find((item) => item.id === prefillPatientId)
    if (!patient) return

    form.setValue("patient_id", patient.id)
    setSelectedPatientInfo(patient)
    setPatientSearchInput(patient.full_name)
    setShowPatientSuggestions(false)
  }, [prefillPatientId, patientsData?.data])

  useEffect(() => {
    if (!prefillAppointmentId) return
    form.setValue("appointment_id", prefillAppointmentId)
  }, [prefillAppointmentId])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      patient_id: "",
      appointment_id: "",
      chief_complaint_patient: "",
      duration: "",
      physicals: "",
      noted_complaint_doctor: "",
      peculiar_symptoms: "",
      causation: "",
      lab_reports: "",
    },
  })

  // Watch patient_id to filter appointments
  const watchPatientId = useWatch({ control: form.control, name: "patient_id" })

  // Filter appointments by selected patient
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.data || !watchPatientId) return appointmentsData?.data || []
    return appointmentsData.data.filter((appointment) => appointment.patient_id === watchPatientId)
  }, [appointmentsData?.data, watchPatientId])

  // Reset patient search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPatientSearchInput("")
      setShowPatientSuggestions(false)
      setSelectedPatientInfo(null)
    }
  }, [isOpen])

  const mutation = useMutation({
    mutationFn: (data: CaseCreate) =>
      CasesService.createCase({ requestBody: data }),
    onSuccess: (createdCase) => {
      showSuccessToast("Case created successfully")
      form.reset()
      setIsOpen(false)
      setCreatedCaseId(createdCase.id)
      setIsFlowModalOpen(true)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] })
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })

  const onSubmit = (data: FormData) => {
    // Extract custom fields (any field not in the standard schema)
    const standardFields = ['patient_id', 'appointment_id', 'chief_complaint_patient', 'duration', 'physicals', 'noted_complaint_doctor', 'peculiar_symptoms', 'causation', 'lab_reports']
    const customFields: Record<string, string> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (!standardFields.includes(key) && value) {
        customFields[key] = value as string
      }
    })

    const caseData: CaseCreate = {
      patient_id: data.patient_id,
      appointment_id: data.appointment_id || undefined,
      chief_complaint_patient: data.chief_complaint_patient,
      chief_complaint_duration: data.duration,
      physicals: data.physicals || undefined,
      noted_complaint_doctor: data.noted_complaint_doctor || undefined,
      peculiar_symptoms: data.peculiar_symptoms || undefined,
      causation: data.causation || undefined,
      lab_reports: data.lab_reports || undefined,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
    }
    mutation.mutate(caseData)
  }

  const handleAddPrescription = () => {
    if (!createdCaseId) return
    setIsFlowModalOpen(false)
    navigate({
      to: `/prescriptions?openAdd=true&flow=case-to-prescription&caseId=${createdCaseId}`,
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="my-4">
            <Plus className="mr-2" />
            Add Case
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Case</DialogTitle>
            <DialogDescription>
              Create a new patient case record.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Patient <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="space-y-2 relative">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by patient name, city..."
                            value={patientSearchInput}
                            onChange={(e) => {
                              setPatientSearchInput(e.target.value)
                              setShowPatientSuggestions(true)
                            }}
                            onFocus={() => setShowPatientSuggestions(true)}
                            className="pl-8"
                          />
                        </div>

                        {showPatientSuggestions && patientSearchInput && (
                          <div className="w-full bg-background border border-input rounded-md shadow-md max-h-64 overflow-y-auto">
                            {filteredPatients.length > 0 ? (
                              <div>
                                {filteredPatients.map((patient) => (
                                  <div
                                    key={patient.id}
                                    onClick={() => {
                                      field.onChange(patient.id)
                                      setSelectedPatientInfo(patient)
                                      setPatientSearchInput(patient.full_name)
                                      setShowPatientSuggestions(false)
                                    }}
                                    className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                  >
                                    <div className="font-medium">{patient.full_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {patient.city ? `${patient.city}` : "No city"}
                                      {patient.phone && ` • ${patient.phone}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No patients found
                              </div>
                            )}
                          </div>
                        )}

                        {field.value && selectedPatientInfo && (
                          <div className="bg-muted p-3 rounded-md space-y-1">
                            <div className="text-sm font-medium">Selected Patient</div>
                            <div className="text-sm">{selectedPatientInfo.full_name}</div>
                            {selectedPatientInfo.phone && (
                              <div className="text-sm text-muted-foreground">
                                📱 {selectedPatientInfo.phone}
                              </div>
                            )}
                            {selectedPatientInfo.city && (
                              <div className="text-sm text-muted-foreground">
                                📍 {selectedPatientInfo.city}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Link to appointment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredAppointments && filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appointment) => (
                              <SelectItem key={appointment.id} value={appointment.id}>
                                {appointment.appointment_date} {appointment.appointment_time} - {appointment.patient_name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">No appointments available for this patient</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chief_complaint_patient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Chief Complaint (Patient's Words) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Main complaint in patient's words"
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
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Duration <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3 days, 2 weeks"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="physicals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Examination</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Physical examination findings (e.g., BP 120/80)"
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
                  name="noted_complaint_doctor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noted Complaint (Doctor's Assessment)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Doctor's professional assessment"
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
                  name="peculiar_symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peculiar Symptoms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Unique or unusual symptoms"
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
                  name="causation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Causation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Possible causes or triggers"
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
                  name="lab_reports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Reports</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Laboratory test results"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Custom Fields */}
                {preferencesData && preferencesData.length > 0 && (
                  <>
                    <div className="col-span-full mt-4 border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">Custom Fields</h3>
                    </div>
                    {preferencesData.map((customField: DoctorField) => (
                      <FormField
                        key={customField.field_name}
                        control={form.control}
                        name={customField.field_name as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {customField.display_name}
                              {customField.is_required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                              {customField.field_type === 'textarea' ? (
                                <Textarea
                                  placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                  {...field}
                                  rows={2}
                                />
                              ) : (
                                <Input
                                  placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                  {...field}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={mutation.isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <LoadingButton type="submit" loading={mutation.isPending}>
                  Save
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFlowModalOpen} onOpenChange={setIsFlowModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Case Created Successfully</DialogTitle>
            <DialogDescription>
              Continue the guided flow by creating a prescription for this case.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={handleAddPrescription} disabled={!createdCaseId}>
              Add Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddCase

