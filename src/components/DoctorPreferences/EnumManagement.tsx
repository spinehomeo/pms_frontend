import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Loader2, Plus, Search } from "lucide-react"
import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { EnumsService } from "@/client"
import type { EnumPreferenceItem } from "@/client/EnumsService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

function extractPreferenceItems(data: unknown): EnumPreferenceItem[] {
    if (Array.isArray(data)) return data
    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>
        // API returns { enabled_options: [...], disabled_options: [...] }
        if (Array.isArray(record.enabled_options) || Array.isArray(record.disabled_options)) {
            const enabled = (Array.isArray(record.enabled_options) ? record.enabled_options : []).map(
                (item: any) => ({ ...item, is_enabled: true }),
            )
            const disabled = (Array.isArray(record.disabled_options) ? record.disabled_options : []).map(
                (item: any) => ({ ...item, is_enabled: false }),
            )
            return [...enabled, ...disabled]
        }
        for (const key of ["data", "items", "values", "options", "results", "enum_values", "preferences"]) {
            if (Array.isArray(record[key])) return record[key]
        }
    }
    return []
}
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
import { LoadingButton } from "@/components/ui/loading-button"
import { cn } from "@/lib/utils"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const ENUM_TYPES = [
    { key: "AppointmentStatus", label: "Appointment Status" },
    { key: "CaseStatus", label: "Case Status" },
    { key: "ConsultationType", label: "Consultation Type" },
    { key: "FollowupStatus", label: "Follow-up Status" },
    { key: "PatientGender", label: "Patient Gender" },
    { key: "PrescriptionStatus", label: "Prescription Status" },
    { key: "PrescriptionType", label: "Prescription Type" },
    { key: "RepetitionEnum", label: "Repetition" },
    { key: "ScaleEnum", label: "Scale" },
    { key: "FormEnum", label: "Medicine Form" },
    { key: "ManufacturerEnum", label: "Manufacturer" },
    { key: "DayOfWeek", label: "Day of Week" },
    { key: "ExceptionType", label: "Exception Type" },
] as const

const addOptionSchema = z.object({
    value: z.string().min(1, "Value is required"),
    label: z.string().min(1, "Label is required"),
    sort_order: z.string().optional(),
})

type AddOptionFormData = z.infer<typeof addOptionSchema>

function AddEnumOptionDialog({
    enumType,
    onSuccess,
}: {
    enumType: string
    onSuccess: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const form = useForm<AddOptionFormData>({
        resolver: zodResolver(addOptionSchema),
        defaultValues: { value: "", label: "", sort_order: undefined },
    })

    const mutation = useMutation({
        mutationFn: (data: AddOptionFormData) =>
            EnumsService.addCustomEnumOption(enumType, {
                value: data.value,
                label: data.label,
                sort_order: data.sort_order ? Number(data.sort_order) : undefined,
            }),
        onSuccess: () => {
            showSuccessToast("Option added successfully")
            form.reset()
            setIsOpen(false)
            onSuccess()
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Add Option
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Custom Option</DialogTitle>
                        <DialogDescription>
                            Add a new option to {enumType.replace(/([A-Z])/g, " $1").trim()}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., rescheduled" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Rescheduled" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sort_order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sort Order (optional)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <LoadingButton type="submit" loading={mutation.isPending}>
                                    Add Option
                                </LoadingButton>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function EnumGroupCard({ enumTypeKey, enumLabel }: { enumTypeKey: string; enumLabel: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const { data: rawPreferences, isLoading } = useQuery({
        queryKey: ["enum-preferences", enumTypeKey],
        queryFn: () => EnumsService.getEnumPreferences(enumTypeKey),
        enabled: isExpanded,
        retry: false,
    })

    const preferences = useMemo(() => extractPreferenceItems(rawPreferences), [rawPreferences])

    const toggleMutation = useMutation({
        mutationFn: ({ optionId, isEnabled }: { optionId: string; isEnabled: boolean }) =>
            EnumsService.toggleEnumOption(optionId, isEnabled),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["enum-preferences", enumTypeKey] })
            showSuccessToast("Option toggled successfully")
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    const handleToggle = (item: EnumPreferenceItem) => {
        toggleMutation.mutate({ optionId: item.id, isEnabled: !item.is_enabled })
    }

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["enum-preferences", enumTypeKey] })
    }

    const enabledCount = preferences.filter((p) => p.is_enabled).length
    const totalCount = preferences.length

    return (
        <Card className="overflow-hidden">
            <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium">{enumLabel}</span>
                    {isExpanded && preferences.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {enabledCount}/{totalCount} enabled
                        </Badge>
                    )}
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </button>

            {isExpanded && (
                <div className="border-t px-4 py-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : preferences.length > 0 ? (
                        <div className="space-y-3">
                            <div className="grid gap-2">
                                {preferences.map((item) => (
                                    <label
                                        key={item.id}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors hover:bg-muted/50",
                                            !item.is_enabled && "opacity-60",
                                        )}
                                    >
                                        <Checkbox
                                            checked={item.is_enabled}
                                            onCheckedChange={() => handleToggle(item)}
                                            disabled={toggleMutation.isPending}
                                        />
                                        <div className="flex flex-1 items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium">{item.label}</span>
                                                <span className="ml-2 text-xs text-muted-foreground">({item.value})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.is_system && (
                                                    <Badge variant="outline" className="text-xs">System</Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        item.is_enabled
                                                            ? "bg-green-500/10 text-green-600"
                                                            : "bg-red-500/10 text-red-600",
                                                    )}
                                                >
                                                    {item.is_enabled ? "On" : "Off"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2">
                                <AddEnumOptionDialog enumType={enumTypeKey} onSuccess={handleRefresh} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center">
                            <p className="text-sm text-muted-foreground">No options found for this enum type</p>
                            <div className="mt-3">
                                <AddEnumOptionDialog enumType={enumTypeKey} onSuccess={handleRefresh} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}

export default function EnumManagement() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredEnumTypes = useMemo(() => {
        if (!searchQuery.trim()) return ENUM_TYPES
        const query = searchQuery.toLowerCase()
        return ENUM_TYPES.filter(
            (e) =>
                e.label.toLowerCase().includes(query) ||
                e.key.toLowerCase().includes(query),
        )
    }, [searchQuery])

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search enum types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                        {filteredEnumTypes.length} result(s)
                    </p>
                )}
            </div>

            {filteredEnumTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No enum types found</h3>
                    <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredEnumTypes.map((enumType) => (
                        <EnumGroupCard
                            key={enumType.key}
                            enumTypeKey={enumType.key}
                            enumLabel={enumType.label}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
