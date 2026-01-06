import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { FollowupsService } from "@/client"
import { Skeleton } from "@/components/ui/skeleton"

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
        <p className="text-muted-foreground">Follow-ups will appear here</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          {followups.count} follow-up(s) found. Full table implementation coming soon.
        </p>
      </div>
    </div>
  )
}

function FollowupsTable() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
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
      </div>
      <FollowupsTable />
    </div>
  )
}
