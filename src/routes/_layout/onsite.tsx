import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import type { OnsiteConsultationResponse } from "@/client/OnsiteConsultationService"
import type {
    OnsitePatientDetails,
    OnsiteSearchResult,
} from "@/client/PatientsService"
import { ConsultationForm } from "@/components/Onsite/ConsultationForm"
import { ConsultationSuccess } from "@/components/Onsite/ConsultationSuccess"
import { PatientReview } from "@/components/Onsite/PatientReview"
import { QuickRegister } from "@/components/Onsite/QuickRegister"
import { SearchPatient } from "@/components/Onsite/SearchPatient"
import { type Step, StepIndicator } from "@/components/Onsite/StepIndicator"

export const Route = createFileRoute("/_layout/onsite")({
    component: Onsite,
    head: () => ({
        meta: [{ title: "Onsite Patient - FastAPI Cloud" }],
    }),
})

function Onsite() {
    const [step, setStep] = useState<Step>("search")
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
        null,
    )
    const [selectedPatientName, setSelectedPatientName] = useState("")
    const [selectedPatientPhone, setSelectedPatientPhone] = useState("")
    const [prefillPhone, setPrefillPhone] = useState("")
    const [prefillName, setPrefillName] = useState("")
    const [consultationResult, setConsultationResult] =
        useState<OnsiteConsultationResponse | null>(null)

    const handleSelectPatient = (patient: OnsiteSearchResult) => {
        setSelectedPatientId(patient.id)
        setSelectedPatientName(patient.full_name)
        setSelectedPatientPhone(patient.phone)
        setStep("review")
    }

    const handleRegisterNew = (phone?: string, name?: string) => {
        setPrefillPhone(phone || "")
        setPrefillName(name || "")
        setStep("register")
    }

    const handleRegistered = (patient: OnsitePatientDetails) => {
        setSelectedPatientId(patient.id)
        setSelectedPatientName(patient.full_name)
        setSelectedPatientPhone(patient.phone)
        setStep("review")
    }

    const handleProceedToConsultation = () => {
        setStep("consultation")
    }

    const handleConsultationSuccess = (result: OnsiteConsultationResponse) => {
        setConsultationResult(result)
    }

    const handleBackToSearch = () => {
        setSelectedPatientId(null)
        setSelectedPatientName("")
        setSelectedPatientPhone("")
        setConsultationResult(null)
        setStep("search")
    }

    const handleBackToReview = () => {
        setConsultationResult(null)
        setStep("review")
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Onsite Patient</h1>
                    <p className="text-muted-foreground">
                        Search, register, and consult walk-in patients
                    </p>
                </div>
                <StepIndicator currentStep={step} />
            </div>

            {step === "search" && (
                <SearchPatient
                    onSelectPatient={handleSelectPatient}
                    onRegisterNew={handleRegisterNew}
                />
            )}

            {step === "register" && (
                <QuickRegister
                    defaultPhone={prefillPhone}
                    defaultName={prefillName}
                    onSuccess={handleRegistered}
                    onBack={handleBackToSearch}
                />
            )}

            {step === "review" && selectedPatientId && (
                <PatientReview
                    patientId={selectedPatientId}
                    onBack={handleBackToSearch}
                    onProceedToConsultation={handleProceedToConsultation}
                />
            )}

            {step === "consultation" && !consultationResult && (
                <ConsultationForm
                    patientName={selectedPatientName}
                    patientPhone={selectedPatientPhone}
                    onBack={handleBackToReview}
                    onSuccess={handleConsultationSuccess}
                />
            )}

            {step === "consultation" && consultationResult && (
                <ConsultationSuccess
                    result={consultationResult}
                    onNewConsultation={handleBackToSearch}
                />
            )}
        </div>
    )
}
