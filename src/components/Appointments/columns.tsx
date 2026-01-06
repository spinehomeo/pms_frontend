import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { AppointmentPublic } from "@/client/AppointmentsService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { AppointmentActionsMenu } from "./AppointmentActionsMenu"

function CopyId({ id }: { id: string }) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === id

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(id)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  confirmed: "bg-green-500/10 text-green-500",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  completed: "bg-gray-500/10 text-gray-500",
  cancelled: "bg-red-500/10 text-red-500",
  no_show: "bg-orange-500/10 text-orange-500",
}

export const columns: ColumnDef<AppointmentPublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "patient_name",
    header: "Patient",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.patient_name || `Patient ${row.original.patient_id.slice(0, 8)}`}
      </span>
    ),
  },
  {
    accessorKey: "appointment_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.appointment_date)
      return (
        <span className="text-sm">
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "appointment_time",
    header: "Time",
    cell: ({ row }) => {
      const time = row.original.appointment_time
      return (
        <span className="text-sm font-mono">
          {time.slice(0, 5)}
        </span>
      )
    },
  },
  {
    accessorKey: "duration_minutes",
    header: "Duration",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.duration_minutes} min
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge 
          variant="outline" 
          className={cn("capitalize", statusColors[status] || "bg-gray-500/10 text-gray-500")}
        >
          {status.replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "consultation_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground capitalize">
        {row.original.consultation_type}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AppointmentActionsMenu appointment={row.original} />
      </div>
    ),
  },
]

