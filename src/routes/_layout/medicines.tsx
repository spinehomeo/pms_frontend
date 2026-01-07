import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { MedicinesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddMedicine from "@/components/Medicines/AddMedicine"
import { columns } from "@/components/Medicines/columns"
import PendingMedicines from "@/components/Pending/PendingMedicines"
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStock = useMemo(() => {
    if (!searchQuery.trim()) return stock.data
    
    const query = searchQuery.toLowerCase()
    return stock.data.filter((item) => {
      return (
        item.medicine_name?.toLowerCase().includes(query) ||
        item.potency?.toLowerCase().includes(query) ||
        item.form?.toLowerCase().includes(query) ||
        item.batch_number?.toLowerCase().includes(query) ||
        item.manufacturer?.toLowerCase().includes(query) ||
        item.storage_location?.toLowerCase().includes(query)
      )
    })
  }, [stock.data, searchQuery])

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, potency, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredStock.length} result(s) found
          </p>
        )}
      </div>
      {filteredStock.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No medicines found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredStock} />
      )}
    </div>
  )
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
