import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { DoctorAvailabilityService } from "@/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import AddException from "./AddException"
import EditException from "./EditException"
import DeleteException from "./DeleteException"

interface ExceptionsListViewProps {
    onRefresh?: () => void
}

const ExceptionsListView = ({ onRefresh }: ExceptionsListViewProps) => {
    const { data: exceptions = [], refetch, isLoading } = useQuery({
        queryFn: async () => {
            // Get exceptions for the next 90 days
            const today = new Date()
            const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

            const response = await DoctorAvailabilityService.listExceptions({
                start_date: format(today, "yyyy-MM-dd"),
                end_date: format(endDate, "yyyy-MM-dd"),
                limit: 100,
            })
            return response.data.sort(
                (a, b) => new Date(a.exception_date).getTime() - new Date(b.exception_date).getTime()
            )
        },
        queryKey: ["availability-exceptions-list"],
    })

    const handleSuccess = () => {
        refetch()
        onRefresh?.()
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

    const getExceptionBadgeVariant = (type: string) => {
        switch (type) {
            case "unavailable":
                return "destructive"
            case "custom_hours":
                return "secondary"
            case "holiday":
                return "default"
            default:
                return "outline"
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Upcoming Exceptions</CardTitle>
                        <CardDescription>
                            {exceptions.length} exception{exceptions.length !== 1 ? "s" : ""} in the next 90 days
                        </CardDescription>
                    </div>
                    <AddException onSuccess={handleSuccess} />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                ) : exceptions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No exceptions scheduled</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exceptions.map((exception) => (
                            <div
                                key={exception.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                    exception.is_active ? "bg-muted/50" : "bg-muted/20 opacity-60"
                                )}
                            >
                                {/* Icon */}
                                <div className="text-2xl shrink-0 mt-1">
                                    {getExceptionIcon(exception.exception_type)}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {format(new Date(exception.exception_date), "MMM dd, yyyy")}
                                        </span>
                                        <Badge
                                            variant={getExceptionBadgeVariant(exception.exception_type) as any}
                                            className="text-xs capitalize"
                                        >
                                            {exception.exception_type.replace("_", " ")}
                                        </Badge>
                                        {!exception.is_active && (
                                            <Badge variant="outline" className="text-xs">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Time info for custom_hours */}
                                    {exception.exception_type === "custom_hours" && exception.start_time && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {exception.start_time.slice(0, 5)} - {exception.end_time?.slice(0, 5)}
                                        </p>
                                    )}

                                    {/* Reason */}
                                    {exception.reason && (
                                        <p className="text-sm text-muted-foreground mt-1 truncate">
                                            {exception.reason}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 shrink-0">
                                    <EditException exception={exception} onSuccess={handleSuccess} />
                                    <DeleteException exception={exception} onSuccess={handleSuccess} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ExceptionsListView
