import { Eye } from "lucide-react"
import { useState } from "react"

import type { AppointmentPublic } from "@/client/AppointmentsService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  confirmed: "bg-green-500/10 text-green-500",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  completed: "bg-gray-500/10 text-gray-500",
  cancelled: "bg-red-500/10 text-red-500",
  no_show: "bg-orange-500/10 text-orange-500",
}

interface ViewAppointmentProps {
  appointment: AppointmentPublic
}

const ViewAppointment = ({ appointment }: ViewAppointmentProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Eye />
        View Details
      </DropdownMenuItem>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about the appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-base font-semibold">
                  {appointment.patient_name || `Patient ${appointment.patient_id.slice(0, 8)}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  variant="outline" 
                  className={cn("capitalize mt-1", statusColors[appointment.status] || "bg-gray-500/10 text-gray-500")}
                >
                  {appointment.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-base font-mono">
                  {appointment.appointment_time.slice(0, 5)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-base">{appointment.duration_minutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultation Type</p>
                <p className="text-base capitalize">{appointment.consultation_type}</p>
              </div>
            </div>

            {appointment.reason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                  <p className="text-base whitespace-pre-wrap">{appointment.reason}</p>
                </div>
              </>
            )}

            {appointment.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-base whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewAppointment

