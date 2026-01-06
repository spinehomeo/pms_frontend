import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { AppointmentPublic } from "@/client/AppointmentsService"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteAppointment from "../Appointments/DeleteAppointment"
import EditAppointment from "../Appointments/EditAppointment"

interface AppointmentActionsMenuProps {
  appointment: AppointmentPublic
}

export const AppointmentActionsMenu = ({ appointment }: AppointmentActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditAppointment appointment={appointment} onSuccess={() => setOpen(false)} />
        <DeleteAppointment id={appointment.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

