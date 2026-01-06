import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { PatientPublic } from "@/client/PatientsService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { PatientActionsMenu } from "./PatientActionsMenu"

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

export const columns: ColumnDef<PatientPublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
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

