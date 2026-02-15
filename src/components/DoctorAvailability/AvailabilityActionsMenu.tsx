import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { DoctorAvailabilityService, type DoctorAvailabilityPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import EditAvailabilitySlot from "./EditAvailabilitySlot"
import DeleteAvailabilitySlot from "./DeleteAvailabilitySlot"
import ViewAvailabilitySlot from "./ViewAvailabilitySlot"

interface AvailabilityActionsMenuProps {
    availability: DoctorAvailabilityPublic
}

export const AvailabilityActionsMenu = ({ availability }: AvailabilityActionsMenuProps) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const [showView, setShowView] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    const toggleMutation = useMutation({
        mutationFn: async () => {
            return DoctorAvailabilityService.toggleAvailability({
                slotId: availability.id,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["availabilities"] })
            showSuccessToast(
                availability.is_available
                    ? "Slot disabled successfully"
                    : "Slot enabled successfully"
            )
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    return (
        <>
            {/* Dialogs */}
            <ViewAvailabilitySlot availability={availability} open={showView} onOpenChange={setShowView} />
            <EditAvailabilitySlot availability={availability} open={showEdit} onOpenChange={setShowEdit} />
            <DeleteAvailabilitySlot availability={availability} open={showDelete} onOpenChange={setShowDelete} />

            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowView(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                    >
                        {availability.is_available ? "Disable" : "Enable"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default AvailabilityActionsMenu
