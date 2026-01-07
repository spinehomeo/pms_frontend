import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FollowupsService, CasesService, PrescriptionsService } from "@/client"
import type { FollowUpCreate } from "@/client/FollowupsService"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  case_id: z.string().min(1, { message: "Case is required" }),
  prescription_id: z.string().min(1, { message: "Prescription is required" }),
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      case_id: "",
      prescription_id: "",
      subjective_improvement: "",
      objective_findings: "",
      aggravation: "",
      amelioration: "",
      new_symptoms: "",
      general_state: "",
      plan: "",
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
    const followupData: FollowUpCreate = {
      case_id: data.case_id,
      prescription_id: data.prescription_id,
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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedCaseId(value)
                        form.setValue("prescription_id", "")
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casesData?.data.map((caseItem) => (
                          <SelectItem key={caseItem.id} value={caseItem.id}>
                            {caseItem.patient_name || `Case ${caseItem.case_number}`} - {caseItem.chief_complaint}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedCaseId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a prescription" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prescriptionsData?.data
                          .filter(p => p.case_id === form.watch("case_id"))
                          .map((prescription) => (
                            <SelectItem key={prescription.id} value={prescription.id}>
                              {prescription.prescription_number} - {prescription.prescription_date}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="subjective_improvement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjective Improvement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Patient's reported improvement"
                        {...field}
                        rows={3}
                      />
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
                      <Textarea
                        placeholder="Clinical observations"
                        {...field}
                        rows={3}
                      />
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
                        <Textarea
                          placeholder="What makes it worse"
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
                  name="amelioration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amelioration</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What makes it better"
                          {...field}
                          rows={2}
                        />
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
                      <Textarea
                        placeholder="Any new symptoms observed"
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
                name="general_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General State</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Overall general condition"
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
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Treatment plan going forward"
                        {...field}
                        rows={2}
                      />
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

export default AddFollowup

