import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { WebContentService } from "@/client"
import type { PatientSuccessStoriesCreate } from "@/client/WebContentService"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

const testimonialSchema = z.object({
    name: z.string().min(1, "Patient name is required"),
    city: z.string().min(1, "City is required"),
    rating: z.number().min(1).max(5),
    message: z.string().min(1, "Message is required"),
    order: z.number().min(0),
    is_approved: z.boolean(),
})

const formSchema = z.object({
    title: z.string().min(1, "Section title is required"),
    testimonials: z.array(testimonialSchema).min(1, "At least one testimonial is required"),
})

type FormData = z.infer<typeof formSchema>

interface TestimonialsFormProps {
    testimonialsId?: number
    onBack: () => void
}

export function TestimonialsForm({ testimonialsId, onBack }: TestimonialsFormProps) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: testimonialsData } = useQuery({
        queryKey: ["testimonials", testimonialsId],
        queryFn: () => (testimonialsId ? WebContentService.getTestimonials(testimonialsId) : null),
        enabled: !!testimonialsId && testimonialsId !== -1,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            title: "Success Stories",
            testimonials: [{ name: "", city: "", rating: 5, message: "", order: 0, is_approved: true }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "testimonials",
    })

    useEffect(() => {
        if (testimonialsData) {
            form.reset({
                title: testimonialsData.title,
                testimonials: testimonialsData.testimonials.map((t) => ({
                    name: t.name,
                    city: t.city,
                    rating: t.rating,
                    message: t.message,
                    order: t.order,
                    is_approved: t.is_approved,
                })),
            })
        }
    }, [testimonialsData, form])

    const createMutation = useMutation({
        mutationFn: (data: PatientSuccessStoriesCreate) =>
            WebContentService.createTestimonials({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Testimonials section created successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-testimonials"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const updateMutation = useMutation({
        mutationFn: (data: PatientSuccessStoriesCreate) =>
            WebContentService.updateTestimonials({ testimonialsId: testimonialsId!, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Testimonials section updated successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-testimonials"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        const payload: PatientSuccessStoriesCreate = {
            title: data.title,
            testimonials: data.testimonials.map((t, idx) => ({
                name: t.name,
                city: t.city,
                rating: t.rating,
                message: t.message,
                order: idx + 1,
                is_approved: t.is_approved,
            })),
        }

        if (testimonialsId && testimonialsId !== -1) {
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
                    <h2 className="text-2xl font-bold">{testimonialsId && testimonialsId !== -1 ? "Edit" : "Create"} Patient Success Stories</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage testimonials and patient reviews
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
                                        <Input placeholder="Success Stories" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Testimonials</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: "", city: "", rating: 5, message: "", order: fields.length, is_approved: true })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Testimonial
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No testimonials added yet</p>
                        ) : (
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border rounded p-4 space-y-3">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm font-semibold">Testimonial {index + 1}</p>
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
                                                name={`testimonials.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Patient Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="John Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`testimonials.${index}.city`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Mumbai" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`testimonials.${index}.rating`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Rating (1-5)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`testimonials.${index}.message`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Testimonial Message</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Share the patient's testimonial..."
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
                                            name={`testimonials.${index}.is_approved`}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-xs font-normal cursor-pointer">
                                                        Approved for display
                                                    </FormLabel>
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
                            {testimonialsId && testimonialsId !== -1 ? "Update" : "Create"} Testimonials
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    )
}
