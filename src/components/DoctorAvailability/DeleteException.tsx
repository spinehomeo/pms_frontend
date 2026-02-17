import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import { DoctorAvailabilityService, type DoctorExceptionPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { LoadingButton } from "@/components/ui/loading-button"

interface DeleteExceptionProps {
    exception: DoctorExceptionPublic
    onSuccess?: () => void
}

const DeleteException = ({ exception, onSuccess }: DeleteExceptionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const mutation = useMutation({
        mutationFn: async () => {
            return await DoctorAvailabilityService.deleteException({
                exceptionId: exception.id,
            })
        },
        onSuccess: () => {
            showSuccessToast("Exception deleted successfully")
            queryClient.invalidateQueries({ queryKey: ["availability-exceptions"] })
            queryClient.invalidateQueries({ queryKey: ["availability-calendar"] })
            setIsOpen(false)
            onSuccess?.()
        },
        onError: (error: any) => {
            const errorDetail = (error.body as any)?.detail || error.message || "Failed to delete exception"
            showErrorToast(errorDetail)
        },
    })

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Exception</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the exception for {exception.exception_date}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium">{exception.exception_date}</p>
                    <p className="text-muted-foreground capitalize mt-1">{exception.exception_type}</p>
                    {exception.reason && <p className="text-muted-foreground mt-1">{exception.reason}</p>}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <LoadingButton
                        variant="destructive"
                        loading={mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        Delete
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteException
