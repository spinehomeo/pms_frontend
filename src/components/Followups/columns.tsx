import type { ColumnDef } from "@tanstack/react-table"

import type { FollowUpPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FollowupActionsMenu } from "./FollowupActionsMenu"

export const columns: ColumnDef<FollowUpPublic>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className="font-medium">{index + 1}</span>
    },
  },
  {
    accessorKey: "patient_name",
    header: "Patient",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.patient_name || `Case ${row.original.case_id.slice(0, 8)}`}
      </span>
    ),
  },
  {
    accessorKey: "follow_up_date",
    header: "Follow-up Date",
    cell: ({ row }) => {
      const date = new Date(row.original.follow_up_date)
      return (
        <span className="text-sm">
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "interval_days",
    header: "Interval",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.interval_days} days
      </span>
    ),
  },
  {
    accessorKey: "next_follow_up_date",
    header: "Next Follow-up",
    cell: ({ row }) => {
      const nextDate = row.original.next_follow_up_date
      if (!nextDate) return <span className="text-muted-foreground italic">Not scheduled</span>

      const date = new Date(nextDate)
      const today = new Date()
      const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const isOverdue = daysUntil < 0

      return (
        <span className={cn(
          "text-sm",
          isOverdue && "text-red-500 font-medium",
          !isOverdue && daysUntil <= 7 && "text-orange-500"
        )}>
          {date.toLocaleDateString()}
          {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
          {!isOverdue && daysUntil <= 7 && <span className="ml-1 text-xs">({daysUntil}d)</span>}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) return <span className="text-muted-foreground italic">N/A</span>
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            status === "completed" && "bg-green-500/10 text-green-600",
            status === "scheduled" && "bg-blue-500/10 text-blue-600",
            status === "pending" && "bg-yellow-500/10 text-yellow-600",
            status === "cancelled" && "bg-red-500/10 text-red-600",
          )}
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "subjective_improvement",
    header: "Improvement",
    cell: ({ row }) => {
      const improvement = row.original.subjective_improvement
      return (
        <span className={cn("text-sm text-muted-foreground max-w-xs truncate block", !improvement && "italic")}>
          {improvement || "No notes"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <FollowupActionsMenu followup={row.original} />
      </div>
    ),
  },
]

