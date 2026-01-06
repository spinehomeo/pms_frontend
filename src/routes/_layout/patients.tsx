import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { PatientsService } from "@/client"
import type { PatientsPublic } from "@/client/PatientsService"
import { DataTable } from "@/components/Common/DataTable"
import AddPatient from "@/components/Patients/AddPatient"
import { columns } from "@/components/Patients/columns"
import PendingPatients from "@/components/Pending/PendingPatients"

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

  return <DataTable columns={columns} data={patients.data} />
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

