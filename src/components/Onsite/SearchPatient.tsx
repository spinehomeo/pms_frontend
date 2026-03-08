import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Phone, Search, User } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { PatientsService } from "@/client"
import type { OnsiteSearchResult } from "@/client/PatientsService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const searchSchema = z
    .object({
        phone: z.string().optional(),
        full_name: z.string().optional(),
    })
    .refine((data) => data.phone || data.full_name, {
        message: "Please enter a phone number or name to search",
    })

type SearchFormData = z.infer<typeof searchSchema>

interface SearchPatientProps {
    onSelectPatient: (patient: OnsiteSearchResult) => void
    onRegisterNew: (phone?: string, name?: string) => void
}

export function SearchPatient({
    onSelectPatient,
    onRegisterNew,
}: SearchPatientProps) {
    const [results, setResults] = useState<OnsiteSearchResult[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const { showErrorToast } = useCustomToast()

    const form = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            phone: "",
            full_name: "",
        },
    })

    const searchMutation = useMutation({
        mutationFn: (data: SearchFormData) =>
            PatientsService.onsiteSearch({
                phone: data.phone || undefined,
                full_name: data.full_name || undefined,
            }),
        onSuccess: (data) => {
            setResults(data)
            setHasSearched(true)
        },
        onError: handleError.bind(showErrorToast),
    })

    const onSubmit = (data: SearchFormData) => {
        searchMutation.mutate(data)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Search Patient</CardTitle>
                    <CardDescription>
                        Search for an existing patient by phone number or name
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="03001234567"
                                                        className="pl-8"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Patient name"
                                                        className="pl-8"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {form.formState.errors.root && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.root.message}
                                </p>
                            )}
                            <LoadingButton type="submit" loading={searchMutation.isPending}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </LoadingButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {hasSearched && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {results.length > 0
                                ? `Found ${results.length} Patient(s)`
                                : "No Patients Found"}
                        </CardTitle>
                        {results.length === 0 && (
                            <CardDescription>
                                No matching patients. You can register a new patient.
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {results.length > 0 ? (
                            results.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{patient.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {patient.phone}
                                        </p>
                                        <div className="flex gap-2">
                                            {patient.is_match_by_phone && (
                                                <Badge variant="secondary">Phone Match</Badge>
                                            )}
                                            {patient.is_match_by_name && (
                                                <Badge variant="secondary">Name Match</Badge>
                                            )}
                                            <Badge variant="outline">
                                                {Math.round(patient.match_score * 100)}% match
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => onSelectPatient(patient)}
                                    >
                                        Select
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <Button
                                onClick={() =>
                                    onRegisterNew(
                                        form.getValues("phone"),
                                        form.getValues("full_name"),
                                    )
                                }
                            >
                                Register New Patient
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
