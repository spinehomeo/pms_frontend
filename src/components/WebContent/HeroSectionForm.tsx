import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { WebContentService } from "@/client"
import type { HeroSectionCreate } from "@/client/WebContentService"
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

const credentialSchema = z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
    order: z.number().min(0),
})

const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    subtitle: z.string().min(1, "Subtitle is required").max(200),
    description: z.string().min(1, "Description is required").max(1000),
    credentials: z.array(credentialSchema).min(1, "At least one credential is required"),
})

type FormData = z.infer<typeof formSchema>

interface HeroSectionFormProps {
    heroId?: number
    onBack: () => void
}

export function HeroSectionForm({ heroId, onBack }: HeroSectionFormProps) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const isEditMode = typeof heroId === "number" && heroId > 0

    const { data: heroData } = useQuery({
        queryKey: ["hero-section", heroId],
        queryFn: () => (isEditMode ? WebContentService.getHeroSection(heroId) : null),
        enabled: isEditMode,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            title: "",
            subtitle: "",
            description: "",
            credentials: [{ label: "", value: "", order: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "credentials",
    })

    useEffect(() => {
        if (heroData) {
            form.reset({
                title: heroData.title,
                subtitle: heroData.subtitle,
                description: heroData.description,
                credentials: heroData.credentials.map((c) => ({
                    label: c.label,
                    value: c.value,
                    order: c.order,
                })),
            })
        }
    }, [heroData, form])

    const createMutation = useMutation({
        mutationFn: (data: HeroSectionCreate) =>
            WebContentService.createHeroSection({ requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Hero Section created successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-hero-sections"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const updateMutation = useMutation({
        mutationFn: (data: HeroSectionCreate) =>
            WebContentService.updateHeroSection({ heroId: heroId!, requestBody: data }),
        onSuccess: () => {
            showSuccessToast("Hero Section updated successfully")
            queryClient.invalidateQueries({ queryKey: ["web-content-hero-sections"] })
            onBack()
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        const payload: HeroSectionCreate = {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            credentials: data.credentials.map((c, idx) => ({
                label: c.label,
                value: c.value,
                order: idx + 1,
            })),
        }

        if (isEditMode) {
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
                    <h2 className="text-2xl font-bold">{isEditMode ? "Edit" : "Create"} Hero Section</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage the main banner content for your website
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Section Content</h3>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Welcome to Herbal Healing Clinic" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Experience Natural Wellness" {...field} />
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
                                        <Textarea
                                            placeholder="Detailed description of your clinic..."
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
                            <h3 className="text-lg font-semibold">Credentials</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ label: "", value: "", order: fields.length })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Credential
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No credentials added yet</p>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-end pb-4 border-b last:border-b-0">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <FormField
                                                control={form.control}
                                                name={`credentials.${index}.label`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Label</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Experience" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`credentials.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Value</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., 15+ Years" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => remove(index)}
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
                            {isEditMode ? "Update" : "Create"} Hero Section
                        </LoadingButton>
                    </div>
                </form>
            </Form>
        </div>
    )
}
