import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { CasesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddCase from "@/components/Cases/AddCase"
import { columns } from "@/components/Cases/columns"
import PendingCases from "@/components/Pending/PendingCases"
import { Input } from "@/components/ui/input"

function getCasesQueryOptions() {
  return {
    queryFn: () => CasesService.readCases({ skip: 0, limit: 100 }),
    queryKey: ["cases"],
  }
}

export const Route = createFileRoute("/_layout/cases")({
  component: Cases,
  head: () => ({
    meta: [
      {
        title: "Cases - FastAPI Cloud",
      },
    ],
  }),
})

function CasesTableContent() {
  const { data: cases } = useSuspenseQuery(getCasesQueryOptions())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases.data
    
    const query = searchQuery.toLowerCase()
    return cases.data.filter((caseItem) => {
      return (
        caseItem.case_number?.toLowerCase().includes(query) ||
        caseItem.patient_name?.toLowerCase().includes(query) ||
        caseItem.chief_complaint?.toLowerCase().includes(query) ||
        caseItem.duration?.toLowerCase().includes(query) ||
        caseItem.onset?.toLowerCase().includes(query) ||
        caseItem.location?.toLowerCase().includes(query)
      )
    })
  }, [cases.data, searchQuery])

  if (cases.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any cases yet</h3>
        <p className="text-muted-foreground">Create a new case to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by number, patient, complaint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredCases.length} result(s) found
          </p>
        )}
      </div>
      {filteredCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No cases found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredCases} />
      )}
    </div>
  )
}

function CasesTable() {
  return (
    <Suspense fallback={<PendingCases />}>
      <CasesTableContent />
    </Suspense>
  )
}

function Cases() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">Manage patient cases</p>
        </div>
        <AddCase />
      </div>
      <CasesTable />
    </div>
  )
}
