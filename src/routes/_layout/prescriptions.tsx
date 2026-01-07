import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { PrescriptionsService } from "@/client"
import { Skeleton } from "@/components/ui/skeleton"

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

  // Simple table for now - can be enhanced with proper columns later
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          {prescriptions.count} prescription(s) found. Full table implementation coming soon.
        </p>
      </div>
    </div>
  )
}

function PrescriptionsTable() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
      </div>
      <PrescriptionsTable />
    </div>
  )
}
