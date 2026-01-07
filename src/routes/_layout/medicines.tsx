import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { MedicinesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddMedicine from "@/components/Medicines/AddMedicine"
import { columns } from "@/components/Medicines/columns"
import PendingMedicines from "@/components/Pending/PendingMedicines"

function getMedicinesStockQueryOptions() {
  return {
    queryFn: () => MedicinesService.readMedicineStock({ skip: 0, limit: 100 }),
    queryKey: ["medicines-stock"],
  }
}

export const Route = createFileRoute("/_layout/medicines")({
  component: Medicines,
  head: () => ({
    meta: [
      {
        title: "Medicines - FastAPI Cloud",
      },
    ],
  }),
})

function MedicinesTableContent() {
  const { data: stock } = useSuspenseQuery(getMedicinesStockQueryOptions())

  if (stock.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any medicines in stock yet</h3>
        <p className="text-muted-foreground">Add medicines to your stock to get started</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={stock.data} />
}

function MedicinesTable() {
  return (
    <Suspense fallback={<PendingMedicines />}>
      <MedicinesTableContent />
    </Suspense>
  )
}

function Medicines() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground">Manage medicine stock and inventory</p>
        </div>
        <AddMedicine />
      </div>
      <MedicinesTable />
    </div>
  )
}
