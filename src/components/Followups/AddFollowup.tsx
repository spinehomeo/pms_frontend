import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FollowupsService, CasesService, PrescriptionsService } from "@/client"
import type { FollowUpCreate } from "@/client/FollowupsService"
import { DoctorPreferencesService, type DoctorField } from "@/client/DoctorPreferencesService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  case_id: z.string().min(1, { message: "Case is required" }),
  prescription_id: z.string().min(1, { message: "Prescription is required" }),
  next_follow_up_date: z.string().optional(),
}).catchall(z.string().optional()) // Allow optional custom fields

type FormData = z.infer<typeof formSchema>

const AddFollowup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")

  // Fetch cases for dropdown
  const { data: casesData } = useQuery({
    queryKey: ["cases"],
    queryFn: () => CasesService.readCases({ skip: 0, limit: 1000 }),
    enabled: isOpen,
  })

  // Fetch prescriptions for selected case
  const { data: prescriptionsData } = useQuery({
    queryKey: ["prescriptions", selectedCaseId],
    queryFn: () => PrescriptionsService.readPrescriptions({ case_id: selectedCaseId, limit: 1000 }),
    enabled: isOpen && !!selectedCaseId,
  })

  // Fetch doctor preferences for follow-up custom fields
  const { data: preferencesData } = useQuery({
    queryKey: ["doctor-preferences", "followups"],
    queryFn: () => DoctorPreferencesService.getFields("followups"),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      case_id: "",
      prescription_id: "",
      next_follow_up_date: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FollowUpCreate) =>
      FollowupsService.createFollowup({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Follow-up created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const standardFields = ["case_id", "prescription_id", "next_follow_up_date"]
    const customFields: Record<string, string> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (!standardFields.includes(key) && value) {
        customFields[key] = value as string
      }
    })

    const followupData: FollowUpCreate = {
      case_id: data.case_id,
      prescription_id: data.prescription_id,
      next_follow_up_date: data.next_follow_up_date || undefined,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : undefined,
    }
    mutation.mutate(followupData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Follow-up</DialogTitle>
          <DialogDescription>
            Record a follow-up for a patient case.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="case_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Case <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={
                          (casesData?.data || []).map((caseItem) => ({
                            value: caseItem.id,
                            label: `${caseItem.patient_name || `Case ${caseItem.case_number}`} - ${caseItem.chief_complaint_patient}`,
                          }))
                        }
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedCaseId(value)
                          form.setValue("prescription_id", "")
                        }}
                        placeholder="Search cases..."
                        searchPlaceholder="Type to search cases..."
                        emptyMessage="No cases found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prescription_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prescription <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={
                          (prescriptionsData?.data || [])
                            .filter(p => p.case_id === form.watch("case_id"))
                            .map((prescription) => ({
                              value: prescription.id,
                              label: `${prescription.prescription_number} - ${prescription.prescription_date}`,
                            }))
                        }
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Search prescriptions..."
                        searchPlaceholder="Type to search prescriptions..."
                        emptyMessage="No prescriptions found."
                        disabled={!selectedCaseId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Dynamic Custom Fields */}
              {preferencesData && preferencesData.length > 0 && (
                <>
                  {preferencesData.map((customField: DoctorField) => (
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

export default AddFollowup

