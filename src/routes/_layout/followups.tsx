import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { FollowupsService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddFollowup from "@/components/Followups/AddFollowup"
import { columns } from "@/components/Followups/columns"
import PendingFollowups from "@/components/Pending/PendingFollowups"
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFollowups = useMemo(() => {
    if (!searchQuery.trim()) return followups.data
    
    const query = searchQuery.toLowerCase()
    return followups.data.filter((followup) => {
      return (
        followup.patient_name?.toLowerCase().includes(query) ||
        followup.subjective_improvement?.toLowerCase().includes(query) ||
        followup.objective_findings?.toLowerCase().includes(query) ||
        followup.plan?.toLowerCase().includes(query)
      )
    })
  }, [followups.data, searchQuery])

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, improvement, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredFollowups.length} result(s) found
          </p>
        )}
      </div>
      {filteredFollowups.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No follow-ups found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredFollowups} />
      )}
    </div>
  )
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
