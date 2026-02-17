import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { MedicinePublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteMedicine from "../Medicines/DeleteMedicine"
import EditMedicine from "../Medicines/EditMedicine"
import ViewMedicine from "../Medicines/ViewMedicine"

interface MedicineActionsMenuProps {
  medicine: MedicinePublic
}

export const MedicineActionsMenu = ({ medicine }: MedicineActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewMedicine medicine={medicine} />
        <EditMedicine medicine={medicine} onSuccess={() => setOpen(false)} />
        <DeleteMedicine medicineId={medicine.id} medicineName={medicine.name} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
