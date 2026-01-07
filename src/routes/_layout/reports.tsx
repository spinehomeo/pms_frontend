import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { FileText, Calendar, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"

import { ReportsService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/_layout/reports")({
  component: Reports,
  head: () => ({
    meta: [
      {
        title: "Reports - FastAPI Cloud",
      },
    ],
  }),
})

function Reports() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const [activeTab, setActiveTab] = useState("alerts")

  // Appointment Statistics
  const { data: appointmentStats, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ["reports-appointments", fromDate, toDate],
    queryFn: () => ReportsService.getAppointmentStatistics(fromDate || undefined, toDate || undefined),
    enabled: activeTab === "appointments",
    retry: false,
    throwOnError: false,
  })

  // Medicine Usage
  const { data: medicineUsage, isLoading: loadingMedicine, refetch: refetchMedicine } = useQuery({
    queryKey: ["reports-medicine-usage", fromDate, toDate],
    queryFn: () => ReportsService.getMedicineUsageReport(fromDate || undefined, toDate || undefined),
    enabled: activeTab === "medicines",
    retry: false,
    throwOnError: false,
  })

  // Prescription Analysis
  const { data: prescriptionAnalysis, isLoading: loadingPrescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ["reports-prescriptions", fromDate, toDate],
    queryFn: () => ReportsService.getPrescriptionAnalysis(fromDate || undefined, toDate || undefined),
    enabled: activeTab === "prescriptions",
    retry: false,
    throwOnError: false,
  })

  // Financial Summary
  const { data: financialSummary, isLoading: loadingFinancial, refetch: refetchFinancial } = useQuery({
    queryKey: ["reports-financial", fromDate, toDate],
    queryFn: () => ReportsService.getFinancialSummary(fromDate || undefined, toDate || undefined),
    enabled: activeTab === "financial",
    retry: false,
    throwOnError: false,
  })

  // Expiry Alerts
  const { data: expiryAlerts, isLoading: loadingExpiry } = useQuery({
    queryKey: ["reports-expiry"],
    queryFn: () => ReportsService.getExpiryAlerts(30),
    retry: false,
    throwOnError: false,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">View analytics and reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select date range for reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alerts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments">
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="medicines">
            <TrendingUp className="mr-2 h-4 w-4" />
            Medicine Usage
          </TabsTrigger>
          <TabsTrigger value="prescriptions">
            <FileText className="mr-2 h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>View appointment analytics</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <Skeleton className="h-64 w-full" />
              ) : appointmentStats && typeof appointmentStats === 'object' && 'summary' in appointmentStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold">{(appointmentStats as any).summary?.total_appointments || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-2xl font-bold">{(appointmentStats as any).summary?.total_hours || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Patients</p>
                      <p className="text-2xl font-bold">{(appointmentStats as any).summary?.unique_patients || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                      <p className="text-2xl font-bold">{(appointmentStats as any).summary?.cancellation_rate || 0}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No data available for the selected date range</p>
                  <Button
                    className="mt-4"
                    onClick={() => refetchAppointments()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Usage Report</CardTitle>
              <CardDescription>View medicine consumption analytics</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMedicine ? (
                <Skeleton className="h-64 w-full" />
              ) : medicineUsage && typeof medicineUsage === 'object' && 'summary' in medicineUsage ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Usage</p>
                      <p className="text-2xl font-bold">{(medicineUsage as any).summary?.total_usage || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                      <p className="text-2xl font-bold">{(medicineUsage as any).summary?.total_patients || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Medicines</p>
                      <p className="text-2xl font-bold">{(medicineUsage as any).summary?.total_medicines || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No data available for the selected date range</p>
                  <Button
                    className="mt-4"
                    onClick={() => refetchMedicine()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Analysis</CardTitle>
              <CardDescription>View prescription patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPrescriptions ? (
                <Skeleton className="h-64 w-full" />
              ) : prescriptionAnalysis && typeof prescriptionAnalysis === 'object' && 'summary' in prescriptionAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                      <p className="text-2xl font-bold">{(prescriptionAnalysis as any).summary?.total_prescriptions || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Medicines</p>
                      <p className="text-2xl font-bold">{(prescriptionAnalysis as any).summary?.total_medicines_prescribed || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Prescription</p>
                      <p className="text-2xl font-bold">
                        {(prescriptionAnalysis as any).summary?.average_medicines_per_prescription || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No data available for the selected date range</p>
                  <Button
                    className="mt-4"
                    onClick={() => refetchPrescriptions()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>View revenue and costs</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFinancial ? (
                <Skeleton className="h-64 w-full" />
              ) : financialSummary && typeof financialSummary === 'object' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{(financialSummary as any).revenue?.total_revenue || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Costs</p>
                      <p className="text-2xl font-bold">₹{(financialSummary as any).costs?.total_costs || 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No data available for the selected date range</p>
                  <Button
                    className="mt-4"
                    onClick={() => refetchFinancial()}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expiry Alerts</CardTitle>
              <CardDescription>Medicines expiring soon</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpiry ? (
                <Skeleton className="h-64 w-full" />
              ) : expiryAlerts && typeof expiryAlerts === 'object' && 'summary' in expiryAlerts ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Expiring Soon (1-7 days)</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {(expiryAlerts as any).summary?.expiring_soon_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiring Later (8-30 days)</p>
                      <p className="text-2xl font-bold text-yellow-500">
                        {(expiryAlerts as any).summary?.expiring_later_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Already Expired</p>
                      <p className="text-2xl font-bold text-red-500">
                        {(expiryAlerts as any).summary?.expired_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-64 w-full" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
