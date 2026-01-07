import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { PatientCasePublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteCase from "./DeleteCase"
import EditCase from "./EditCase"
import ViewCase from "./ViewCase"

interface CaseActionsMenuProps {
  case: PatientCasePublic
}

export const CaseActionsMenu = ({ case: caseItem }: CaseActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewCase caseItem={caseItem} />
        <EditCase caseItem={caseItem} onSuccess={() => setOpen(false)} />
        <DeleteCase id={caseItem.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

