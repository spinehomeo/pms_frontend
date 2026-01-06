import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { AppointmentsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddAppointment from "@/components/Appointments/AddAppointment"
import { columns } from "@/components/Appointments/columns"
import PendingAppointments from "@/components/Pending/PendingAppointments"

function getAppointmentsQueryOptions() {
  return {
    queryFn: () => AppointmentsService.readAppointments({ skip: 0, limit: 100 }),
    queryKey: ["appointments"],
  }
}

export const Route = createFileRoute("/_layout/appointments")({
  component: Appointments,
  head: () => ({
    meta: [
      {
        title: "Appointments - FastAPI Cloud",
      },
    ],
  }),
})

function AppointmentsTableContent() {
  const { data: appointments } = useSuspenseQuery(getAppointmentsQueryOptions())

  if (appointments.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any appointments yet</h3>
        <p className="text-muted-foreground">Schedule a new appointment to get started</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={appointments.data} />
}

function AppointmentsTable() {
  return (
    <Suspense fallback={<PendingAppointments />}>
      <AppointmentsTableContent />
    </Suspense>
  )
}

function Appointments() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage appointments</p>
        </div>
        <AddAppointment />
      </div>
      <AppointmentsTable />
    </div>
  )
}
