import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { DoctorPreferencesService, type DoctorField, type FormType } from "@/client"
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
    formType?: FormType
}

const PreferenceActionsMenu = ({ field, formType = "cases" }: PreferenceActionsMenuProps) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const [showDelete, setShowDelete] = useState(false)

    const isCustomField = field.is_custom === true
    const isMandatoryField = 
        field.field_name === "chief_complaint_patient" || 
        field.field_name === "chief_complaint_duration"

    const toggleMutation = useMutation({
        mutationFn: async () => {
            return DoctorPreferencesService.toggleField({
                field_name: field.field_name,
                enabled: !(field.is_enabled ?? true),
                form_type: formType,
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
                <DeleteCustomField field={field} formType={formType} open={showDelete} onOpenChange={setShowDelete} />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isCustomField ? (
                        <DropdownMenuItem
                            onClick={() => setShowDelete(true)}
                            className="text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    ) : (
                        <>
                            {!isMandatoryField && (
                                <DropdownMenuItem
                                    onClick={() => toggleMutation.mutate()}
                                    disabled={toggleMutation.isPending}
                                >
                                    {field.is_enabled ?? true ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                            )}
                            {isMandatoryField && (
                                <DropdownMenuItem disabled className="text-muted-foreground">
                                    Always Required (Cannot Disable)
                                </DropdownMenuItem>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export default PreferenceActionsMenu
