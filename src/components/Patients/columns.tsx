import type { ColumnDef } from "@tanstack/react-table"

import type { PatientPublic } from "@/client/PatientsService"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PatientActionsMenu } from "./PatientActionsMenu"

export const columns: ColumnDef<PatientPublic>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className="font-medium">{index + 1}</span>
    },
  },
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.full_name}</span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender
      return (
        <Badge variant="outline" className="capitalize">
          {gender}
        </Badge>
      )
    },
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const age = row.original.age
      return age ? <span>{age} years</span> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.phone
      return (
        <span className={cn("text-muted-foreground", !phone && "italic")}>
          {phone || "No phone"}
        </span>
      )
    },
  },
  {
    accessorKey: "cnic",
    header: "CNIC",
    cell: ({ row }) => {
      const cnic = row.original.cnic
      return (
        <span className={cn("text-muted-foreground", !cnic && "italic")}>
          {cnic || "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const city = row.original.city
      return (
        <span className={cn("text-muted-foreground", !city && "italic")}>
          {city || "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "referred_by",
    header: "Referred By",
    cell: ({ row }) => {
      const referredBy = row.original.referred_by
      return (
        <span className={cn("text-muted-foreground", !referredBy && "italic")}>
          {referredBy || "-"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <PatientActionsMenu patient={row.original} />
      </div>
    ),
  },
]

