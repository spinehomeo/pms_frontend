import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { DoctorPreferencesService, type DoctorField } from "@/client"
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
import DeleteCustomField from "./DeleteCustomField"

interface PreferenceActionsMenuProps {
    field: DoctorField
}

const PreferenceActionsMenu = ({ field }: PreferenceActionsMenuProps) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const [showDelete, setShowDelete] = useState(false)

    // Check if this is a custom field (custom fields can be deleted)
    const isCustomField = !["chief_complaint_patient", "duration", "physicals", "noted_complaint_doctor", "peculiar_symptoms", "causation", "lab_reports"].includes(field.field_name)

    const toggleMutation = useMutation({
        mutationFn: async () => {
            return DoctorPreferencesService.toggleField({
                field_name: field.field_name,
                enabled: !(field.is_enabled ?? true),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctor-preferences-fields"] })
            const newStatus = field.is_enabled ?? true
            showSuccessToast(
                newStatus
                    ? "Field disabled successfully"
                    : "Field enabled successfully"
            )
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    return (
        <>
            {isCustomField && (
                <DeleteCustomField field={field} open={showDelete} onOpenChange={setShowDelete} />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                    >
                        {field.is_enabled ?? true ? "Disable" : "Enable"}
                    </DropdownMenuItem>
                    {isCustomField && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowDelete(true)}
                                className="text-destructive"
                            >
                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default PreferenceActionsMenu
