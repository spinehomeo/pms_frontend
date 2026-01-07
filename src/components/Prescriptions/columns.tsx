import type { ColumnDef } from "@tanstack/react-table"

import type { PrescriptionPublic } from "@/client/PrescriptionsService"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PrescriptionActionsMenu } from "./PrescriptionActionsMenu"

const typeColors: Record<string, string> = {
  acute: "bg-blue-500/10 text-blue-500",
  chronic: "bg-green-500/10 text-green-500",
  constitutional: "bg-purple-500/10 text-purple-500",
  intercurrent: "bg-yellow-500/10 text-yellow-500",
  nosode: "bg-orange-500/10 text-orange-500",
  sarcode: "bg-pink-500/10 text-pink-500",
  tautode: "bg-cyan-500/10 text-cyan-500",
}

export const columns: ColumnDef<PrescriptionPublic>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className="font-medium">{index + 1}</span>
    },
  },
  {
    accessorKey: "prescription_number",
    header: "Prescription #",
    cell: ({ row }) => (
      <span className="font-medium font-mono text-sm">
        {row.original.prescription_number}
      </span>
    ),
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
    accessorKey: "prescription_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.prescription_date)
      return (
        <span className="text-sm">
          {date.toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "prescription_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.prescription_type
      return (
        <Badge 
          variant="outline" 
          className={cn("capitalize", typeColors[type] || "bg-gray-500/10 text-gray-500")}
        >
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dosage",
    header: "Dosage",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.dosage}
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
    accessorKey: "medicines",
    header: "Medicines",
    cell: ({ row }) => {
      const medicines = row.original.medicines || []
      return (
        <span className="text-sm text-muted-foreground">
          {medicines.length} medicine(s)
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PrescriptionActionsMenu prescription={row.original} />
      </div>
    ),
  },
]

