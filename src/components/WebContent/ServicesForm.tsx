import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { WebContentService } from "@/client"
import type { ServicesAndTreatmentsCreate } from "@/client/WebContentService"
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

const serviceSchema = z.object({
    icon: z.string().min(1, "Icon is required"),
    image_url: z.string().url("Must be a valid URL"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    order: z.number().min(0),
})

const formSchema = z.object({
    title: z.string().min(1, "Section title is required"),
    services: z.array(serviceSchema).min(1, "At least one service is required"),
})

type FormData = z.infer<typeof formSchema>

interface ServicesFormProps {
    servicesId?: number
    onBack: () => void
}

export function ServicesForm({ servicesId, onBack }: ServicesFormProps) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: servicesData } = useQuery({
        queryKey: ["services", servicesId],
        queryFn: () => (servicesId ? WebContentService.getServices(servicesId) : null),
        enabled: !!servicesId && servicesId !== -1,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            title: "Our Services",
            services: [{ icon: "", image_url: "", title: "", description: "", order: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "services",
    })

    useEffect(() => {
        if (servicesData) {
            form.reset({
                title: servicesData.title,
                services: servicesData.services.map((s) => ({
                    icon: s.icon,
                    image_url: s.image_url,
                    title: s.title,
                    description: s.description,
                    order: s.order,
                })),
            })
        }
    }, [servicesData, form])

    const createMutation = useMutation({
        mutationFn: (data: ServicesAndTreatmentsCreate) =>
            WebContentService.createServices({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Services section created successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-services"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const updateMutation = useMutation({
        mutationFn: (data: ServicesAndTreatmentsCreate) =>
            WebContentService.updateServices({ servicesId: servicesId!, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Services section updated successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-services"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        const payload: ServicesAndTreatmentsCreate = {
            title: data.title,
            services: data.services.map((s, idx) => ({
                icon: s.icon,
                image_url: s.image_url,
                title: s.title,
                description: s.description,
                order: idx + 1,
            })),
        }

        if (servicesId && servicesId !== -1) {
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
                    <h2 className="text-2xl font-bold">{servicesId && servicesId !== -1 ? "Edit" : "Create"} Services & Treatments</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage service offerings with descriptions and images
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Our Services" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Services</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ icon: "", image_url: "", title: "", description: "", order: fields.length })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Service
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No services added yet</p>
                        ) : (
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border rounded p-4 space-y-3">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm font-semibold">Service {index + 1}</p>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name={`services.${index}.icon`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Icon Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., heart-icon"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`services.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Title</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Service title"
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
                                            name={`services.${index}.image_url`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Image URL</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://example.com/image.jpg"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`services.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Service description"
                                                            {...field}
                                                            rows={2}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={onBack} disabled={isPending}>
                            Cancel
                        </Button>
                        <LoadingButton type="submit" loading={isPending}>
                            {servicesId && servicesId !== -1 ? "Update" : "Create"} Services
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    )
}
