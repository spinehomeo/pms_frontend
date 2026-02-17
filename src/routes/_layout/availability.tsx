import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { DoctorAvailabilityService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import AddAvailabilitySlot from "@/components/DoctorAvailability/AddAvailabilitySlot"
import ExceptionsListView from "@/components/DoctorAvailability/ExceptionsListView"
import { columns } from "@/components/DoctorAvailability/columns"
import PendingAppointments from "@/components/Pending/PendingAppointments"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function getAvailabilitiesQueryOptions() {
    return {
        queryFn: () => DoctorAvailabilityService.getAvailabilities({ skip: 0, limit: 100 }),
        queryKey: ["availabilities"],
    }
}

export const Route = createFileRoute("/_layout/availability")({
    component: Availability,
    head: () => ({
        meta: [
            {
                title: "Availability - Doctor Schedule",
            },
        ],
    }),
})

function AvailabilityTableContent() {
    const { data: availabilities } = useSuspenseQuery(getAvailabilitiesQueryOptions())
    const [searchQuery, setSearchQuery] = useState("")

    const filteredAvailabilities = useMemo(() => {
        if (!searchQuery.trim()) return availabilities.data

        const query = searchQuery.toLowerCase()
        return availabilities.data.filter((availability) => {
            return (
                availability.day_of_week?.toLowerCase().includes(query) ||
                availability.start_time?.toLowerCase().includes(query) ||
                availability.end_time?.toLowerCase().includes(query) ||
                availability.notes?.toLowerCase().includes(query)
            )
        })
    }, [availabilities.data, searchQuery])

    if (availabilities.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">You don't have any availability slots yet</h3>
                <p className="text-muted-foreground">Create a new availability slot to get started</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by day, time, or notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                        {filteredAvailabilities.length} result(s) found
                    </p>
                )}
            </div>
            {filteredAvailabilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No slots found</h3>
                    <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
            ) : (
                <DataTable columns={columns} data={filteredAvailabilities} />
            )}
        </div>
    )
}

function AvailabilityTable() {
    return (
        <Suspense fallback={<PendingAppointments />}>
            <AvailabilityTableContent />
        </Suspense>
    )
}

function Availability() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Doctor Availability</h1>
                <p className="text-muted-foreground">Manage your weekly schedule and date-specific exceptions</p>
            </div>

            <Tabs defaultValue="schedule" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
                    <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="space-y-4">
                    <div className="flex items-center justify-end">
                        <AddAvailabilitySlot />
                    </div>
                    <AvailabilityTable />
                </TabsContent>

                <TabsContent value="exceptions">
                    <ExceptionsListView />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Availability
