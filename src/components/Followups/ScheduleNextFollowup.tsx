import { Calendar } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { FollowupsService } from "@/client"
import type { FollowUpPublic } from "@/client/FollowupsService"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
    next_date: z.string().min(1, { message: "Date is required" }),
})

type FormData = z.infer<typeof formSchema>

interface ScheduleNextFollowupProps {
    followup: FollowUpPublic
    onSuccess: () => void
}

const ScheduleNextFollowup = ({ followup, onSuccess }: ScheduleNextFollowupProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    // Default next date is 30 days from today
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            next_date: defaultDate.toISOString().split("T")[0],
        },
    })

    const mutation = useMutation({
        mutationFn: (data: { next_date: string }) =>
            FollowupsService.scheduleNextFollowup({ followupId: followup.id, next_date: data.next_date }),
        onSuccess: () => {
            showSuccessToast("Next follow-up scheduled successfully")
            setIsOpen(false)
            onSuccess()
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["followups"] })
        },
    })

    const onSubmit = (data: FormData) => {
        mutation.mutate({ next_date: data.next_date })
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsOpen(true)}
            >
                <Calendar />
                Schedule Next Follow-up
            </DropdownMenuItem>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Schedule Next Follow-up</DialogTitle>
                        <DialogDescription>
                            Set the date for the next follow-up appointment
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-4 py-4">
                                <div className="bg-muted p-3 rounded-md text-sm">
                                    <p><strong>Patient:</strong> {followup.patient_name || "Unknown"}</p>
                                    <p><strong>Case:</strong> {followup.case_number || followup.case_id.slice(0, 8)}</p>
                                    <p><strong>Current Follow-up:</strong> {new Date(followup.follow_up_date).toLocaleDateString()}</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="next_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Next Follow-up Date <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    min={new Date().toISOString().split("T")[0]}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" disabled={mutation.isPending}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <LoadingButton type="submit" loading={mutation.isPending}>
                                    Schedule
                                </LoadingButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ScheduleNextFollowup
