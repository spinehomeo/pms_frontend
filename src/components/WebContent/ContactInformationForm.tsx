import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { WebContentService } from "@/client"
import type { ContactInformationCreate } from "@/client/WebContentService"
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
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
    title: z.string().min(1, "Clinic name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    phone_primary: z.string().min(1, "Primary phone is required"),
    phone_secondary: z.string().optional(),
    weekdays_hours: z.string().min(1, "Weekdays hours is required"),
    saturday_hours: z.string().min(1, "Saturday hours is required"),
    sunday_hours: z.string().min(1, "Sunday hours is required"),
    whatsapp_number: z.string().min(1, "WhatsApp number is required"),
    whatsapp_message: z.string().min(1, "WhatsApp message is required"),
})

type FormData = z.infer<typeof formSchema>

interface ContactInformationFormProps {
    contactId?: number
    onBack: () => void
}

export function ContactInformationForm({ contactId, onBack }: ContactInformationFormProps) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: contactData } = useQuery({
        queryKey: ["contact-info", contactId],
        queryFn: () => (contactId ? WebContentService.getContactInfo(contactId) : null),
        enabled: !!contactId && contactId !== -1,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            title: "",
            address: "",
            city: "",
            phone_primary: "",
            phone_secondary: "",
            weekdays_hours: "9:00 AM - 6:00 PM",
            saturday_hours: "9:00 AM - 1:00 PM",
            sunday_hours: "Closed",
            whatsapp_number: "",
            whatsapp_message: "Hello! How can we help you?",
        },
    })

    useEffect(() => {
        if (contactData) {
            form.reset({
                title: contactData.title,
                address: contactData.address,
                city: contactData.city,
                phone_primary: contactData.phone_primary,
                phone_secondary: contactData.phone_secondary || "",
                weekdays_hours: contactData.weekdays_hours,
                saturday_hours: contactData.saturday_hours,
                sunday_hours: contactData.sunday_hours,
                whatsapp_number: contactData.whatsapp_number,
                whatsapp_message: contactData.whatsapp_message,
            })
        }
    }, [contactData, form])

    const createMutation = useMutation({
        mutationFn: (data: ContactInformationCreate) =>
            WebContentService.createContactInfo({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Contact Information created successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-contact-info"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const updateMutation = useMutation({
        mutationFn: (data: ContactInformationCreate) =>
            WebContentService.updateContactInfo({ contactId: contactId!, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Contact Information updated successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-contact-info"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        const payload: ContactInformationCreate = {
            title: data.title,
            address: data.address,
            city: data.city,
            phone_primary: data.phone_primary,
            phone_secondary: data.phone_secondary || undefined,
            weekdays_hours: data.weekdays_hours,
            saturday_hours: data.saturday_hours,
            sunday_hours: data.sunday_hours,
            whatsapp_number: data.whatsapp_number,
            whatsapp_message: data.whatsapp_message,
        }

        if (contactId && contactId !== -1) {
            updateMutation.mutate(payload)
        } else {
            createMutation.mutate(payload)
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">{contactId && contactId !== -1 ? "Edit" : "Create"} Contact Information</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage clinic contact details and operating hours
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Clinic Information</h3>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clinic Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Herbal Healing Clinic" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Wellness Street" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mumbai" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Contact Numbers</h3>

                        <FormField
                            control={form.control}
                            name="phone_primary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+91-9876543210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone_secondary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Secondary Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+91-9876543211" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="whatsapp_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+91-9876543210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="whatsapp_message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Default WhatsApp Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Hello! How can we help you?"
                                            {...field}
                                            rows={2}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Operating Hours</h3>

                        <FormField
                            control={form.control}
                            name="weekdays_hours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weekdays Hours</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="saturday_hours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Saturday Hours</FormLabel>
                                    <FormControl>
                                        <Input placeholder="9:00 AM - 1:00 PM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sunday_hours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sunday Hours</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Closed" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={onBack} disabled={isPending}>
                            Cancel
                        </Button>
                        <LoadingButton type="submit" loading={isPending}>
                            {contactId && contactId !== -1 ? "Update" : "Create"} Contact Information
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    )
}
