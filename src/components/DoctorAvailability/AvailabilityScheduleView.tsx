import { useSuspenseQuery } from "@tanstack/react-query"
import { Clock } from "lucide-react"
import { Suspense } from "react"

import { DoctorAvailabilityService } from "@/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

function ScheduleViewContent() {
    const { data: schedule } = useSuspenseQuery({
        queryFn: () => DoctorAvailabilityService.getScheduleWithPatientInfo(),
        queryKey: ["availability-schedule-with-patients"],
    })

    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {daysOrder.map((day) => {
                const slots = schedule.schedule[day as keyof typeof schedule.schedule] || []
                const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1)

                return (
                    <Card key={day}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{capitalizedDay}</CardTitle>
                            <CardDescription>
                                {slots.length} slot{slots.length !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {slots.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No availability slots for this day
                                </p>
                            ) : (
                                slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className={cn(
                                            "rounded-lg p-3 border text-sm space-y-1",
                                            slot.is_available
                                                ? "bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-800/30"
                                                : "bg-red-50/50 border-red-200/50 dark:bg-red-950/20 dark:border-red-800/30"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-semibold">
                                                {slot.start_time} - {slot.end_time}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    slot.is_available
                                                        ? "bg-green-500/10 text-green-600 border-green-200"
                                                        : "bg-red-500/10 text-red-600 border-red-200"
                                                )}
                                            >
                                                {slot.is_available ? "Available" : "Unavailable"}
                                            </Badge>
                                        </div>
                                        {slot.max_patients_per_slot && (
                                            <p className="text-xs text-muted-foreground">
                                                Max patients: {slot.max_patients_per_slot}
                                            </p>
                                        )}
                                        {slot.booked_patients && slot.booked_patients.length > 0 && (
                                            <div className="pt-2 mt-2 border-t space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground">Booked:</p>
                                                {slot.booked_patients.map((patient, idx) => (
                                                    <p key={idx} className="text-xs text-muted-foreground">
                                                        • {patient.patient_name} ({patient.appointment_time})
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {slot.notes && (
                                            <p className="text-xs text-muted-foreground italic pt-1">
                                                "{slot.notes}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

function ScheduleViewSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 2 }).map((_, j) => (
                            <Skeleton key={j} className="h-20 w-full" />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function AvailabilityScheduleView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Weekly Schedule</h2>
            </div>
            <Suspense fallback={<ScheduleViewSkeleton />}>
                <ScheduleViewContent />
            </Suspense>
        </div>
    )
}

export default AvailabilityScheduleView
