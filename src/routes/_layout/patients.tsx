import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { PatientsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddPatient from "@/components/Patients/AddPatient"
import { columns } from "@/components/Patients/columns"
import PendingPatients from "@/components/Pending/PendingPatients"
import { Input } from "@/components/ui/input"

function getPatientsQueryOptions() {
  return {
    queryFn: () => PatientsService.readPatients({ skip: 0, limit: 100 }),
    queryKey: ["patients"],
  }
}

export const Route = createFileRoute("/_layout/patients")({
  component: Patients,
  head: () => ({
    meta: [
      {
        title: "Patients - FastAPI Cloud",
      },
    ],
  }),
})

function PatientsTableContent() {
  const { data: patients } = useSuspenseQuery(getPatientsQueryOptions())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients.data

    const query = searchQuery.toLowerCase()
    return patients.data.filter((patient) => {
      return (
        patient.full_name?.toLowerCase().includes(query) ||
        patient.email?.toLowerCase().includes(query) ||
        patient.phone?.toLowerCase().includes(query) ||
        patient.residential_address?.toLowerCase().includes(query) ||
        patient.city?.toLowerCase().includes(query) ||
        patient.cnic?.toLowerCase().includes(query)
      )
    })
  }, [patients.data, searchQuery])

  if (patients.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any patients yet</h3>
        <p className="text-muted-foreground">Add a new patient to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredPatients.length} result(s) found
          </p>
        )}
      </div>
      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No patients found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredPatients} />
      )}
    </div>
  )
}

function PatientsTable() {
  return (
    <Suspense fallback={<PendingPatients />}>
      <PatientsTableContent />
    </Suspense>
  )
}

function Patients() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Create and manage your patients</p>
        </div>
        <AddPatient />
      </div>
      <PatientsTable />
    </div>
  )
}

