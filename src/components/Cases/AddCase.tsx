import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CasesService, PatientsService } from "@/client"
import type { CaseCreate } from "@/client/CasesService"
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
  patient_id: z.string().min(1, { message: "Patient is required" }),
  chief_complaint: z.string().min(1, { message: "Chief complaint is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
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

const AddCase = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch patients for dropdown
  const { data: patientsData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => PatientsService.readPatients({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      patient_id: "",
      chief_complaint: "",
      duration: "",
      onset: "",
      location: "",
      sensation: "",
      modalities: "",
      concomitants: "",
      generals: "",
      mentals: "",
      physicals: "",
      miasm_assessment: "",
      vitality_assessment: "",
      case_notes: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CaseCreate) =>
      CasesService.createCase({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Case created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] })
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const caseData: CaseCreate = {
      patient_id: data.patient_id,
      chief_complaint: data.chief_complaint,
      duration: data.duration,
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
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Case</DialogTitle>
          <DialogDescription>
            Create a new patient case record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Patient <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patientsData?.data && patientsData.data.length > 0 ? (
                          patientsData.data.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name} {patient.email && `(${patient.email})`}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No patients available</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chief_complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Chief Complaint <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Main complaint"
                          {...field}
                        />
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
                      <FormLabel>
                        Duration <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2 weeks, 1 month"
                          {...field}
                        />
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
                        <Input
                          placeholder="How it started"
                          {...field}
                        />
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
                        <Input
                          placeholder="Location of complaint"
                          {...field}
                        />
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
                      <Textarea
                        placeholder="Describe the sensation"
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
                name="modalities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What makes it better or worse"
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
                name="concomitants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concomitants</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Associated symptoms"
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
                name="generals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="General symptoms"
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
                name="mentals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mental/emotional symptoms"
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
                name="physicals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physicals</FormLabel>
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
                name="miasm_assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miasm Assessment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Miasm evaluation"
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
                name="vitality_assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vitality Assessment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vitality evaluation"
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
                name="case_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        {...field}
                        rows={3}
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

export default AddCase

