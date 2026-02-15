import { type DoctorAvailabilityPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ViewAvailabilitySlotProps {
    availability: DoctorAvailabilityPublic
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const ViewAvailabilitySlot = ({ availability, open, onOpenChange }: ViewAvailabilitySlotProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Availability Slot Details</DialogTitle>
                    <DialogDescription>
                        View the details of this availability slot
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Day:</span>
                            <span className="col-span-2 font-medium capitalize">{availability.day_of_week}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Start Time:</span>
                            <span className="col-span-2 font-mono font-medium">{availability.start_time}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">End Time:</span>
                            <span className="col-span-2 font-mono font-medium">{availability.end_time}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Max Patients:</span>
                            <span className="col-span-2 font-medium">
                                {availability.max_patients_per_slot ? (
                                    availability.max_patients_per_slot
                                ) : (
                                    <span className="text-muted-foreground">Unlimited</span>
                                )}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="col-span-2">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${availability.is_available
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-red-500/10 text-red-500"
                                    }`}>
                                    {availability.is_available ? "Available" : "Unavailable"}
                                </span>
                            </span>
                        </div>
                        {availability.notes && (
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Notes:</span>
                                <p className="text-sm p-2 bg-muted rounded">{availability.notes}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Created:</span>
                            <span className="col-span-2 text-xs text-muted-foreground">
                                {formatDate(availability.created_at)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm text-muted-foreground">Updated:</span>
                            <span className="col-span-2 text-xs text-muted-foreground">
                                {formatDate(availability.updated_at)}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ViewAvailabilitySlot
