import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { EnumsService, MedicinesService, type MedicineUpdate, type MedicinePublic } from "@/client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { parseDoctorEnumOptions } from "@/lib/doctorEnums"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  potency: z.string().optional(),
  potency_scale: z.string().optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditMedicineProps {
  medicine: MedicinePublic
  onSuccess: () => void
}

const EditMedicine = ({ medicine, onSuccess }: EditMedicineProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: scaleEnumData } = useQuery({
    queryKey: ["doctor-enum", "ScaleEnum"],
    queryFn: () => EnumsService.readDoctorEnum("ScaleEnum"),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const { data: formEnumData } = useQuery({
    queryKey: ["doctor-enum", "FormEnum"],
    queryFn: () => EnumsService.readDoctorEnum("FormEnum"),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const { data: manufacturerEnumData } = useQuery({
    queryKey: ["doctor-enum", "ManufacturerEnum"],
    queryFn: () => EnumsService.readDoctorEnum("ManufacturerEnum"),
    enabled: isOpen,
    retry: false,
    throwOnError: false,
  })

  const scaleOptions = parseDoctorEnumOptions(scaleEnumData)
  const formOptions = parseDoctorEnumOptions(formEnumData)
  const manufacturerOptions = parseDoctorEnumOptions(manufacturerEnumData)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: medicine.name ?? undefined,
      description: medicine.description ?? undefined,
      potency: medicine.potency ?? undefined,
      potency_scale: medicine.potency_scale ?? undefined,
      form: medicine.form ?? undefined,
      manufacturer: medicine.manufacturer ?? undefined,
    },
  })

  useEffect(() => {
    if (isOpen && !form.getValues("potency_scale") && scaleOptions.length > 0) {
      form.setValue("potency_scale", scaleOptions[0].value)
    }
  }, [form, isOpen, scaleOptions])

  useEffect(() => {
    if (isOpen && !form.getValues("form") && formOptions.length > 0) {
      form.setValue("form", formOptions[0].value)
    }
  }, [form, formOptions, isOpen])

  const mutation = useMutation({
    mutationFn: (data: MedicineUpdate) =>
      MedicinesService.updateMedicine({ medicineId: medicine.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Medicine updated successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines-search"] })
      queryClient.invalidateQueries({ queryKey: ["medicines-all"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const updateData: MedicineUpdate = {}
    if (data.name) updateData.name = data.name
    if (data.description) updateData.description = data.description
    if (data.potency) updateData.potency = data.potency
    if (data.potency_scale) updateData.potency_scale = data.potency_scale
    if (data.form) updateData.form = data.form
    if (data.manufacturer) updateData.manufacturer = data.manufacturer

    mutation.mutate(updateData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil />
        Edit Medicine
      </DropdownMenuItem>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Medicine</DialogTitle>
              <DialogDescription>
                Update the medicine details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{medicine.name}</p>
                <p className="text-xs text-muted-foreground">
                  {medicine.potency} {medicine.potency_scale} - {medicine.form}
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <FormLabel>Potency</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {scaleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="form"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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
                    <FormLabel>Manufacturer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {manufacturerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                Save Changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditMedicine
