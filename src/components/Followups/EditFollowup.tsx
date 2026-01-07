import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FollowupsService } from "@/client"
import type { FollowUpPublic, FollowUpUpdate } from "@/client/FollowupsService"
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
  subjective_improvement: z.string().optional(),
  objective_findings: z.string().optional(),
  aggravation: z.string().optional(),
  amelioration: z.string().optional(),
  new_symptoms: z.string().optional(),
  general_state: z.string().optional(),
  plan: z.string().optional(),
  next_follow_up_date: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditFollowupProps {
  followup: FollowUpPublic
  onSuccess: () => void
}

const EditFollowup = ({ followup, onSuccess }: EditFollowupProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      subjective_improvement: followup.subjective_improvement ?? undefined,
      objective_findings: followup.objective_findings ?? undefined,
      aggravation: followup.aggravation ?? undefined,
      amelioration: followup.amelioration ?? undefined,
      new_symptoms: followup.new_symptoms ?? undefined,
      general_state: followup.general_state ?? undefined,
      plan: followup.plan ?? undefined,
      next_follow_up_date: followup.next_follow_up_date ? followup.next_follow_up_date.split("T")[0] : undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FollowUpUpdate) =>
      FollowupsService.updateFollowup({ followupId: followup.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Follow-up updated successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const followupData: FollowUpUpdate = {
      subjective_improvement: data.subjective_improvement || undefined,
      objective_findings: data.objective_findings || undefined,
      aggravation: data.aggravation || undefined,
      amelioration: data.amelioration || undefined,
      new_symptoms: data.new_symptoms || undefined,
      general_state: data.general_state || undefined,
      plan: data.plan || undefined,
      next_follow_up_date: data.next_follow_up_date || undefined,
    }
    mutation.mutate(followupData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil />
        Edit Follow-up
      </DropdownMenuItem>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Follow-up</DialogTitle>
              <DialogDescription>
                Update the follow-up details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="next_follow_up_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Follow-up Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjective_improvement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjective Improvement</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objective_findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objective Findings</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aggravation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aggravation</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amelioration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amelioration</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="new_symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Symptoms</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="general_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General State</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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

export default EditFollowup

