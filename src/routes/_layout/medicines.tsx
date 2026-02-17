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

function getMedicinesQueryOptions() {
  return {
    queryFn: () => MedicinesService.searchMedicines({ skip: 0, limit: 1000 }),
    queryKey: ["medicines-search"],
  }
}

export const Route = createFileRoute("/_layout/medicines")({
  component: Medicines,
  head: () => ({
    meta: [
      {
        title: "Global Medicine Catalog - FastAPI Cloud",
      },
    ],
  }),
})

function MedicinesTableContent() {
  const { data: medicinesData } = useSuspenseQuery(getMedicinesQueryOptions())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return medicinesData.data

    const query = searchQuery.toLowerCase()
    return medicinesData.data.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.potency?.toLowerCase().includes(query) ||
        item.form?.toLowerCase().includes(query) ||
        item.manufacturer?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    })
  }, [medicinesData.data, searchQuery])

  if (medicinesData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No medicines in catalog yet</h3>
        <p className="text-muted-foreground">Add medicines to the global catalog to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, potency, form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredMedicines.length} result(s) found
          </p>
        )}
      </div>
      {filteredMedicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No medicines found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredMedicines} />
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
          <h1 className="text-2xl font-bold tracking-tight">Global Medicine Catalog</h1>
          <p className="text-muted-foreground">Community-driven catalog with doctor contributions</p>
        </div>
        <AddMedicine />
      </div>
      <MedicinesTable />
    </div>
  )
}
