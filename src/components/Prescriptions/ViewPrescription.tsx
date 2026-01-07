import { Eye } from "lucide-react"
import { useState } from "react"

import type { PrescriptionPublic } from "@/client/PrescriptionsService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const typeColors: Record<string, string> = {
  acute: "bg-blue-500/10 text-blue-500",
  chronic: "bg-green-500/10 text-green-500",
  constitutional: "bg-purple-500/10 text-purple-500",
  intercurrent: "bg-yellow-500/10 text-yellow-500",
  nosode: "bg-orange-500/10 text-orange-500",
  sarcode: "bg-pink-500/10 text-pink-500",
  tautode: "bg-cyan-500/10 text-cyan-500",
}

interface ViewPrescriptionProps {
  prescription: PrescriptionPublic
}

const ViewPrescription = ({ prescription }: ViewPrescriptionProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Eye />
        View Details
      </DropdownMenuItem>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Complete information about the prescription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prescription Number</p>
                <p className="text-base font-semibold font-mono">{prescription.prescription_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-base font-semibold">
                  {prescription.patient_name || `Case ${prescription.case_id.slice(0, 8)}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">
                  {new Date(prescription.prescription_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge 
                  variant="outline" 
                  className={cn("capitalize mt-1", typeColors[prescription.prescription_type] || "bg-gray-500/10 text-gray-500")}
                >
                  {prescription.prescription_type}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                <p className="text-base">{prescription.dosage}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-base">{prescription.duration}</p>
              </div>
            </div>

            {prescription.medicines && prescription.medicines.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Medicines</p>
                  <div className="space-y-2">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{medicine.medicine_name || "Unknown Medicine"}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <span>Potency: {medicine.potency || "N/A"}</span>
                          <span>Form: {medicine.form || "N/A"}</span>
                          <span>Quantity: {medicine.quantity_used}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {prescription.instructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Instructions</p>
                <p className="text-base whitespace-pre-wrap">{prescription.instructions}</p>
              </div>
            )}

            {prescription.follow_up_advice && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Follow-up Advice</p>
                <p className="text-base whitespace-pre-wrap">{prescription.follow_up_advice}</p>
              </div>
            )}

            {prescription.dietary_restrictions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dietary Restrictions</p>
                <p className="text-base whitespace-pre-wrap">{prescription.dietary_restrictions}</p>
              </div>
            )}

            {prescription.avoidance && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Avoidance</p>
                <p className="text-base whitespace-pre-wrap">{prescription.avoidance}</p>
              </div>
            )}

            {prescription.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-base whitespace-pre-wrap">{prescription.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewPrescription

