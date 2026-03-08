import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import AddTransaction from "@/components/Finance/AddTransaction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useAuth from "@/hooks/useAuth"
import { FinanceApi } from "@/services/financeApi"

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 2,
    }).format(value)

export const Route = createFileRoute("/_layout/finance/$cashBookId")({
    component: CashBookDetails,
    head: () => ({
        meta: [
            {
                title: "Finance Cashbook - FastAPI Cloud",
            },
        ],
    }),
})

function CashBookDetails() {
    const { user: currentUser } = useAuth()
    const navigate = useNavigate({ from: "/finance/$cashBookId" })
    const { cashBookId } = Route.useParams()

    const isDoctor =
        (currentUser as { role?: string; is_doctor?: boolean } | null)?.role === "doctor" ||
        (currentUser as { role?: string; is_doctor?: boolean } | null)?.is_doctor === true

    const cashBookQuery = useQuery({
        queryKey: ["finance", "cash-book", cashBookId],
        queryFn: () => FinanceApi.getCashBook(cashBookId),
        enabled: isDoctor,
    })

    const transactionsQuery = useQuery({
        queryKey: ["finance", "transactions", cashBookId],
        queryFn: () =>
            FinanceApi.listTransactions({
                cash_book_id: cashBookId,
                skip: 0,
                limit: 200,
            }),
        enabled: isDoctor,
    })

    const cashBookSummaryQuery = useQuery({
        queryKey: ["finance", "summary", cashBookId],
        queryFn: () => FinanceApi.getCashBookSummary(cashBookId),
        enabled: isDoctor,
    })

    if (!isDoctor) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Finance module is only available for doctors.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {cashBookQuery.data?.name ?? "Cashbook"}
                    </h1>
                    <p className="text-muted-foreground">View and manage selected cashbook transactions.</p>
                </div>
                <Button variant="outline" onClick={() => navigate({ to: "/finance" })}>
                    Back to Cashbooks
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cashbook Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Net Balance</p>
                            <p className="text-xl font-semibold">
                                {formatCurrency(cashBookSummaryQuery.data?.net_balance ?? 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Cash In</p>
                            <p className="text-xl font-semibold">
                                {formatCurrency(cashBookSummaryQuery.data?.total_cash_in ?? 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Cash Out</p>
                            <p className="text-xl font-semibold">
                                {formatCurrency(cashBookSummaryQuery.data?.total_cash_out ?? 0)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <CardTitle className="shrink-0">Transactions</CardTitle>
                    <div className="flex flex-1 items-center justify-center gap-4">
                        <AddTransaction cashBookId={cashBookId} triggerLabel="Cash In" fixedNatureCode="CASH_IN" triggerClassName="min-w-[200px]" />
                        <AddTransaction cashBookId={cashBookId} triggerLabel="Cash Out" fixedNatureCode="CASH_OUT" triggerVariant="destructive" triggerClassName="min-w-[200px]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Nature</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Running Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(transactionsQuery.data?.data?.length ?? 0) > 0 ? (
                                    (transactionsQuery.data?.data ?? []).map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{transaction.transaction_date}</TableCell>
                                            <TableCell>{transaction.remarks || "-"}</TableCell>
                                            <TableCell>{transaction.category_code}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.nature_code === "CASH_IN" ? "default" : "secondary"
                                                    }
                                                >
                                                    {transaction.nature_code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(transaction.running_balance)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            {transactionsQuery.isLoading ? "Loading transactions..." : "No transactions found."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
