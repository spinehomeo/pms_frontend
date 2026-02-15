import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DoctorAvailabilityService, type DayOfWeek } from "@/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const daysOfWeek: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]

const formSchema = z.object({
    day_of_week: z.enum(daysOfWeek, { message: "Day is required" }),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format: HH:MM" }),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format: HH:MM" }),
    max_patients_per_slot: z.number().int().positive().nullable().optional(),
    notes: z.string().optional(),
}).refine(
    (data) => {
        const [startHour, startMin] = data.start_time.split(":").map(Number)
        const [endHour, endMin] = data.end_time.split(":").map(Number)
        const startTotalMin = startHour * 60 + startMin
        const endTotalMin = endHour * 60 + endMin
        return startTotalMin < endTotalMin
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    }
)

type FormData = z.infer<typeof formSchema>

const AddAvailabilitySlot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            day_of_week: "monday",
            start_time: "09:00",
            end_time: "12:00",
            max_patients_per_slot: null,
            notes: "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            return DoctorAvailabilityService.createAvailability({
                requestBody: {
                    day_of_week: data.day_of_week,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    max_patients_per_slot: data.max_patients_per_slot || null,
                    notes: data.notes || "",
                    is_available: true,
                },
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["availabilities"] })
            showSuccessToast("Availability slot created successfully")
            setIsOpen(false)
            form.reset()
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    const onSubmit = async (data: FormData) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Slot
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Availability Slot</DialogTitle>
                    <DialogDescription>
                        Create a new time slot for your availability
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="day_of_week"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day of Week</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select day" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {daysOfWeek.map((day) => (
                                                <SelectItem key={day} value={day}>
                                                    <span className="capitalize">{day}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                placeholder="09:00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                placeholder="12:00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="max_patients_per_slot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Patients per Slot (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Leave empty for unlimited"
                                            {...field}
                                            value={field.value || ""}
                                            onChange={(e) =>
                                                field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any notes about this slot..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <LoadingButton
                                type="submit"
                                loading={mutation.isPending}
                                disabled={mutation.isPending}
                            >
                                Create Slot
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddAvailabilitySlot
