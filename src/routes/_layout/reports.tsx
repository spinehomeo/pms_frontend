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

  // Remidies Usage
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
            Remidies Usage
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
              ) : appointmentStats?.data && appointmentStats.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold">
                        {appointmentStats.data.reduce((sum, item) => sum + item.total_appointments, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">
                        {appointmentStats.data.reduce((sum, item) => sum + item.completed_appointments, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cancelled</p>
                      <p className="text-2xl font-bold">
                        {appointmentStats.data.reduce((sum, item) => sum + item.cancelled_appointments, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">No Show</p>
                      <p className="text-2xl font-bold">
                        {appointmentStats.data.reduce((sum, item) => sum + item.no_show_appointments, 0)}
                      </p>
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
              <CardTitle>Remidies Usage Report</CardTitle>
              <CardDescription>View remidies consumption analytics</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMedicine ? (
                <Skeleton className="h-64 w-full" />
              ) : medicineUsage?.data && medicineUsage.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Usage</p>
                      <p className="text-2xl font-bold">
                        {medicineUsage.data.reduce((sum, item) => sum + item.total_quantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                      <p className="text-2xl font-bold">
                        {medicineUsage.data.reduce((sum, item) => sum + item.prescription_count, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Remidies</p>
                      <p className="text-2xl font-bold">
                        {new Set(medicineUsage.data.map(item => item.medicine_name)).size}
                      </p>
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
              ) : prescriptionAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                      <p className="text-2xl font-bold">{prescriptionAnalysis.total_prescriptions || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Remidies</p>
                      <p className="text-2xl font-bold">{prescriptionAnalysis.unique_medicines || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Prescription</p>
                      <p className="text-2xl font-bold">
                        {prescriptionAnalysis.avg_medicines_per_prescription?.toFixed(1) || 0}
                      </p>
                    </div>
                  </div>
                  {prescriptionAnalysis.top_medicines && prescriptionAnalysis.top_medicines.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Top Remidies</p>
                      <div className="space-y-2">
                        {prescriptionAnalysis.top_medicines.slice(0, 5).map((med) => (
                          <div key={med.medicine_name} className="flex justify-between items-center">
                            <span className="text-sm">{med.medicine_name}</span>
                            <span className="text-sm font-semibold">{med.usage_count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              ) : financialSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{financialSummary.total_revenue || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold">{financialSummary.total_appointments || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Appointment</p>
                      <p className="text-2xl font-bold">₹{financialSummary.avg_revenue_per_appointment?.toFixed(2) || 0}</p>
                    </div>
                  </div>
                  {financialSummary.revenue_by_period && financialSummary.revenue_by_period.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Revenue by Period</p>
                      <div className="space-y-2">
                        {financialSummary.revenue_by_period.map((period) => (
                          <div key={period.period} className="flex justify-between items-center">
                            <span className="text-sm">{period.period}</span>
                            <div className="text-right">
                              <span className="text-sm font-semibold">₹{period.revenue}</span>
                              <span className="text-xs text-muted-foreground ml-2">({period.appointment_count} appts)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              <CardDescription>Remidies expiring soon</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpiry ? (
                <Skeleton className="h-64 w-full" />
              ) : expiryAlerts ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Days Threshold</p>
                      <p className="text-2xl font-bold">{expiryAlerts.days_threshold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expiring Items</p>
                      <p className="text-2xl font-bold text-orange-500">{expiryAlerts.total_items}</p>
                    </div>
                  </div>
                  {expiryAlerts.items && expiryAlerts.items.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Expiring Remidies</p>
                      <div className="space-y-2">
                        {expiryAlerts.items.slice(0, 10).map((item) => (
                          <div key={`${item.medicine_id}-${item.batch_number}`} className="flex justify-between items-center p-2 rounded-md bg-orange-50 dark:bg-orange-950">
                            <div>
                              <span className="text-sm font-medium">{item.medicine_name}</span>
                              <span className="text-xs text-muted-foreground ml-2">Batch: {item.batch_number}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {item.days_until_expiry} days
                              </p>
                              <p className="text-xs text-muted-foreground">{item.expiry_date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
