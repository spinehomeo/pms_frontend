import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AppointmentsService, PatientsService } from "@/client"
import type { AppointmentCreate } from "@/client/AppointmentsService"
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
  appointment_date: z.string().min(1, { message: "Date is required" }),
  appointment_time: z.string().min(1, { message: "Time is required" }),
  duration_minutes: z.number().min(15).max(480).default(30),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).default("scheduled"),
  consultation_type: z.string().default("first"),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const AddAppointment = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch patients for dropdown
  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => PatientsService.readPatients({ skip: 0, limit: 1000 }),
    enabled: isOpen,
  })

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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patientsData?.data.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name} {patient.phone ? `(${patient.phone})` : ""}
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

