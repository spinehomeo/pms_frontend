import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DoctorPreferencesService, type DoctorField, type FormType } from "@/client"
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

interface DeleteCustomFieldProps {
    field: DoctorField
    formType?: FormType
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const DeleteCustomField = ({ field, formType = "cases", open: controlledOpen, onOpenChange }: DeleteCustomFieldProps) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const handleOpenChange = onOpenChange || setInternalOpen
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const mutation = useMutation({
        mutationFn: async () => {
            return DoctorPreferencesService.deleteCustomField({
                field_name: field.field_name,
                form_type: formType,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctor-preferences-fields"] })
            showSuccessToast("Custom field deleted successfully")
            handleOpenChange(false)
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
                    <DialogTitle>Delete Custom Field</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this custom field? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Field Name:</span>
                            <span className="font-medium">{field.display_name}</span>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-mono capitalize">{field.field_type}</span>
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

export default DeleteCustomField
