import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

import { DoctorPreferencesService } from "@/client"
import { DataTable } from "@/components/Common/DataTable"
import {
    AddCustomField,
    columns,
} from "@/components/DoctorPreferences"
import PendingAppointments from "@/components/Pending/PendingAppointments"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

function getFieldsQueryOptions() {
    return {
        queryFn: () => DoctorPreferencesService.getFields(),
        queryKey: ["doctor-preferences-fields"],
    }
}

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

function FieldsTableContent() {
    const { data: fields } = useSuspenseQuery(getFieldsQueryOptions())
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFields = useMemo(() => {
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

    if (fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Initialize Your Case Fields</h3>
                <p className="text-muted-foreground mb-6">Click the button below to set up standard fields for the first time</p>
                <InitializeButton />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search fields..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                        {filteredFields.length} result(s) found
                    </p>
                )}
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

function InitializeButton() {
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const initMutation = useMutation({
        mutationFn: () => DoctorPreferencesService.initializeStandardFields(),
        onSuccess: () => {
            showSuccessToast("Standard fields initialized successfully")
            // Refetch the fields
            window.location.reload()
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

function FieldsTable() {
    return (
        <Suspense fallback={<PendingAppointments />}>
            <FieldsTableContent />
        </Suspense>
    )
}

function CoreSettings() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Core Settings</h1>
                    <p className="text-muted-foreground">Manage your case form fields and preferences</p>
                </div>
                <AddCustomField />
            </div>
            <FieldsTable />
        </div>
    )
}

export default CoreSettings
