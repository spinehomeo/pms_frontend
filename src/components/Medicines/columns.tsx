import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"

import type { DoctorMedicineStockPublic } from "@/client/MedicinesService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { cn } from "@/lib/utils"
import { MedicineActionsMenu } from "./MedicineActionsMenu"

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

export const columns: ColumnDef<DoctorMedicineStockPublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "medicine_name",
    header: "Medicine",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.medicine_name || "Unknown"}</span>
    ),
  },
  {
    accessorKey: "potency",
    header: "Potency",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.potency}</span>
    ),
  },
  {
    accessorKey: "form",
    header: "Form",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.form}
      </Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.original.quantity
      const threshold = row.original.low_stock_threshold
      const isLow = quantity <= threshold
      return (
        <span className={cn("text-sm font-medium", isLow && "text-orange-500")}>
          {quantity} {row.original.unit}
        </span>
      )
    },
  },
  {
    accessorKey: "expiry_date",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiry = row.original.expiry_date
      if (!expiry) return <span className="text-muted-foreground italic">No expiry</span>
      
      const expiryDate = new Date(expiry)
      const today = new Date()
      const isExpired = expiryDate < today
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return (
        <span className={cn(
          "text-sm",
          isExpired && "text-red-500 font-medium",
          !isExpired && daysUntilExpiry <= 30 && "text-orange-500"
        )}>
          {expiryDate.toLocaleDateString()}
          {!isExpired && daysUntilExpiry <= 30 && (
            <span className="ml-1 text-xs">({daysUntilExpiry}d)</span>
          )}
        </span>
      )
    },
  },
  {
    accessorKey: "storage_location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.storage_location}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <MedicineActionsMenu stock={row.original} />
      </div>
    ),
  },
]

