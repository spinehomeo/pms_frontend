import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import {
    type FinanceCustomField,
    type FinanceCustomFieldType,
    type FinanceEnumOption,
    FinanceApi,
} from "@/services/financeApi"
import { handleError } from "@/utils"

const formSchema = z.object({
    nature_code: z.string().min(1, "Transaction type is required"),
    category_code: z.string().min(1, "Category is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    transaction_date: z.string().min(1, "Transaction date is required"),
    remarks: z.string().max(500, "Remarks are too long").optional(),
})

type FormData = z.infer<typeof formSchema>
type CustomFieldValue = string | number | boolean

const NATURE_FALLBACK: FinanceEnumOption[] = [
    { value: "CASH_IN", label: "Cash In" },
    { value: "CASH_OUT", label: "Cash Out" },
]

const CATEGORY_FALLBACK: FinanceEnumOption[] = [
    { value: "CONSULTATION", label: "Consultation" },
    { value: "MEDICINE_PURCHASE", label: "Medicine Purchase" },
    { value: "EQUIPMENT", label: "Equipment" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "SALARY", label: "Salary" },
    { value: "RENT", label: "Rent" },
    { value: "OTHER", label: "Other" },
]

const toTitleCase = (value: string) =>
    value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())

const normalizeEnumOptions = (
    data: unknown,
    fallback: FinanceEnumOption[],
): FinanceEnumOption[] => {
    if (Array.isArray(data)) {
        if (data.every((item) => typeof item === "string")) {
            return data.map((item) => ({ value: item, label: toTitleCase(item) }))
        }

        const fromObjects = data
            .map((item) => {
                if (!item || typeof item !== "object") return null
                const record = item as Record<string, unknown>
                const valueCandidate =
                    typeof record.value === "string"
                        ? record.value
                        : typeof record.code === "string"
                            ? record.code
                            : null
                const labelCandidate =
                    typeof record.label === "string"
                        ? record.label
                        : typeof record.name === "string"
                            ? record.name
                            : valueCandidate

                if (!valueCandidate || !labelCandidate) return null

                return {
                    value: valueCandidate,
                    label: labelCandidate,
                }
            })
            .filter((item): item is FinanceEnumOption => item !== null)

        if (fromObjects.length > 0) {
            return fromObjects
        }
    }

    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>
        for (const key of ["data", "values", "options", "enum_values"]) {
            if (record[key] !== undefined) {
                const nested = normalizeEnumOptions(record[key], [])
                if (nested.length > 0) return nested
            }
        }
    }

    return fallback
}

const parseCustomFieldValue = (
    type: FinanceCustomFieldType,
    rawValue: CustomFieldValue,
): CustomFieldValue | null => {
    if (type === "boolean") {
        return Boolean(rawValue)
    }

    if (type === "number") {
        const parsed = Number(rawValue)
        return Number.isFinite(parsed) ? parsed : null
    }

    const normalized = String(rawValue).trim()
    return normalized.length > 0 ? normalized : null
}

interface AddTransactionProps {
    cashBookId: string | null
    triggerLabel?: string
    fixedNatureCode?: "CASH_IN" | "CASH_OUT"
}

const AddTransaction = ({
    cashBookId,
    triggerLabel = "Add Transaction",
    fixedNatureCode,
}: AddTransactionProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, CustomFieldValue>>({})

    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nature_code: fixedNatureCode ?? "CASH_IN",
            category_code: "",
            amount: 0,
            transaction_date: new Date().toISOString().split("T")[0],
            remarks: "",
        },
    })

    useEffect(() => {
        if (fixedNatureCode) {
            form.setValue("nature_code", fixedNatureCode)
        }
    }, [fixedNatureCode, form])

    const { data: natureEnumData } = useQuery({
        queryKey: ["finance", "enums", "nature"],
        queryFn: () => FinanceApi.readTransactionNatureEnum(),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: categoryEnumData } = useQuery({
        queryKey: ["finance", "enums", "category"],
        queryFn: () => FinanceApi.readTransactionCategoryEnum(),
        enabled: isOpen,
        retry: false,
        throwOnError: false,
    })

    const { data: customFields = [] } = useQuery({
        queryKey: ["finance", "custom-fields", cashBookId],
        queryFn: () => FinanceApi.listCustomFields(cashBookId as string),
        enabled: isOpen && Boolean(cashBookId),
        retry: false,
        throwOnError: false,
    })

    const natureOptions = useMemo(
        () => normalizeEnumOptions(natureEnumData, NATURE_FALLBACK),
        [natureEnumData],
    )

    const categoryOptions = useMemo(
        () => normalizeEnumOptions(categoryEnumData, CATEGORY_FALLBACK),
        [categoryEnumData],
    )

    const mutation = useMutation({
        mutationFn: (payload: {
            nature_code: string
            category_code: string
            amount: number
            transaction_date: string
            remarks?: string
            custom_field_values?: Record<string, CustomFieldValue>
        }) =>
            FinanceApi.createTransaction({
                cash_book_id: cashBookId as string,
                ...payload,
            }),
        onSuccess: () => {
            showSuccessToast("Transaction created successfully")
            form.reset({
                nature_code: fixedNatureCode ?? "CASH_IN",
                category_code: "",
                amount: 0,
                transaction_date: new Date().toISOString().split("T")[0],
                remarks: "",
            })
            setCustomFieldValues({})
            setIsOpen(false)

            queryClient.invalidateQueries({ queryKey: ["finance", "transactions"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "summary"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "balance"] })
            queryClient.invalidateQueries({ queryKey: ["finance", "doctor-summary"] })
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: FormData) => {
        if (!cashBookId) {
            showErrorToast("Please create or select a cash book first")
            return
        }

        const normalizedCustomFields: Record<string, CustomFieldValue> = {}

        for (const field of customFields) {
            const currentValue = customFieldValues[field.field_key]

            if (field.is_required) {
                const isMissing =
                    currentValue === undefined ||
                    currentValue === null ||
                    (typeof currentValue === "string" && currentValue.trim().length === 0)

                if (isMissing) {
                    showErrorToast(`${field.field_label} is required`)
                    return
                }
            }

            if (currentValue === undefined) {
                continue
            }

            const parsedValue = parseCustomFieldValue(field.field_type, currentValue)
            if (parsedValue === null) {
                showErrorToast(`Invalid value for ${field.field_label}`)
                return
            }

            normalizedCustomFields[field.field_key] = parsedValue
        }

        mutation.mutate({
            nature_code: fixedNatureCode ?? data.nature_code,
            category_code: data.category_code,
            amount: data.amount,
            transaction_date: data.transaction_date,
            remarks: data.remarks?.trim() || undefined,
            custom_field_values:
                Object.keys(normalizedCustomFields).length > 0
                    ? normalizedCustomFields
                    : undefined,
        })
    }

    const handleTextFieldChange = (field: FinanceCustomField, value: string) => {
        setCustomFieldValues((previous) => ({
            ...previous,
            [field.field_key]: value,
        }))
    }

    const renderCustomField = (field: FinanceCustomField) => {
        if (field.field_type === "boolean") {
            const checked = Boolean(customFieldValues[field.field_key])

            return (
                <div className="flex items-center space-x-2 pt-2" key={field.id}>
                    <Checkbox
                        id={field.id}
                        checked={checked}
                        onCheckedChange={(value) => {
                            setCustomFieldValues((previous) => ({
                                ...previous,
                                [field.field_key]: Boolean(value),
                            }))
                        }}
                    />
                    <Label htmlFor={field.id}>{field.field_label}</Label>
                </div>
            )
        }

        return (
            <div className="space-y-2" key={field.id}>
                <Label>
                    {field.field_label}
                    {field.is_required ? " *" : ""}
                </Label>
                <Input
                    type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                    value={String(customFieldValues[field.field_key] ?? "")}
                    onChange={(event) => handleTextFieldChange(field, event.target.value)}
                />
            </div>
        )
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                    setCustomFieldValues({})
                }
            }}
        >
            <DialogTrigger asChild>
                <Button disabled={!cashBookId}>
                    <Plus className="mr-2 h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Record a cash in or cash out entry for the selected cash book.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!fixedNatureCode && (
                                <FormField
                                    control={form.control}
                                    name="nature_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Type</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {natureOptions.map((option) => (
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
                            )}

                            <FormField
                                control={form.control}
                                name="category_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoryOptions.map((option) => (
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={field.value}
                                                onChange={(event) => field.onChange(Number(event.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="transaction_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transaction Date</FormLabel>
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
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={3}
                                            placeholder="Optional notes"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {customFields.length > 0 && (
                            <div className="space-y-3 rounded-md border p-4">
                                <h4 className="text-sm font-medium">Custom Fields</h4>
                                {customFields.map((field) => renderCustomField(field))}
                            </div>
                        )}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={mutation.isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <LoadingButton type="submit" loading={mutation.isPending} disabled={!cashBookId}>
                                Save Transaction
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddTransaction
