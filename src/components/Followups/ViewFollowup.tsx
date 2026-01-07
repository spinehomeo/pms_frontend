import { Eye } from "lucide-react"
import { useState } from "react"

import type { FollowUpPublic } from "@/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ViewFollowupProps {
  followup: FollowUpPublic
}

const ViewFollowup = ({ followup }: ViewFollowupProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const nextDate = followup.next_follow_up_date ? new Date(followup.next_follow_up_date) : null
  const today = new Date()
  const isOverdue = nextDate ? nextDate < today : false
  const daysUntil = nextDate ? Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

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
            <DialogTitle>Follow-up Details</DialogTitle>
            <DialogDescription>
              Complete information about the follow-up
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-base font-semibold">
                  {followup.patient_name || `Case ${followup.case_id.slice(0, 8)}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Follow-up Date</p>
                <p className="text-base">
                  {new Date(followup.follow_up_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interval</p>
                <p className="text-base">{followup.interval_days} days</p>
              </div>
              {nextDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Follow-up</p>
                  <p className={cn(
                    "text-base font-semibold",
                    isOverdue && "text-red-500",
                    !isOverdue && daysUntil && daysUntil <= 7 && "text-orange-500"
                  )}>
                    {nextDate.toLocaleDateString()}
                    {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                    {!isOverdue && daysUntil && daysUntil <= 7 && (
                      <span className="ml-2 text-xs">({daysUntil} days)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {followup.subjective_improvement && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Subjective Improvement</p>
                <p className="text-base whitespace-pre-wrap">{followup.subjective_improvement}</p>
              </div>
            )}

            {followup.objective_findings && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Objective Findings</p>
                <p className="text-base whitespace-pre-wrap">{followup.objective_findings}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {followup.aggravation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Aggravation</p>
                  <p className="text-base whitespace-pre-wrap">{followup.aggravation}</p>
                </div>
              )}
              {followup.amelioration && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Amelioration</p>
                  <p className="text-base whitespace-pre-wrap">{followup.amelioration}</p>
                </div>
              )}
            </div>

            {followup.new_symptoms && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">New Symptoms</p>
                <p className="text-base whitespace-pre-wrap">{followup.new_symptoms}</p>
              </div>
            )}

            {followup.general_state && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">General State</p>
                <p className="text-base whitespace-pre-wrap">{followup.general_state}</p>
              </div>
            )}

            {followup.plan && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Plan</p>
                <p className="text-base whitespace-pre-wrap">{followup.plan}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewFollowup

