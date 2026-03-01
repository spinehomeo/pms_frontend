import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { type FinanceCashBook, FinanceApi } from "@/services/financeApi"
import { handleError } from "@/utils"

const formSchema = z.object({
    name: z.string().min(1, "Book name is required").max(100, "Book name is too long"),
    description: z.string().max(500, "Description is too long").optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditCashBookProps {
    cashBook: FinanceCashBook
}

const EditCashBook = ({ cashBook }: EditCashBookProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        values: {
            name: cashBook.name,
            description: cashBook.description ?? "",
        },
    })

    const mutation = useMutation({
        mutationFn: (payload: FormData) =>
            FinanceApi.updateCashBook(cashBook.id, {
                name: payload.name,
                description: payload.description,
            }),
        onSuccess: () => {
            showSuccessToast("Cash book updated successfully")
            queryClient.invalidateQueries({ queryKey: ["finance", "cash-books"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "doctor-summary"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "summary", cashBook.id] })
            queryClient.invalidateQueries({ queryKey: ["finance", "balance", cashBook.id] })
            setIsOpen(false)
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        mutation.mutate({
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button" onClick={(event) => event.stopPropagation()}>
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" onClick={(event) => event.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Edit Cashbook</DialogTitle>
                    <DialogDescription>
                        Update cashbook name or description.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Book Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Medicine Book" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Optional description"
                                            rows={3}
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={mutation.isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={mutation.isPending}>
                                Save Changes
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditCashBook
