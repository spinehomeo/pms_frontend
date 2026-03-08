import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { DoctorPreferencesService } from "@/client"
import type { FormType } from "@/client/DoctorPreferencesService"
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
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
    field_name: z
        .string()
        .min(1, "Field name is required")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    display_name: z.string().min(1, "Display name is required"),
    field_type: z.enum(["text", "textarea", "number", "date", "select", "checkbox"]),
    is_required: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

const AddCustomField = ({ formType = "cases" }: { formType?: FormType }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            field_name: "",
            display_name: "",
            field_type: "text",
            is_required: false,
        },
    })

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            return DoctorPreferencesService.addCustomField({
                field_name: data.field_name,
                display_name: data.display_name,
                field_type: data.field_type,
                is_required: data.is_required,
                form_type: formType,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doctor-preferences-fields"] })
            showSuccessToast("Custom field added successfully")
            setIsOpen(false)
            form.reset()
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    const onSubmit = async (data: FormData) => {
        mutation.mutate(data)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Custom Field</DialogTitle>
                        <DialogDescription>
                            Create a new custom field for your case forms
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="field_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., family_history"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="display_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Family History"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="field_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Type</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select field type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="select">Select</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_required"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-0.5">
                                            <FormLabel>Required Field</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <LoadingButton
                                    type="submit"
                                    loading={mutation.isPending}
                                    disabled={mutation.isPending}
                                >
                                    Add Field
                                </LoadingButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Button onClick={() => setIsOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
            </Button>
        </>
    )
}

export default AddCustomField
