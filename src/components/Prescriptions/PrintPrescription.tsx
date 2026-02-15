import { Printer } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { PrescriptionsService } from "@/client"
import type { PrescriptionPublic } from "@/client/PrescriptionsService"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface PrintPrescriptionProps {
    prescription: PrescriptionPublic
}

const PrintPrescription = ({ prescription }: PrintPrescriptionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const { showErrorToast } = useCustomToast()

    const { data: printData, isLoading, error } = useQuery({
        queryKey: ["print-prescription", prescription.id],
        queryFn: () => PrescriptionsService.printPrescription(prescription.id),
        enabled: isOpen,
        retry: false,
    })

    if (error) {
        handleError.call(showErrorToast, error as any)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <>
            <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={() => setIsOpen(true)}
            >
                <Printer />
                Print Prescription
            </DropdownMenuItem>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-full">
                    <DialogHeader className="print:hidden">
                        <DialogTitle>Print Prescription</DialogTitle>
                        <DialogDescription>
                            Review and print prescription
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Loading prescription details...
                        </div>
                    ) : printData ? (
                        <div className="space-y-6 py-4 print:py-0">
                            {/* Print Header */}
                            <div className="text-center border-b pb-4 print:border-b-2">
                                <h1 className="text-2xl font-bold">PRESCRIPTION</h1>
                                <p className="text-sm text-muted-foreground print:text-black">
                                    {printData.doctor.full_name}
                                </p>
                            </div>

                            {/* Prescription Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground print:text-black">Rx No.</p>
                                    <p className="text-sm font-mono font-semibold">{printData.prescription.prescription_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground print:text-black">Date</p>
                                    <p className="text-sm">{new Date(printData.print_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="border-t pt-4 print:border-t-2">
                                <p className="text-xs font-medium text-muted-foreground print:text-black">Patient Name</p>
                                <p className="text-lg font-semibold">{printData.patient.full_name}</p>
                            </div>

                            <Separator className="print:border-t" />

                            {/* Remidies */}
                            <div>
                                <p className="text-sm font-semibold mb-3 print:text-base">Remidies Prescribed:</p>
                                <div className="space-y-3">
                                    {printData.medicines.map((medicine, index) => (
                                        <div key={index} className="pl-4 border-l-2 border-primary/20 print:border-black">
                                            <p className="font-medium print:text-base">
                                                {index + 1}. {medicine.name} - {medicine.potency} ({medicine.form})
                                            </p>
                                            <div className="mt-1 space-y-1 text-sm text-muted-foreground print:text-black">
                                                <p><span className="font-medium">Dosage:</span> {medicine.dosage}</p>
                                                <p><span className="font-medium">Duration:</span> {medicine.duration}</p>
                                                {medicine.instructions && (
                                                    <p><span className="font-medium">Instructions:</span> {medicine.instructions}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {printData.prescription.follow_up_advice && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Follow-up Advice:</p>
                                    <p className="text-sm whitespace-pre-wrap">{printData.prescription.follow_up_advice}</p>
                                </div>
                            )}

                            {printData.prescription.dietary_restrictions && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Dietary Restrictions:</p>
                                    <p className="text-sm whitespace-pre-wrap">{printData.prescription.dietary_restrictions}</p>
                                </div>
                            )}

                            {printData.prescription.avoidance && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Avoidance:</p>
                                    <p className="text-sm whitespace-pre-wrap">{printData.prescription.avoidance}</p>
                                </div>
                            )}

                            {printData.prescription.notes && (
                                <div>
                                    <p className="text-sm font-semibold mb-2">Notes:</p>
                                    <p className="text-sm whitespace-pre-wrap">{printData.prescription.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="border-t pt-4 mt-8 text-center print:border-t-2 print:mt-12">
                                <p className="text-sm font-medium">{printData.doctor.full_name}</p>
                                <p className="text-xs text-muted-foreground print:text-black">Doctor's Signature</p>
                            </div>

                            {/* Print Button */}
                            <div className="flex justify-end pt-4 print:hidden">
                                <Button onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            Failed to load prescription details
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PrintPrescription
