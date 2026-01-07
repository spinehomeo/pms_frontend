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

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Chief Complaint</p>
                <p className="text-base font-semibold">{caseItem.chief_complaint}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Duration</p>
                <p className="text-base">{caseItem.duration}</p>
              </div>
            </div>

            {caseItem.onset && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Onset</p>
                <p className="text-base">{caseItem.onset}</p>
              </div>
            )}

            {caseItem.location && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Location</p>
                <p className="text-base">{caseItem.location}</p>
              </div>
            )}

            {caseItem.sensation && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Sensation</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.sensation}</p>
              </div>
            )}

            {caseItem.modalities && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Modalities</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.modalities}</p>
              </div>
            )}

            {caseItem.concomitants && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Concomitants</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.concomitants}</p>
              </div>
            )}

            {caseItem.generals && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Generals</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.generals}</p>
              </div>
            )}

            {caseItem.mentals && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mentals</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.mentals}</p>
              </div>
            )}

            {caseItem.physicals && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Physicals</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.physicals}</p>
              </div>
            )}

            {caseItem.miasm_assessment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Miasm Assessment</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.miasm_assessment}</p>
              </div>
            )}

            {caseItem.vitality_assessment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Vitality Assessment</p>
                <p className="text-base whitespace-pre-wrap">{caseItem.vitality_assessment}</p>
              </div>
            )}

            {caseItem.case_notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Case Notes</p>
                  <p className="text-base whitespace-pre-wrap">{caseItem.case_notes}</p>
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

