import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { MedicinesService, type MedicineCreate } from "@/client"
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
  name: z.string().min(1, { message: "Medicine name is required" }),
  description: z.string().optional(),
  potency: z.string().min(1, { message: "Potency is required" }),
  potency_scale: z.enum(["C", "X", "Q"]).default("C"),
  form: z.enum(["Diskette", "SOM", "Blankets", "Bio Chemic", "Homoeo Tabs", "Globules", "Dilutions"]).default("Globules"),
  manufacturer: z.enum(["Schwabe", "Reckweg", "Lemasar", "Dolisos", "Kamal", "Masood", "BM", "Kent", "Brooks", "Waris Shah", "Self Packing"]).optional(),
})

type FormData = z.infer<typeof formSchema>

const AddMedicine = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      potency: "",
      potency_scale: "C",
      form: "Globules",
      manufacturer: undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: MedicineCreate) =>
      MedicinesService.createMedicine({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Medicine added to global catalog successfully")
      form.reset()
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines-search"] })
      queryClient.invalidateQueries({ queryKey: ["medicines-all"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const medicineData: MedicineCreate = {
      name: data.name,
      description: data.description || undefined,
      potency: data.potency,
      potency_scale: data.potency_scale,
      form: data.form,
      manufacturer: data.manufacturer || undefined,
    }
    mutation.mutate(medicineData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add New Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medicine to Global Catalog</DialogTitle>
          <DialogDescription>
            Add a new medicine to the community-driven catalog. Admins will verify your contribution.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Medicine Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Arnica Montana"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Used for trauma and bruising"
                        {...field}
                      />
                    </FormControl>
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
                      <FormLabel>
                        Scale <span className="text-destructive">*</span>
                      </FormLabel>
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
                          <SelectItem value="C">C (Centesimal)</SelectItem>
                          <SelectItem value="X">X (Decimal)</SelectItem>
                          <SelectItem value="Q">Q (Quinquagintamillesimal)</SelectItem>
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
                      <FormLabel>
                        Form <span className="text-destructive">*</span>
                      </FormLabel>
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
                          <SelectItem value="Diskette">Diskette</SelectItem>
                          <SelectItem value="SOM">SOM</SelectItem>
                          <SelectItem value="Blankets">Blankets</SelectItem>
                          <SelectItem value="Bio Chemic">Bio Chemic</SelectItem>
                          <SelectItem value="Homoeo Tabs">Homoeo Tabs</SelectItem>
                          <SelectItem value="Globules">Globules</SelectItem>
                          <SelectItem value="Dilutions">Dilutions</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Schwabe">Schwabe</SelectItem>
                        <SelectItem value="Reckweg">Reckweg</SelectItem>
                        <SelectItem value="Lemasar">Lemasar</SelectItem>
                        <SelectItem value="Dolisos">Dolisos</SelectItem>
                        <SelectItem value="Kamal">Kamal</SelectItem>
                        <SelectItem value="Masood">Masood</SelectItem>
                        <SelectItem value="BM">BM</SelectItem>
                        <SelectItem value="Kent">Kent</SelectItem>
                        <SelectItem value="Brooks">Brooks</SelectItem>
                        <SelectItem value="Waris Shah">Waris Shah</SelectItem>
                        <SelectItem value="Self Packing">Self Packing</SelectItem>
                      </SelectContent>
                    </Select>
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
                Add to Catalog
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMedicine
