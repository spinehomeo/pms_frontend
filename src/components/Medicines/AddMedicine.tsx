import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { MedicinesService } from "@/client"
import type { DoctorMedicineStockCreate } from "@/client/MedicinesService"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  medicine_id: z.string().min(1, { message: "Medicine is required" }),
  potency: z.string().min(1, { message: "Potency is required" }),
  potency_scale: z.enum(["X", "C", "LM", "Q", "M", "CM", "MM"]).default("C"),
  form: z.enum(["pills", "globules", "drops", "powder", "ointment", "suppository", "injection"]).default("globules"),
  quantity: z.number().min(0, { message: "Quantity must be 0 or greater" }),
  unit: z.string().default("packet"),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  manufacturer: z.string().optional(),
  purchase_date: z.string().optional(),
  storage_location: z.string().default("Clinic Cabinet A"),
  is_active: z.boolean().default(true),
  low_stock_threshold: z.number().min(0).default(5),
})

type FormData = z.infer<typeof formSchema>

const AddMedicine = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  // Fetch medicines master for dropdown
  const { data: medicinesData } = useQuery({
    queryKey: ["medicines-master"],
    queryFn: () => MedicinesService.readMedicinesMaster({ skip: 0, limit: 1000 }),
    enabled: isOpen,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      medicine_id: "",
      potency: "",
      potency_scale: "C",
      form: "globules",
      quantity: 0,
      unit: "packet",
      batch_number: "",
      expiry_date: "",
      manufacturer: "",
      purchase_date: new Date().toISOString().split("T")[0],
      storage_location: "Clinic Cabinet A",
      is_active: true,
      low_stock_threshold: 5,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: DoctorMedicineStockCreate) =>
      MedicinesService.createStockItem({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Medicine added to stock successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines-stock"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const stockData: DoctorMedicineStockCreate = {
      medicine_id: data.medicine_id,
      potency: data.potency,
      potency_scale: data.potency_scale,
      form: data.form,
      quantity: data.quantity,
      unit: data.unit,
      batch_number: data.batch_number || undefined,
      expiry_date: data.expiry_date || undefined,
      manufacturer: data.manufacturer || undefined,
      purchase_date: data.purchase_date || undefined,
      storage_location: data.storage_location,
      is_active: data.is_active,
      low_stock_threshold: data.low_stock_threshold,
    }
    mutation.mutate(stockData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Medicine to Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medicine to Stock</DialogTitle>
          <DialogDescription>
            Add a new medicine to your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="medicine_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Medicine <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a medicine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicinesData?.data.map((medicine) => (
                          <SelectItem key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="potency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Potency <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 30, 200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="potency_scale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scale</FormLabel>
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
                          <SelectItem value="X">X</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="LM">LM</SelectItem>
                          <SelectItem value="Q">Q</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="CM">CM</SelectItem>
                          <SelectItem value="MM">MM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="form"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form</FormLabel>
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
                          <SelectItem value="pills">Pills</SelectItem>
                          <SelectItem value="globules">Globules</SelectItem>
                          <SelectItem value="drops">Drops</SelectItem>
                          <SelectItem value="powder">Powder</SelectItem>
                          <SelectItem value="ointment">Ointment</SelectItem>
                          <SelectItem value="suppository">Suppository</SelectItem>
                          <SelectItem value="injection">Injection</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Quantity <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
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
                  name="batch_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="storage_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="low_stock_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

export default AddMedicine

