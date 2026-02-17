import type { ColumnDef } from "@tanstack/react-table"

import type { MedicinePublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { MedicineActionsMenu } from "./MedicineActionsMenu"
import { FavoriteMedicineToggle } from "./FavoriteMedicineToggle"

export const columns: ColumnDef<MedicinePublic>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return <span className="font-medium">{index + 1}</span>
    },
  },
  {
    accessorKey: "name",
    header: "Medicine Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name || "Unknown"}</span>
    ),
  },
  {
    accessorKey: "potency",
    header: "Potency",
    cell: ({ row }) => (
      <span className="text-sm font-mono">
        {row.original.potency}{row.original.potency_scale}
      </span>
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
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.manufacturer || "—"}
      </span>
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_verified ? "default" : "secondary"}>
        {row.original.is_verified ? "Verified" : "Pending"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_favorite",
    header: "Favorite",
    cell: ({ row }) => (
      <div className="text-center">
        <FavoriteMedicineToggle
          medicineId={row.original.id}
          initialIsFavorite={row.original.is_favorite}
        />
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <MedicineActionsMenu medicine={row.original} />
      </div>
    ),
  },
]
