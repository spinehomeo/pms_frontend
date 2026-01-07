import type { ColumnDef } from "@tanstack/react-table"

import type { PatientCasePublic } from "@/client"
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
    header: "Case Number",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-sm">
        {row.original.case_number}
      </span>
    ),
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
    accessorKey: "case_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.case_date)
      return (
        <span className="text-sm">
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "chief_complaint",
    header: "Chief Complaint",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-xs truncate block">
        {row.original.chief_complaint}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
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

