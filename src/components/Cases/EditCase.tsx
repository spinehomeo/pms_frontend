import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CasesService } from "@/client"
import type { PatientCasePublic, CaseCreate } from "@/client/CasesService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  chief_complaint: z.string().min(1, { message: "Chief complaint is required" }).optional(),
  duration: z.string().min(1, { message: "Duration is required" }).optional(),
  onset: z.string().optional(),
  location: z.string().optional(),
  sensation: z.string().optional(),
  modalities: z.string().optional(),
  concomitants: z.string().optional(),
  generals: z.string().optional(),
  mentals: z.string().optional(),
  physicals: z.string().optional(),
  miasm_assessment: z.string().optional(),
  vitality_assessment: z.string().optional(),
  case_notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditCaseProps {
  caseItem: PatientCasePublic
  onSuccess: () => void
}

const EditCase = ({ caseItem, onSuccess }: EditCaseProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      chief_complaint: caseItem.chief_complaint,
      duration: caseItem.duration,
      onset: caseItem.onset ?? undefined,
      location: caseItem.location ?? undefined,
      sensation: caseItem.sensation ?? undefined,
      modalities: caseItem.modalities ?? undefined,
      concomitants: caseItem.concomitants ?? undefined,
      generals: caseItem.generals ?? undefined,
      mentals: caseItem.mentals ?? undefined,
      physicals: caseItem.physicals ?? undefined,
      miasm_assessment: caseItem.miasm_assessment ?? undefined,
      vitality_assessment: caseItem.vitality_assessment ?? undefined,
      case_notes: caseItem.case_notes ?? undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CaseCreate) =>
      CasesService.updateCase({ caseId: caseItem.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Case updated successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const caseData: CaseCreate = {
      patient_id: caseItem.patient_id, // Keep existing patient_id
      chief_complaint: data.chief_complaint || caseItem.chief_complaint,
      duration: data.duration || caseItem.duration,
      onset: data.onset || undefined,
      location: data.location || undefined,
      sensation: data.sensation || undefined,
      modalities: data.modalities || undefined,
      concomitants: data.concomitants || undefined,
      generals: data.generals || undefined,
      mentals: data.mentals || undefined,
      physicals: data.physicals || undefined,
      miasm_assessment: data.miasm_assessment || undefined,
      vitality_assessment: data.vitality_assessment || undefined,
      case_notes: data.case_notes || undefined,
    }
    mutation.mutate(caseData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil />
        Edit Case
      </DropdownMenuItem>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Case</DialogTitle>
              <DialogDescription>
                Update the case details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chief_complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chief Complaint</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="onset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onset</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sensation</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modalities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalities</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concomitants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concomitants</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generals</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mentals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentals</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="physicals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physicals</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="miasm_assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miasm Assessment</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitality_assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vitality Assessment</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="case_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCase

