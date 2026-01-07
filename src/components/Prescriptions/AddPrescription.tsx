import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"

import { PrescriptionsService, CasesService, MedicinesService } from "@/client"
import type { PrescriptionCreate } from "@/client/PrescriptionsService"
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

const medicineSchema = z.object({
  medicine_id: z.string().min(1, "Medicine is required"),
  stock_id: z.string().min(1, "Stock item is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
})

const formSchema = z.object({
  case_id: z.string().min(1, { message: "Case is required" }),
  prescription_type: z.enum(["acute", "chronic", "constitutional", "intercurrent", "nosode", "sarcode", "tautode"]).default("chronic"),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  instructions: z.string().optional(),
  follow_up_advice: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  avoidance: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, "At least one medicine is required"),
})

type FormData = z.infer<typeof formSchema>

const AddPrescription = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch cases for dropdown
  const { data: casesData, error: casesError } = useQuery({
    queryKey: ["cases"],
    queryFn: () => CasesService.readCases({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Fetch medicines master for dropdown
  const { data: medicinesData, error: medicinesError } = useQuery({
    queryKey: ["medicines-master"],
    queryFn: () => MedicinesService.readMedicinesMaster({ skip: 0, limit: 1000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  // Fetch all stock (will filter in component)
  const { data: stockData, error: stockError } = useQuery({
    queryKey: ["medicines-stock-all"],
    queryFn: () => MedicinesService.readMedicineStock({ skip: 0, limit: 10000 }),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      case_id: "",
      prescription_type: "chronic",
      dosage: "",
      duration: "",
      instructions: "",
      follow_up_advice: "",
      dietary_restrictions: "",
      avoidance: "",
      notes: "",
      medicines: [{ medicine_id: "", stock_id: "", quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  })

  const mutation = useMutation({
    mutationFn: (data: PrescriptionCreate) =>
      PrescriptionsService.createPrescription({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Prescription created successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const prescriptionData: PrescriptionCreate = {
      case_id: data.case_id,
      prescription_type: data.prescription_type,
      dosage: data.dosage,
      duration: data.duration,
      instructions: data.instructions || undefined,
      follow_up_advice: data.follow_up_advice || undefined,
      dietary_restrictions: data.dietary_restrictions || undefined,
      avoidance: data.avoidance || undefined,
      notes: data.notes || undefined,
      medicines: data.medicines.map(m => ({
        medicine_id: m.medicine_id,
        stock_id: m.stock_id,
        quantity: m.quantity,
      })),
    }
    mutation.mutate(prescriptionData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          className="my-4"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <Plus className="mr-2" />
          Add Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
          <DialogDescription>
            Create a new prescription for a patient case.
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {casesError ? (
                          <div className="p-2 text-sm text-destructive">Failed to load cases</div>
                        ) : casesData?.data && casesData.data.length > 0 ? (
                          casesData.data.map((caseItem) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {caseItem.patient_name || `Case ${caseItem.case_number}`} - {caseItem.chief_complaint}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No cases available</div>
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
                  name="prescription_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="acute">Acute</SelectItem>
                          <SelectItem value="chronic">Chronic</SelectItem>
                          <SelectItem value="constitutional">Constitutional</SelectItem>
                          <SelectItem value="intercurrent">Intercurrent</SelectItem>
                          <SelectItem value="nosode">Nosode</SelectItem>
                          <SelectItem value="sarcode">Sarcode</SelectItem>
                          <SelectItem value="tautode">Tautode</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Dosage <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2 globules, 3 times a day"
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duration <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 7 days, 2 weeks"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <FormLabel>
                    Medicines <span className="text-destructive">*</span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ medicine_id: "", stock_id: "", quantity: 1 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.medicine_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue(`medicines.${index}.stock_id`, "")
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select medicine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {medicinesError ? (
                                <div className="p-2 text-sm text-destructive">Failed to load medicines</div>
                              ) : medicinesData?.data && medicinesData.data.length > 0 ? (
                                medicinesData.data.map((medicine) => (
                                  <SelectItem key={medicine.id} value={medicine.id}>
                                    {medicine.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">No medicines available</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.stock_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!form.watch(`medicines.${index}.medicine_id`)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stock" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stockError ? (
                                <div className="p-2 text-sm text-destructive">Failed to load stock</div>
                              ) : stockData?.data && stockData.data.length > 0 ? (
                                stockData.data
                                  .filter(stock => stock.medicine_id === form.watch(`medicines.${index}.medicine_id`))
                                  .map((stock) => (
                                    <SelectItem key={stock.id} value={stock.id}>
                                      {stock.potency} {stock.form} (Qty: {stock.quantity})
                                    </SelectItem>
                                  ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">No stock available</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instructions for taking the medicine"
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
                name="follow_up_advice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Advice</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Follow-up instructions"
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
                name="dietary_restrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dietary restrictions"
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
                name="avoidance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avoidance</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Things to avoid"
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
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

export default AddPrescription

