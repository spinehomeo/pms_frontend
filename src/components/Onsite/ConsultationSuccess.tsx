import { CheckCircle } from "lucide-react"

import type { OnsiteConsultationResponse } from "@/client/OnsiteConsultationService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ConsultationSuccessProps {
    result: OnsiteConsultationResponse
    onNewConsultation: () => void
}

export function ConsultationSuccess({
    result,
    onNewConsultation,
}: ConsultationSuccessProps) {
    return (
        <Card>
            <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <CardTitle>Consultation Created Successfully</CardTitle>
                <CardDescription>
                    All records have been created for {result.patient_full_name}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SummaryField
                        label="Patient"
                        value={result.patient_full_name}
                        extra={
                            <Badge variant={result.is_new_patient ? "default" : "secondary"}>
                                {result.is_new_patient ? "New" : "Existing"}
                            </Badge>
                        }
                    />
                    <SummaryField
                        label="Appointment"
                        value={`${result.appointment_date} at ${result.appointment_time}`}
                        extra={
                            <Badge variant="outline" className="capitalize">
                                {result.consultation_type}
                            </Badge>
                        }
                    />
                    <SummaryField
                        label="Case Number"
                        value={result.case_number}
                    />
                    <SummaryField
                        label="Case Date"
                        value={result.case_date}
                    />
                    {result.prescription_number && (
                        <SummaryField
                            label="Prescription"
                            value={result.prescription_number}
                        />
                    )}
                    {result.next_follow_up_date && (
                        <SummaryField
                            label="Next Follow-up"
                            value={result.next_follow_up_date}
                            extra={
                                <Badge variant="outline" className="capitalize">
                                    {result.follow_up_status}
                                </Badge>
                            }
                        />
                    )}
                </div>

                <Separator />

                <div className="flex justify-center">
                    <Button onClick={onNewConsultation}>
                        Start New Consultation
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function SummaryField({
    label,
    value,
    extra,
}: {
    label: string
    value: string
    extra?: React.ReactNode
}) {
    return (
        <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{value}</p>
                {extra}
            </div>
        </div>
    )
}
