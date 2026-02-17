import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Edit } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DoctorAvailabilityService, type DoctorExceptionPublic, type ExceptionType } from "@/client"
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

interface EditExceptionProps {
    exception: DoctorExceptionPublic
    onSuccess?: () => void
}

const EditException = ({ exception, onSuccess }: EditExceptionProps) => {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            exception_type: exception.exception_type,
            start_time: exception.start_time ? exception.start_time.slice(0, 5) : "",
            end_time: exception.end_time ? exception.end_time.slice(0, 5) : "",
            reason: exception.reason || "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            const payload: any = {
                exception_type: data.exception_type,
                reason: data.reason || null,
            }

            // Only include times for custom_hours
            if (data.exception_type === "custom_hours") {
                payload.start_time = data.start_time ? `${data.start_time}:00` : undefined
                payload.end_time = data.end_time ? `${data.end_time}:00` : undefined
            }

            return await DoctorAvailabilityService.updateException({
                exceptionId: exception.id,
                requestBody: payload,
            })
        },
        onSuccess: () => {
            showSuccessToast("Exception updated successfully")
            queryClient.invalidateQueries({ queryKey: ["availability-exceptions"] })
            queryClient.invalidateQueries({ queryKey: ["availability-calendar"] })
            onSuccess?.()
        },
        onError: (error: any) => {
            const errorDetail = (error.body as any)?.detail || error.message || "Failed to update exception"
            showErrorToast(errorDetail)
        },
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Exception</DialogTitle>
                    <DialogDescription>
                        Modify the exception for {exception.exception_date}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="exception_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exception Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
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

                        {form.watch("exception_type") === "custom_hours" && (
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
                                Save Changes
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditException
