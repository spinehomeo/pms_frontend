import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CasesService } from "@/client"
import type { PatientCasePublic, CaseUpdate } from "@/client/CasesService"
import { DoctorPreferencesService } from "@/client/DoctorPreferencesService"
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
  duration: z.string().optional(),
  physicals: z.string().optional(),
  noted_complaint_doctor: z.string().optional(),
  peculiar_symptoms: z.string().optional(),
  causation: z.string().optional(),
  lab_reports: z.string().optional(),
}).catchall(z.string()) // Allow custom fields

type FormData = z.infer<typeof formSchema>

interface EditCaseProps {
  caseItem: PatientCasePublic
  onSuccess: () => void
}

const EditCase = ({ caseItem, onSuccess }: EditCaseProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch doctor preferences for custom fields
  const { data: preferencesData } = useQuery({
    queryKey: ["doctor-preferences"],
    queryFn: () => DoctorPreferencesService.getPreferences(),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Prepare default values including custom fields
  const getDefaultValues = () => {
    const baseValues: any = {
      duration: caseItem.duration ?? "",
      physicals: caseItem.physicals ?? "",
      noted_complaint_doctor: caseItem.noted_complaint_doctor ?? "",
      peculiar_symptoms: caseItem.peculiar_symptoms ?? "",
      causation: caseItem.causation ?? "",
      lab_reports: caseItem.lab_reports ?? "",
    }

    // Add custom fields from caseItem
    if (caseItem.custom_fields) {
      Object.entries(caseItem.custom_fields).forEach(([key, value]) => {
        baseValues[key] = value
      })
    }

    return baseValues
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: getDefaultValues(),
  })

  // Reset form with custom fields when preferences load
  useEffect(() => {
    if (isOpen && preferencesData) {
      form.reset(getDefaultValues())
    }
  }, [isOpen, preferencesData])

  const mutation = useMutation({
    mutationFn: (data: CaseUpdate) =>
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
    // Extract custom fields (any field not in the standard schema)
    const standardFields = ['duration', 'physicals', 'noted_complaint_doctor', 'peculiar_symptoms', 'causation', 'lab_reports']
    const customFields: Record<string, string> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (!standardFields.includes(key) && value) {
        customFields[key] = value as string
      }
    })

    const caseData: CaseUpdate = {
      duration: data.duration || undefined,
      physicals: data.physicals || undefined,
      noted_complaint_doctor: data.noted_complaint_doctor || undefined,
      peculiar_symptoms: data.peculiar_symptoms || undefined,
      causation: data.causation || undefined,
      lab_reports: data.lab_reports || undefined,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
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
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground mb-2">
                <p><strong>Patient:</strong> {caseItem.patient_name || caseItem.patient_id}</p>
                <p><strong>Case Number:</strong> {caseItem.case_number}</p>
                <p><strong>Chief Complaint:</strong> {caseItem.chief_complaint_patient}</p>
              </div>

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 3 days, 2 weeks"
                        {...field}
                      />
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
                    <FormLabel>Physical Examination</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Physical examination findings"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noted_complaint_doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Noted Complaint (Doctor's Assessment)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Doctor's professional assessment"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peculiar_symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peculiar Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Unique or unusual symptoms"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="causation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Causation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Possible causes or triggers"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lab_reports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Reports</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Laboratory test results"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic Custom Fields */}
              {preferencesData?.custom_fields && preferencesData.custom_fields.length > 0 && (
                <>
                  <div className="col-span-full mt-4 border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">Custom Fields</h3>
                  </div>
                  {preferencesData.custom_fields.map((customField) => (
                    <FormField
                      key={customField.field_name}
                      control={form.control}
                      name={customField.field_name as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {customField.display_name}
                            {customField.is_required && <span className="text-destructive">*</span>}
                          </FormLabel>
                          <FormControl>
                            {customField.field_type === 'textarea' ? (
                              <Textarea
                                placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                {...field}
                                rows={2}
                              />
                            ) : (
                              <Input
                                placeholder={`Enter ${customField.display_name.toLowerCase()}`}
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </>
              )}
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

