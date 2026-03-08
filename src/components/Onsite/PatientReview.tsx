import { useQuery } from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"

import { PatientsService } from "@/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Skeleton } from "@/components/ui/skeleton"

interface PatientReviewProps {
    patientId: string
    onBack: () => void
    onProceedToConsultation: () => void
}

export function PatientReview({ patientId, onBack, onProceedToConsultation }: PatientReviewProps) {
    const {
        data: patient,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["onsite-patient", patientId],
        queryFn: () => PatientsService.onsiteGetDetails({ patientId }),
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error || !patient) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <p className="text-destructive">
                        {error?.message || "Patient not found"}
                    </p>
                    <Button variant="outline" onClick={onBack} className="mt-4">
                        Back to Search
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Review</CardTitle>
                <CardDescription>
                    Review patient information before proceeding to consultation
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {patient.is_temp_cnic && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This patient has a temporary CNIC ({patient.cnic}). It can be
                            updated later.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Full Name" value={patient.full_name} />
                    <DetailField label="Phone" value={patient.phone} />
                    <DetailField
                        label="Gender"
                        value={
                            <Badge variant="outline" className="capitalize">
                                {patient.gender || "Not specified"}
                            </Badge>
                        }
                    />
                    <DetailField label="CNIC" value={patient.cnic} />
                    <DetailField
                        label="Date of Birth"
                        value={patient.date_of_birth || "Not provided"}
                    />
                    <DetailField label="Email" value={patient.email || "Not provided"} />
                    <DetailField label="City" value={patient.city || "Not provided"} />
                    <DetailField
                        label="Status"
                        value={
                            <Badge variant={patient.is_active ? "default" : "secondary"}>
                                {patient.is_active ? "Active" : "Inactive"}
                            </Badge>
                        }
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Medical Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailField
                            label="Medical History"
                            value={patient.medical_history || "None"}
                        />
                        <DetailField
                            label="Drug Allergies"
                            value={patient.drug_allergies || "None"}
                        />
                        <DetailField
                            label="Family History"
                            value={patient.family_history || "None"}
                        />
                        <DetailField
                            label="Current Medications"
                            value={patient.current_medications || "None"}
                        />
                    </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>
                        Back to Search
                    </Button>
                    <Button onClick={onProceedToConsultation}>
                        Proceed to Consultation
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function DetailField({
    label,
    value,
}: {
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-sm">{value}</div>
        </div>
    )
}
