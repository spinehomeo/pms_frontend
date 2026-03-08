import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"

import { DoctorPreferencesService } from "@/client"
import type { FormType } from "@/client/DoctorPreferencesService"
import { DataTable } from "@/components/Common/DataTable"
import {
    AddCustomField,
    createColumns,
} from "@/components/DoctorPreferences"
import EnumManagement from "@/components/DoctorPreferences/EnumManagement"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

export const Route = createFileRoute("/_layout/core-settings")({
    component: CoreSettings,
    head: () => ({
        meta: [
            {
                title: "Core Settings - Preferences",
            },
        ],
    }),
})

function FieldsTableContent({ formType }: { formType: FormType }) {
    const { data: fields, isLoading } = useQuery({
        queryKey: ["doctor-preferences-fields", formType],
        queryFn: () => DoctorPreferencesService.getFieldsAll(formType),
    })
    const [searchQuery, setSearchQuery] = useState("")

    const columns = useMemo(() => createColumns(formType), [formType])

    const filteredFields = useMemo(() => {
        if (!fields) return []
        if (!searchQuery.trim()) return fields

        const query = searchQuery.toLowerCase()
        return fields.filter((field) => {
            return (
                field.display_name?.toLowerCase().includes(query) ||
                field.field_name?.toLowerCase().includes(query) ||
                field.field_type?.toLowerCase().includes(query)
            )
        })
    }, [fields, searchQuery])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!fields || fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                    Initialize Your {formType === "cases" ? "Case" : "Follow-up"} Fields
                </h3>
                <p className="text-muted-foreground mb-6">
                    Click the button below to set up standard fields for the first time
                </p>
                <InitializeButton formType={formType} />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {searchQuery && (
                        <p className="text-sm text-muted-foreground">
                            {filteredFields.length} result(s)
                        </p>
                    )}
                    <AddCustomField formType={formType} />
                </div>
            </div>
            {filteredFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No fields found</h3>
                    <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
            ) : (
                <DataTable columns={columns} data={filteredFields} />
            )}
        </div>
    )
}

function InitializeButton({ formType }: { formType: FormType }) {
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const initMutation = useMutation({
        mutationFn: () => DoctorPreferencesService.initializeStandardFields(formType),
        onSuccess: () => {
            showSuccessToast(`Standard ${formType} fields initialized successfully`)
            queryClient.invalidateQueries({ queryKey: ["doctor-preferences-fields", formType] })
        },
        onError: (error) => {
            handleError.call(showErrorToast, error as any)
        },
    })

    return (
        <Button
            onClick={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            size="lg"
        >
            {initMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize Standard Fields
        </Button>
    )
}

function CoreSettings() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Core Settings</h1>
                <p className="text-muted-foreground">
                    Manage form fields, preferences, and dropdown options
                </p>
            </div>

            <Tabs defaultValue="cases">
                <TabsList>
                    <TabsTrigger value="cases">Case Fields</TabsTrigger>
                    <TabsTrigger value="followups">Follow-up Fields</TabsTrigger>
                    <TabsTrigger value="enums">Dropdown Options</TabsTrigger>
                </TabsList>

                <TabsContent value="cases" className="mt-4">
                    <FieldsTableContent formType="cases" />
                </TabsContent>

                <TabsContent value="followups" className="mt-4">
                    <FieldsTableContent formType="followups" />
                </TabsContent>

                <TabsContent value="enums" className="mt-4">
                    <EnumManagement />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default CoreSettings
