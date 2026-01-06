import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { PatientPublic } from "@/client/PatientsService"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeletePatient from "../Patients/DeletePatient"
import EditPatient from "../Patients/EditPatient"

interface PatientActionsMenuProps {
  patient: PatientPublic
}

export const PatientActionsMenu = ({ patient }: PatientActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditPatient patient={patient} onSuccess={() => setOpen(false)} />
        <DeletePatient id={patient.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

