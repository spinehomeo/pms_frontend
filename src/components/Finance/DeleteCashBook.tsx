import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"

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
import useCustomToast from "@/hooks/useCustomToast"
import { type FinanceCashBook, FinanceApi } from "@/services/financeApi"
import { handleError } from "@/utils"

interface DeleteCashBookProps {
    cashBook: FinanceCashBook
}

const DeleteCashBook = ({ cashBook }: DeleteCashBookProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const mutation = useMutation({
        mutationFn: () => FinanceApi.deleteCashBook(cashBook.id),
        onSuccess: () => {
            showSuccessToast("Cashbook deleted successfully")
            queryClient.invalidateQueries({ queryKey: ["finance", "cash-books"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "doctor-summary"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "transactions"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "summary"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "balance"] })
            setIsOpen(false)
        },
        onError: handleError.bind(showErrorToast),
    })

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onClick={(event) => event.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Delete Cashbook</DialogTitle>
                    <DialogDescription>
                        This will permanently delete {cashBook.name} and all related transactions.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={mutation.isPending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteCashBook
