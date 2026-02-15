import type { ColumnDef } from "@tanstack/react-table"

import type { DoctorAvailabilityPublic } from "@/client/DoctorAvailabilityService"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import AvailabilityActionsMenu from "./AvailabilityActionsMenu"

export const columns: ColumnDef<DoctorAvailabilityPublic>[] = [
    {
        id: "index",
        header: "#",
        cell: ({ row, table }) => {
            const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
            return <span className="font-medium">{index + 1}</span>
        },
    },
    {
        accessorKey: "day_of_week",
        header: "Day",
        cell: ({ row }) => (
            <span className="font-medium capitalize">
                {row.original.day_of_week}
            </span>
        ),
    },
    {
        accessorKey: "start_time",
        header: "Start Time",
        cell: ({ row }) => (
            <span className="font-mono text-sm">
                {row.original.start_time}
            </span>
        ),
    },
    {
        accessorKey: "end_time",
        header: "End Time",
        cell: ({ row }) => (
            <span className="font-mono text-sm">
                {row.original.end_time}
            </span>
        ),
    },
    {
        accessorKey: "max_patients_per_slot",
        header: "Max Patients",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
                {row.original.max_patients_per_slot || "Unlimited"}
            </span>
        ),
    },
    {
        accessorKey: "is_available",
        header: "Status",
        cell: ({ row }) => {
            const isAvailable = row.original.is_available
            return (
                <Badge
                    variant="outline"
                    className={cn(
                        isAvailable
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                    )}
                >
                    {isAvailable ? "Available" : "Unavailable"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground truncate max-w-xs">
                {row.original.notes || "—"}
            </span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <AvailabilityActionsMenu availability={row.original} />
            </div>
        ),
    },
]
