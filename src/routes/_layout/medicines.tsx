import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { MedicinesService } from "@/client"
import { Skeleton } from "@/components/ui/skeleton"

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

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          {stock.count} medicine(s) in stock. Full table implementation coming soon.
        </p>
      </div>
    </div>
  )
}

function MedicinesTable() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
      </div>
      <MedicinesTable />
    </div>
  )
}

