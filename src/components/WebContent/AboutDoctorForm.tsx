import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { WebContentService } from "@/client"
import type { AboutDoctorCreate } from "@/client/WebContentService"
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

const qualificationSchema = z.object({
    qualification_text: z.string().min(1, "Qualification is required"),
    order: z.number().min(0),
})

const specializationSchema = z.object({
    specialization_text: z.string().min(1, "Specialization is required"),
    order: z.number().min(0),
})

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    experience_title: z.string().min(1, "Experience title is required"),
    experience_description: z.string().min(1, "Experience description is required"),
    qualifications: z.array(qualificationSchema).min(1, "At least one qualification is required"),
    specializations: z.array(specializationSchema).min(1, "At least one specialization is required"),
})

type FormData = z.infer<typeof formSchema>

interface AboutDoctorFormProps {
    aboutDoctorId?: number
    onBack: () => void
}

export function AboutDoctorForm({ aboutDoctorId, onBack }: AboutDoctorFormProps) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: aboutData } = useQuery({
        queryKey: ["about-doctor", aboutDoctorId],
        queryFn: () => (aboutDoctorId ? WebContentService.getAboutDoctor(aboutDoctorId) : null),
        enabled: !!aboutDoctorId && aboutDoctorId !== -1,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            title: "",
            experience_title: "",
            experience_description: "",
            qualifications: [{ qualification_text: "", order: 0 }],
            specializations: [{ specialization_text: "", order: 0 }],
        },
    })

    const { fields: qualFields, append: appendQual, remove: removeQual } = useFieldArray({
        control: form.control,
        name: "qualifications",
    })

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control: form.control,
        name: "specializations",
    })

    useEffect(() => {
        if (aboutData) {
            form.reset({
                title: aboutData.title,
                experience_title: aboutData.experience_title,
                experience_description: aboutData.experience_description,
                qualifications: aboutData.qualifications.map((q) => ({
                    qualification_text: q.qualification_text,
                    order: q.order,
                })),
                specializations: aboutData.specializations.map((s) => ({
                    specialization_text: s.specialization_text,
                    order: s.order,
                })),
            })
        }
    }, [aboutData, form])

    const createMutation = useMutation({
        mutationFn: (data: AboutDoctorCreate) =>
            WebContentService.createAboutDoctor({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("About Doctor section created successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-about-doctor"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const updateMutation = useMutation({
        mutationFn: (data: AboutDoctorCreate) =>
            WebContentService.updateAboutDoctor({ aboutDoctorId: aboutDoctorId!, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("About Doctor section updated successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-about-doctor"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        const payload: AboutDoctorCreate = {
            title: data.title,
            experience_title: data.experience_title,
            experience_description: data.experience_description,
            qualifications: data.qualifications.map((q, idx) => ({
                qualification_text: q.qualification_text,
                order: idx + 1,
            })),
            specializations: data.specializations.map((s, idx) => ({
                specialization_text: s.specialization_text,
                order: idx + 1,
            })),
        }

        if (aboutDoctorId && aboutDoctorId !== -1) {
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
                    <h2 className="text-2xl font-bold">{aboutDoctorId && aboutDoctorId !== -1 ? "Edit" : "Create"} About Doctor</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage doctor biography, qualifications, and specializations
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Doctor Information</h3>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Doctor Name / Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Dr. Raj Kumar" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="experience_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 15+ Years in Holistic Medicine" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="experience_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the doctor's experience..."
                                            {...field}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Qualifications</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendQual({ qualification_text: "", order: qualFields.length })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        {qualFields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No qualifications added yet</p>
                        ) : (
                            <div className="space-y-3">
                                {qualFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-end">
                                        <FormField
                                            control={form.control}
                                            name={`qualifications.${index}.qualification_text`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., BAMS (Bachelor of Ayurvedic Medicine)"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeQual(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Specializations</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendSpec({ specialization_text: "", order: specFields.length })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>

                        {specFields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No specializations added yet</p>
                        ) : (
                            <div className="space-y-3">
                                {specFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-end">
                                        <FormField
                                            control={form.control}
                                            name={`specializations.${index}.specialization_text`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., Herbal Medicine Specialist"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeSpec(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                            {aboutDoctorId && aboutDoctorId !== -1 ? "Update" : "Create"} About Doctor
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    )
}
