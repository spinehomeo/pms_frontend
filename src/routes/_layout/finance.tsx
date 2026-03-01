import { useQuery } from "@tanstack/react-query"
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router"

import AddCashBook from "@/components/Finance/AddCashBook"
import DeleteCashBook from "@/components/Finance/DeleteCashBook"
import EditCashBook from "@/components/Finance/EditCashBook"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"
import { FinanceApi } from "@/services/financeApi"

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(value)

export const Route = createFileRoute("/_layout/finance")({
    component: Finance,
    head: () => ({
        meta: [
            {
                title: "Finance - FastAPI Cloud",
            },
        ],
    }),
})

function Finance() {
    const { user: currentUser } = useAuth()
    const navigate = useNavigate({ from: "/finance" })
    const currentPath = useRouterState({
        select: (state) => state.location.pathname,
    })

    const isDoctor =
        (currentUser as { role?: string; is_doctor?: boolean } | null)?.role === "doctor" ||
        (currentUser as { role?: string; is_doctor?: boolean } | null)?.is_doctor === true

    const cashBooksQuery = useQuery({
        queryKey: ["finance", "cash-books"],
        queryFn: () => FinanceApi.listCashBooks({ active_only: true, skip: 0, limit: 100 }),
        enabled: isDoctor,
    })

    const doctorSummaryQuery = useQuery({
        queryKey: ["finance", "doctor-summary"],
        queryFn: () => FinanceApi.getDoctorSummary(),
        enabled: isDoctor,
    })

    const balanceByBookId = new Map(
        (doctorSummaryQuery.data?.books ?? []).map((book) => [book.cash_book_id, book.current_balance]),
    )

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

    if (currentPath !== "/finance") {
        return <Outlet />
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
                    <p className="text-muted-foreground">Select a cashbook to view its transactions.</p>
                </div>
                <AddCashBook />
            </div>

            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Cash In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(doctorSummaryQuery.data?.total_cash_in ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(doctorSummaryQuery.data?.total_cash_out ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(doctorSummaryQuery.data?.net_balance ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{doctorSummaryQuery.data?.transaction_count ?? 0}</div>
                    </CardContent>
                </Card>
            </div> */}

            {cashBooksQuery.isLoading ? (
                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                    Loading cashbooks...
                </div>
            ) : (cashBooksQuery.data?.data?.length ?? 0) === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                    No cashbooks yet. Create one to start recording transactions.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(cashBooksQuery.data?.data ?? []).map((book) => (
                        <Card
                            key={book.id}
                            className="cursor-pointer"
                            onClick={() =>
                                navigate({
                                    to: "/finance/$cashBookId",
                                    params: { cashBookId: book.id },
                                })
                            }
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{book.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Balance</p>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(balanceByBookId.get(book.id) ?? 0)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                                    <EditCashBook cashBook={book} />
                                    <DeleteCashBook cashBook={book} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
