import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { DoctorMedicineStockPublic } from "@/client/MedicinesService"
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
  stock: DoctorMedicineStockPublic
}

export const MedicineActionsMenu = ({ stock }: MedicineActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewMedicine stock={stock} />
        <EditMedicine stock={stock} onSuccess={() => setOpen(false)} />
        <DeleteMedicine id={stock.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

