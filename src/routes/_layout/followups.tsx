import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { FollowupsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddFollowup from "@/components/Followups/AddFollowup"
import { columns } from "@/components/Followups/columns"
import PendingFollowups from "@/components/Pending/PendingFollowups"

function getFollowupsQueryOptions() {
  return {
    queryFn: () => FollowupsService.readFollowups({ skip: 0, limit: 100 }),
    queryKey: ["followups"],
  }
}

export const Route = createFileRoute("/_layout/followups")({
  component: Followups,
  head: () => ({
    meta: [
      {
        title: "Followups - FastAPI Cloud",
      },
    ],
  }),
})

function FollowupsTableContent() {
  const { data: followups } = useSuspenseQuery(getFollowupsQueryOptions())

  if (followups.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any follow-ups yet</h3>
        <p className="text-muted-foreground">Add a follow-up to get started</p>
      </div>
    )
  }

  return <DataTable columns={columns} data={followups.data} />
}

function FollowupsTable() {
  return (
    <Suspense fallback={<PendingFollowups />}>
      <FollowupsTableContent />
    </Suspense>
  )
}

function Followups() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Manage patient follow-ups</p>
        </div>
        <AddFollowup />
      </div>
      <FollowupsTable />
    </div>
  )
}
