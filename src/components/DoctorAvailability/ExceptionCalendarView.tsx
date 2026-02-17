import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isBefore,
    startOfToday,
    addMonths,
    format,
} from "date-fns"

import { DoctorAvailabilityService } from "@/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import AddException from "./AddException"
import EditException from "./EditException"
import DeleteException from "./DeleteException"

const ExceptionCalendarView = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const { data: exceptions = [], refetch, isLoading } = useQuery({
        queryFn: async () => {
            const start = format(startOfMonth(currentMonth), "yyyy-MM-dd")
            const end = format(endOfMonth(currentMonth), "yyyy-MM-dd")
            const response = await DoctorAvailabilityService.listExceptions({
                start_date: start,
                end_date: end,
            })
            return response.data
        },
        queryKey: ["availability-exceptions", format(currentMonth, "yyyy-MM")],
    })

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    const isPastDate = (date: Date) => isBefore(date, startOfToday())
    const getExceptionForDate = (date: Date) => {
        const dateString = format(date, "yyyy-MM-dd")
        return exceptions.find((ex) => ex.exception_date === dateString)
    }

    const getExceptionIcon = (type: string) => {
        switch (type) {
            case "unavailable":
                return "🚫"
            case "custom_hours":
                return "⏰"
            case "holiday":
                return "🎉"
            default:
                return ""
        }
    }

    const handlePreviousMonth = () => setCurrentMonth(addMonths(currentMonth, -1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Exception Calendar</CardTitle>
                            <CardDescription>
                                Manage date-specific availability exceptions
                            </CardDescription>
                        </div>
                        <AddException onSuccess={() => refetch()} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousMonth}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <h3 className="text-lg font-semibold">
                            {format(currentMonth, "MMMM yyyy")}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextMonth}
                            className="gap-2"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="space-y-2">
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        {isLoading ? (
                            <div className="grid grid-cols-7 gap-2">
                                {[...Array(35)].map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {days.map((day) => {
                                    const exception = getExceptionForDate(day)
                                    const isDisabled = isPastDate(day) || !isSameMonth(day, currentMonth)

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "relative min-h-24 rounded-lg border p-2",
                                                isDisabled
                                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                    : "bg-background hover:bg-muted/50",
                                                exception
                                                    ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-800"
                                                    : "border-border"
                                            )}
                                        >
                                            {/* Day Number */}
                                            <div className="text-sm font-semibold mb-1">
                                                {format(day, "d")}
                                            </div>

                                            {/* Exception Icon and Details */}
                                            {exception ? (
                                                <div className="space-y-2">
                                                    <div className="text-2xl" title={exception.reason || exception.exception_type}>
                                                        {getExceptionIcon(exception.exception_type)}
                                                    </div>
                                                    <div className="space-y-1 text-xs">
                                                        <p className="font-medium capitalize truncate">
                                                            {exception.exception_type.replace("_", " ")}
                                                        </p>
                                                        {exception.reason && (
                                                            <p className="text-muted-foreground truncate">{exception.reason}</p>
                                                        )}
                                                        {exception.exception_type === "custom_hours" && exception.start_time && (
                                                            <p className="text-muted-foreground text-xs">
                                                                {exception.start_time.slice(0, 5)} -{" "}
                                                                {exception.end_time?.slice(0, 5)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-1 pt-1">
                                                        <EditException
                                                            exception={exception}
                                                            onSuccess={() => refetch()}
                                                        />
                                                        <DeleteException
                                                            exception={exception}
                                                            onSuccess={() => refetch()}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                !isDisabled && (
                                                    <div className="text-xs text-muted-foreground">
                                                        <p>No exception</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium">Legend:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🚫</span>
                        <span className="text-xs">Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⏰</span>
                        <span className="text-xs">Custom Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <span className="text-xs">Holiday</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExceptionCalendarView
