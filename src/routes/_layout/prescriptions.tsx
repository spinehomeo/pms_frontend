import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { PrescriptionsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddPrescription from "@/components/Prescriptions/AddPrescription"
import { columns } from "@/components/Prescriptions/columns"
import PendingPrescriptions from "@/components/Pending/PendingPrescriptions"
import { Input } from "@/components/ui/input"

function getPrescriptionsQueryOptions() {
  return {
    queryFn: () => PrescriptionsService.readPrescriptions({ skip: 0, limit: 100 }),
    queryKey: ["prescriptions"],
  }
}

export const Route = createFileRoute("/_layout/prescriptions")({
  component: Prescriptions,
  head: () => ({
    meta: [
      {
        title: "Prescriptions - FastAPI Cloud",
      },
    ],
  }),
})

function PrescriptionsTableContent() {
  const { data: prescriptions } = useSuspenseQuery(getPrescriptionsQueryOptions())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) return prescriptions.data
    
    const query = searchQuery.toLowerCase()
    return prescriptions.data.filter((prescription) => {
      return (
        prescription.prescription_number?.toLowerCase().includes(query) ||
        prescription.patient_name?.toLowerCase().includes(query) ||
        prescription.prescription_type?.toLowerCase().includes(query) ||
        prescription.dosage?.toLowerCase().includes(query) ||
        prescription.duration?.toLowerCase().includes(query)
      )
    })
  }, [prescriptions.data, searchQuery])

  if (prescriptions.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any prescriptions yet</h3>
        <p className="text-muted-foreground">Create a prescription to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by number, patient, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredPrescriptions.length} result(s) found
          </p>
        )}
      </div>
      {filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No prescriptions found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredPrescriptions} />
      )}
    </div>
  )
}

function PrescriptionsTable() {
  return (
    <Suspense fallback={<PendingPrescriptions />}>
      <PrescriptionsTableContent />
    </Suspense>
  )
}

function Prescriptions() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>
        <AddPrescription />
      </div>
      <PrescriptionsTable />
    </div>
  )
}
