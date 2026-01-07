import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { PrescriptionPublic } from "@/client/PrescriptionsService"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeletePrescription from "../Prescriptions/DeletePrescription"
import EditPrescription from "../Prescriptions/EditPrescription"
import ViewPrescription from "../Prescriptions/ViewPrescription"

interface PrescriptionActionsMenuProps {
  prescription: PrescriptionPublic
}

export const PrescriptionActionsMenu = ({ prescription }: PrescriptionActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewPrescription prescription={prescription} />
        <EditPrescription prescription={prescription} onSuccess={() => setOpen(false)} />
        <DeletePrescription id={prescription.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

