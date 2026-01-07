import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { AppointmentsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddAppointment from "@/components/Appointments/AddAppointment"
import { columns } from "@/components/Appointments/columns"
import PendingAppointments from "@/components/Pending/PendingAppointments"
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments.data
    
    const query = searchQuery.toLowerCase()
    return appointments.data.filter((appointment) => {
      return (
        appointment.patient_name?.toLowerCase().includes(query) ||
        appointment.consultation_type?.toLowerCase().includes(query) ||
        appointment.status?.toLowerCase().includes(query) ||
        appointment.reason?.toLowerCase().includes(query) ||
        appointment.notes?.toLowerCase().includes(query)
      )
    })
  }, [appointments.data, searchQuery])

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, type, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredAppointments.length} result(s) found
          </p>
        )}
      </div>
      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No appointments found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredAppointments} />
      )}
    </div>
  )
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
