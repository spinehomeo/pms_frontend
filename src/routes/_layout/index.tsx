import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  Users,
  FolderOpen,
  Calendar,
  FileText,
  CalendarClock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowDownCircle,
  Scale,
  Receipt,
} from "lucide-react"
import { Suspense } from "react"

import { DoctorStatisticsService } from "@/client"
import { FinanceApi } from "@/services/financeApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import useAuth from "@/hooks/useAuth"

function getStatsQueryOptions() {
  return {
    queryFn: () => DoctorStatisticsService.getDoctorStats(),
    queryKey: ["doctor-stats"],
  }
}

function getFinanceSummaryQueryOptions() {
  return {
    queryFn: () => FinanceApi.getDoctorSummary(),
    queryKey: ["finance", "doctor-summary"],
  }
}

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Cloud",
      },
    ],
  }),
})

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-25" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-15" />
            <Skeleton className="h-3 w-30 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DoctorStatsContent() {
  const { data: stats } = useSuspenseQuery(getStatsQueryOptions())
  const { data: financeSummary } = useSuspenseQuery(getFinanceSummaryQueryOptions())

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats.total_patients ?? 0}
          icon={<Users className="h-4 w-4" />}
          description="Patients under your care"
        />
        <StatCard
          title="Total Cases"
          value={stats.total_cases ?? 0}
          icon={<FolderOpen className="h-4 w-4" />}
          description="Cases managed"
        />
        <StatCard
          title="Total Appointments"
          value={stats.total_appointments ?? 0}
          icon={<Calendar className="h-4 w-4" />}
          description="All appointments"
        />
        <StatCard
          title="Total Prescriptions"
          value={stats.total_prescriptions ?? 0}
          icon={<FileText className="h-4 w-4" />}
          description="Prescriptions issued"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(financeSummary.total_cash_in ?? 0)}
          icon={<Wallet className="h-4 w-4" />}
          description="All cash books combined"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financeSummary.total_cash_out ?? 0)}
          icon={<ArrowDownCircle className="h-4 w-4" />}
          description="All cash out transactions"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(financeSummary.net_balance ?? 0)}
          icon={<Scale className="h-4 w-4" />}
          description="Income minus expenses"
        />
        <StatCard
          title="Transactions"
          value={financeSummary.transaction_count ?? 0}
          icon={<Receipt className="h-4 w-4" />}
          description="Total finance entries"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcoming_appointments ?? 0}
          icon={<CalendarClock className="h-4 w-4" />}
          description="Scheduled for today or later"
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats.pending_followups ?? 0}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Follow-up appointments due"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_items ?? 0}
          icon={<AlertCircle className="h-4 w-4" />}
          description="Remidies items low in stock"
        />
        <StatCard
          title="Revenue This Month"
          value={`Rs. ${(stats.revenue_this_month ?? 0).toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          description="Total earnings this month"
        />
      </div>
    </div>
  )
}

function DoctorStats() {
  return (
    <Suspense fallback={<StatsLoadingSkeleton />}>
      <DoctorStatsContent />
    </Suspense>
  )
}

function Dashboard() {
  const { user: currentUser } = useAuth()

  // Check if user is a doctor
  const isDoctor = (currentUser as any)?.role === "doctor" || (currentUser as any)?.is_doctor === true

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email} 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!
        </p>
      </div>

      {isDoctor && <DoctorStats />}

      {!isDoctor && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Dashboard statistics are only available for doctors.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

