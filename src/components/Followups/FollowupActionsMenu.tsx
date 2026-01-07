import { EllipsisVertical } from "lucide-react"
import { useState } from "react"

import type { FollowUpPublic } from "@/client/FollowupsService"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteFollowup from "../Followups/DeleteFollowup"
import EditFollowup from "../Followups/EditFollowup"
import ViewFollowup from "../Followups/ViewFollowup"

interface FollowupActionsMenuProps {
  followup: FollowUpPublic
}

export const FollowupActionsMenu = ({ followup }: FollowupActionsMenuProps) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ViewFollowup followup={followup} />
        <EditFollowup followup={followup} onSuccess={() => setOpen(false)} />
        <DeleteFollowup id={followup.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

