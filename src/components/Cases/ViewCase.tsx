import { Eye } from "lucide-react"
import { useState } from "react"

import type { PatientCasePublic } from "@/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface ViewCaseProps {
  caseItem: PatientCasePublic
}

const ViewCase = ({ caseItem }: ViewCaseProps) => {
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
            <DialogDescription>
              Complete information about the patient case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Case Number</p>
                <p className="text-base font-semibold font-mono">{caseItem.case_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-base font-semibold">
                  {caseItem.patient_name || `Patient ${caseItem.patient_id.slice(0, 8)}`}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Case Date</p>
              <p className="text-base">
                {new Date(caseItem.case_date).toLocaleDateString()}
              </p>
            </div>

            {caseItem.appointment_id && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Linked Appointment</p>
                <p className="text-sm font-mono">{caseItem.appointment_id}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Chief Complaint (Patient's Words)</p>
                <p className="text-base font-semibold">{caseItem.chief_complaint_patient}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Duration</p>
                <p className="text-base">{caseItem.duration}</p>
              </div>
            </div>

            {caseItem.physicals && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Physical Examination</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.physicals}</p>
              </div>
            )}

            {caseItem.noted_complaint_doctor && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Noted Complaint (Doctor's Assessment)</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.noted_complaint_doctor}</p>
              </div>
            )}

            {caseItem.peculiar_symptoms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Peculiar Symptoms</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.peculiar_symptoms}</p>
              </div>
            )}

            {caseItem.causation && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Causation</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.causation}</p>
              </div>
            )}

            {caseItem.lab_reports && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Lab Reports</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.lab_reports}</p>
              </div>
            )}

            {caseItem.custom_fields && Object.keys(caseItem.custom_fields).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-4">Custom Fields</p>
                  <div className="grid gap-4">
                    {Object.entries(caseItem.custom_fields).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </p>
                        <p className="text-base whitespace-pre-wrap">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewCase

