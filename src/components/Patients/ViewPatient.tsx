import { Eye } from "lucide-react"
import { useState } from "react"

import type { PatientPublic } from "@/client/PatientsService"
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

interface ViewPatientProps {
  patient: PatientPublic
}

const ViewPatient = ({ patient }: ViewPatientProps) => {
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information about the patient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base font-semibold">{patient.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <Badge variant="outline" className="capitalize mt-1">
                  {patient.gender}
                </Badge>
              </div>
            </div>

            {patient.date_of_birth && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-base">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                {patient.age && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-base">{patient.age} years</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{patient.phone || <span className="text-muted-foreground italic">Not provided</span>}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{patient.email || <span className="text-muted-foreground italic">Not provided</span>}</p>
              </div>
            </div>

            {patient.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-base">{patient.address}</p>
              </div>
            )}

            {patient.occupation && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                <p className="text-base">{patient.occupation}</p>
              </div>
            )}

            {patient.referred_by && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Referred By</p>
                <p className="text-base">{patient.referred_by}</p>
              </div>
            )}

            <Separator />

            {patient.medical_history && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Medical History</p>
                <p className="text-base whitespace-pre-wrap">{patient.medical_history}</p>
              </div>
            )}

            {patient.drug_allergies && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Drug Allergies</p>
                <p className="text-base whitespace-pre-wrap">{patient.drug_allergies}</p>
              </div>
            )}

            {patient.family_history && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Family History</p>
                <p className="text-base whitespace-pre-wrap">{patient.family_history}</p>
              </div>
            )}

            {patient.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-base whitespace-pre-wrap">{patient.notes}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="text-base">
                  {new Date(patient.created_date).toLocaleDateString()}
                </p>
              </div>
              {patient.last_visit_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Visit</p>
                  <p className="text-base">
                    {new Date(patient.last_visit_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewPatient

