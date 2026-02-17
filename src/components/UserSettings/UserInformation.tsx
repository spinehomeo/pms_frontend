import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { z } from "zod"

import { UsersService, type UserUpdateMe } from "@/client"
import { Button } from "@/components/ui/button"
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
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import { handleError } from "@/utils"

const formSchema = z.object({
  full_name: z.string().max(30).optional(),
  email: z.email({ message: "Invalid email address" }),
  phone: z.string().max(20).optional().or(z.literal("")),
  specialization: z.string().max(100).optional().or(z.literal("")),
  clinic_name: z.string().max(100).optional().or(z.literal("")),
  clinic_address: z.string().max(255).optional().or(z.literal("")),
  consultation_fee: z.coerce.number().nonnegative().optional().or(z.literal("")),
})

type FormData = z.infer<typeof formSchema>

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()

  const form = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name ?? undefined,
      email: currentUser?.email,
      phone: currentUser?.phone ?? undefined,
      specialization: currentUser?.specialization ?? undefined,
      clinic_name: currentUser?.clinic_name ?? undefined,
      clinic_address: currentUser?.clinic_address ?? undefined,
      consultation_fee: currentUser?.consultation_fee ?? undefined,
    },
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully")
      toggleEditMode()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = (data: FormData) => {
    const updateData: UserUpdateMe = {}

    // only include fields that have changed
    if (data.full_name !== currentUser?.full_name) {
      updateData.full_name = data.full_name
    }
    if (data.email !== currentUser?.email) {
      updateData.email = data.email
    }
    if (data.phone !== currentUser?.phone) {
      updateData.phone = data.phone || undefined
    }
    if (data.specialization !== currentUser?.specialization) {
      updateData.specialization = data.specialization || undefined
    }
    if (data.clinic_name !== currentUser?.clinic_name) {
      updateData.clinic_name = data.clinic_name || undefined
    }
    if (data.clinic_address !== currentUser?.clinic_address) {
      updateData.clinic_address = data.clinic_address || undefined
    }
    if (data.consultation_fee !== currentUser?.consultation_fee) {
      updateData.consultation_fee = data.consultation_fee || undefined
    }

    mutation.mutate(updateData)
  }

  const onCancel = () => {
    form.reset()
    toggleEditMode()
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-semibold py-4">User Information</h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) =>
              editMode ? (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) : (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <p
                    className={cn(
                      "py-2 truncate max-w-sm",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value || "N/A"}
                  </p>
                </FormItem>
              )
            }
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) =>
              editMode ? (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) : (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <p className="py-2 truncate max-w-sm">{field.value}</p>
                </FormItem>
              )
            }
          />

          {/* Doctor-specific fields - only show if user has these fields */}
          {(currentUser?.role === "doctor" || currentUser?.phone || currentUser?.specialization || currentUser?.clinic_name) && (
            <>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) =>
                  editMode ? (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="03001234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <p className={cn("py-2 truncate max-w-sm", !field.value && "text-muted-foreground")}>
                        {field.value || "N/A"}
                      </p>
                    </FormItem>
                  )
                }
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) =>
                  editMode ? (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Cardiology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <p className={cn("py-2 truncate max-w-sm", !field.value && "text-muted-foreground")}>
                        {field.value || "N/A"}
                      </p>
                    </FormItem>
                  )
                }
              />

              <FormField
                control={form.control}
                name="clinic_name"
                render={({ field }) =>
                  editMode ? (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Your clinic name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <p className={cn("py-2 truncate max-w-sm", !field.value && "text-muted-foreground")}>
                        {field.value || "N/A"}
                      </p>
                    </FormItem>
                  )
                }
              />

              <FormField
                control={form.control}
                name="clinic_address"
                render={({ field }) =>
                  editMode ? (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Clinic address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <p className={cn("py-2 truncate max-w-sm", !field.value && "text-muted-foreground")}>
                        {field.value || "N/A"}
                      </p>
                    </FormItem>
                  )
                }
              />

              <FormField
                control={form.control}
                name="consultation_fee"
                render={({ field }) =>
                  editMode ? (
                    <FormItem>
                      <FormLabel>Consultation Fee (PKR)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1500" min="0" step="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Consultation Fee (PKR)</FormLabel>
                      <p className={cn("py-2 truncate max-w-sm", !field.value && "text-muted-foreground")}>
                        {field.value ? `PKR ${field.value.toLocaleString()}` : "N/A"}
                      </p>
                    </FormItem>
                  )
                }
              />
            </>
          )}

          <div className="flex gap-3">
            {editMode ? (
              <>
                <LoadingButton
                  type="submit"
                  loading={mutation.isPending}
                  disabled={!form.formState.isDirty}
                >
                  Save
                </LoadingButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" onClick={toggleEditMode}>
                Edit
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default UserInformation
