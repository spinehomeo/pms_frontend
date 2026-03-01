import type { ColumnDef } from "@tanstack/react-table"

import type { PatientCasePublic } from "@/client"
import { cn } from "@/lib/utils"
import { CaseActionsMenu } from "./CaseActionsMenu"

export const columns: ColumnDef<PatientCasePublic>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className="font-medium">{index + 1}</span>
    },
  },
  {
    accessorKey: "case_number",
    header: "Case No",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-sm">
        {row.original.case_number}
      </span>
    ),
  },
  {
    accessorKey: "patient_name",
    header: "Patient Name",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.patient_name || `Patient ${row.original.patient_id.slice(0, 8)}`}
      </span>
    ),
  },
  {
    accessorKey: "patient_city",
    header: "City",
    cell: ({ row }) => {
      const city = row.original.patient_city
      return (
        <span className={cn("text-sm text-muted-foreground", !city && "italic")}>
          {city || "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "patient_phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.patient_phone
      return (
        <span className={cn("text-sm text-muted-foreground", !phone && "italic")}>
          {phone || "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "chief_complaint_patient",
    header: "Chief Complaint",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-xs truncate block">
        {row.original.chief_complaint_patient}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Chief Complaint Duration",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.duration}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CaseActionsMenu case={row.original} />
      </div>
    ),
  },
]

