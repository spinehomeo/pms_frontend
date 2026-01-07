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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email
      return (
        <span className={cn("text-muted-foreground", !email && "italic")}>
          {email || "No email"}
        </span>
      )
    },
  },
  {
    accessorKey: "last_visit_date",
    header: "Last Visit",
    cell: ({ row }) => {
      const lastVisit = row.original.last_visit_date
      return lastVisit ? (
        <span className="text-sm text-muted-foreground">
          {new Date(lastVisit).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-muted-foreground italic">Never</span>
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

