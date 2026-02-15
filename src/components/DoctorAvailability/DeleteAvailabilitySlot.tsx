import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DoctorAvailabilityService, type DoctorAvailabilityPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface DeleteAvailabilitySlotProps {
    availability: DoctorAvailabilityPublic
    onSuccess?: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const DeleteAvailabilitySlot = ({ availability, onSuccess, open: controlledOpen, onOpenChange }: DeleteAvailabilitySlotProps) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const handleOpenChange = onOpenChange || setInternalOpen
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const mutation = useMutation({
        mutationFn: async () => {
            return DoctorAvailabilityService.deleteAvailability({
                slotId: availability.id,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["availabilities"] })
            showSuccessToast("Availability slot deleted successfully")
            handleOpenChange(false)
            onSuccess?.()
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    const handleDelete = () => {
        mutation.mutate()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Availability Slot</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this availability slot? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Day:</span>
                            <span className="font-medium capitalize">{availability.day_of_week}</span>
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-mono">{availability.start_time} - {availability.end_time}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        loading={mutation.isPending}
                        disabled={mutation.isPending}
                        onClick={handleDelete}
                    >
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteAvailabilitySlot
