import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DoctorAvailabilityService, type ExceptionType } from "@/client"
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

const exceptionTypes: ExceptionType[] = ["unavailable", "custom_hours", "holiday"]

const formSchema = z
    .object({
        exception_date: z.string().refine(
            (date) => {
                const selectedDate = new Date(date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return selectedDate >= today
            },
            { message: "Exception date cannot be in the past" }
        ),
        exception_type: z.enum(exceptionTypes, { message: "Exception type is required" }),
        start_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format: HH:MM" }).optional().or(z.literal("")),
        end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format: HH:MM" }).optional().or(z.literal("")),
        reason: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.exception_type === "custom_hours") {
                return data.start_time && data.end_time
            }
            return true
        },
        {
            message: "Start time and end time required for custom hours",
            path: ["start_time"],
        }
    )
    .refine(
        (data) => {
            if (data.exception_type === "custom_hours" && data.start_time && data.end_time) {
                const [startHour, startMin] = data.start_time.split(":").map(Number)
                const [endHour, endMin] = data.end_time.split(":").map(Number)
                const startTotalMin = startHour * 60 + startMin
                const endTotalMin = endHour * 60 + endMin
                return startTotalMin < endTotalMin
            }
            return true
        },
        {
            message: "End time must be after start time",
            path: ["end_time"],
        }
    )

type FormData = z.infer<typeof formSchema>

interface AddExceptionProps {
    selectedDate?: Date;
    onSuccess?: () => void;
}

const AddException = ({ selectedDate, onSuccess }: AddExceptionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [showCustomHourFields, setShowCustomHourFields] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const defaultDate = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            exception_date: defaultDate,
            exception_type: "unavailable",
            start_time: "09:00",
            end_time: "17:00",
            reason: "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            const payload: any = {
                exception_date: data.exception_date,
                exception_type: data.exception_type,
                reason: data.reason || null,
            }

            // Only include times for custom_hours
            if (data.exception_type === "custom_hours") {
                payload.start_time = data.start_time ? `${data.start_time}:00` : undefined
                payload.end_time = data.end_time ? `${data.end_time}:00` : undefined
            }

            return await DoctorAvailabilityService.createException({
                requestBody: payload,
            })
        },
        onSuccess: () => {
            showSuccessToast("Exception created successfully")
            queryClient.invalidateQueries({ queryKey: ["availability-exceptions"] })
            queryClient.invalidateQueries({ queryKey: ["availability-calendar"] })
            form.reset()
            setIsOpen(false)
            onSuccess?.()
        },
        onError: (error: any) => {
            const errorDetail = (error.body as any)?.detail || error.message || "Failed to create exception"
            showErrorToast(errorDetail)
        },
    })

    const handleExceptionTypeChange = (value: ExceptionType) => {
        form.setValue("exception_type", value)
        setShowCustomHourFields(value === "custom_hours")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Exception
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Exception</DialogTitle>
                    <DialogDescription>
                        Set a date-specific exception to override the regular schedule
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="exception_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="exception_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exception Type</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={handleExceptionTypeChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select exception type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="unavailable">
                                                Unavailable (Not working)
                                            </SelectItem>
                                            <SelectItem value="custom_hours">
                                                Custom Hours (Different schedule)
                                            </SelectItem>
                                            <SelectItem value="holiday">
                                                Holiday
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {showCustomHourFields && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="start_time"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
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
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., Attending medical conference, vacation, etc."
                                            {...field}
                                            rows={3}
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
                                disabled={!form.formState.isValid}
                            >
                                Create Exception
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddException
