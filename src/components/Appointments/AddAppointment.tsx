import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, CheckCircle2, XCircle, Search } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { AppointmentsService, PatientsService } from "@/client"
import type { AppointmentCreate } from "@/client/AppointmentsService"
import type { PatientPublic } from "@/client/PatientsService"
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
import { cn } from "@/lib/utils"

const formSchema = z.object({
  patient_id: z.string().min(1, { message: "Patient is required" }),
  appointment_date: z.string().min(1, { message: "Date is required" }),
  appointment_time: z.string().min(1, { message: "Time is required" }),
  duration_minutes: z.number().min(15).max(480),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]),
  consultation_type: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const AddAppointment = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [patientSearchInput, setPatientSearchInput] = useState("")
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<PatientPublic | null>(null)
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checked: boolean
    available?: boolean
    message?: string
  }>({ checked: false })
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch patients for dropdown
  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => PatientsService.readPatients({ skip: 0, limit: 1000 }),
    enabled: isOpen,
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      patient_id: "",
      appointment_date: new Date().toISOString().split("T")[0],
      appointment_time: "09:00",
      duration_minutes: 30,
      status: "scheduled",
      consultation_type: "first",
      reason: "",
      notes: "",
    },
  })

  // Watch date and time fields to reset availability check
  const watchDate = useWatch({ control: form.control, name: "appointment_date" })
  const watchTime = useWatch({ control: form.control, name: "appointment_time" })
  const watchDuration = useWatch({ control: form.control, name: "duration_minutes" })

  // Reset availability status when date, time, or duration changes
  useEffect(() => {
    setAvailabilityStatus({ checked: false })
  }, [watchDate, watchTime, watchDuration])

  // Reset patient search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPatientSearchInput("")
      setShowPatientSuggestions(false)
      setSelectedPatientInfo(null)
    }
  }, [isOpen])

  const checkAvailabilityMutation = useMutation({
    mutationFn: (data: { appointment_date: string; appointment_time: string; duration_minutes: number }) =>
      AppointmentsService.validateAvailability(data),
    onSuccess: (response) => {
      setAvailabilityStatus({
        checked: true,
        available: response.available,
        message: response.message,
      })
      if (response.available) {
        showSuccessToast("Time slot is available!")
      }
    },
    onError: (error) => {
      setAvailabilityStatus({ checked: false })
      handleError.call(showErrorToast, error as any)
    },
  })

  const handleCheckAvailability = () => {
    const date = form.getValues("appointment_date")
    const time = form.getValues("appointment_time")
    const duration = form.getValues("duration_minutes")

    if (!date || !time) {
      showErrorToast("Please select date and time first")
      return
    }

    checkAvailabilityMutation.mutate({
      appointment_date: date,
      appointment_time: time,
      duration_minutes: duration,
    })
  }

  const mutation = useMutation({
    mutationFn: (data: AppointmentCreate) =>
      AppointmentsService.createAppointment({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Appointment created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const appointmentData: AppointmentCreate = {
      patient_id: data.patient_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      duration_minutes: data.duration_minutes,
      status: data.status,
      consultation_type: data.consultation_type,
      reason: data.reason || undefined,
      notes: data.notes || undefined,
    }
    mutation.mutate(appointmentData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient.
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointment_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Time <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={15}
                          max={480}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
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
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability Check */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckAvailability}
                  disabled={checkAvailabilityMutation.isPending}
                >
                  Check Availability
                </Button>
                {availabilityStatus.checked && (
                  <div className="flex items-center gap-2">
                    {availabilityStatus.available ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">
                          {availabilityStatus.message}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600">
                          {availabilityStatus.message}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="consultation_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., first, follow-up, emergency"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Reason for appointment"
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
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
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAppointment

