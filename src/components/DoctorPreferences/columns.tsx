import type { ColumnDef } from "@tanstack/react-table"

import type { DoctorField } from "@/client/DoctorPreferencesService"
import type { FormType } from "@/client/DoctorPreferencesService"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PreferenceActionsMenu } from "./index"

export const createColumns = (formType: FormType = "cases"): ColumnDef<DoctorField>[] => [
    {
        id: "index",
        header: "#",
        cell: ({ row, table }) => {
            const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
            return <span className="font-medium">{index + 1}</span>
        },
    },
    {
        accessorKey: "display_name",
        header: "Field Name",
        cell: ({ row }) => (
            <div>
                <span className="font-medium">{row.original.display_name}</span>
                {row.original.is_custom && (
                    <Badge variant="outline" className="ml-2 text-xs bg-purple-500/10 text-purple-600">Custom</Badge>
                )}
            </div>
        ),
    },
    {
        accessorKey: "field_type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.field_type}
            </Badge>
        ),
    },
    {
        accessorKey: "is_required",
        header: "Required",
        cell: ({ row }) => (
            <Badge
                variant={row.original.is_required ? "default" : "outline"}
                className={cn(
                    row.original.is_required
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-gray-500/10 text-gray-600"
                )}
            >
                {row.original.is_required ? "Yes" : "No"}
            </Badge>
        ),
    },
    {
        accessorKey: "is_enabled",
        header: "Status",
        cell: ({ row }) => {
            // Check if this is a mandatory backend field
            const isMandatoryField = 
                row.original.field_name === "chief_complaint_patient" || 
                row.original.field_name === "chief_complaint_duration"
            
            if (isMandatoryField) {
                return (
                    <Badge
                        variant="default"
                        className="bg-orange-500/10 text-orange-600"
                    >
                        Always Required
                    </Badge>
                )
            }
            
            const isEnabled = row.original.is_enabled ?? true
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        isEnabled
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                    )}
                >
                    {isEnabled ? "Enabled" : "Disabled"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <PreferenceActionsMenu field={row.original} formType={formType} />
            </div>
        ),
    },
]

export const columns = createColumns("cases")
