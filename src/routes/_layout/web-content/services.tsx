import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Eye } from "lucide-react"
import { useState } from "react"

import { WebContentService } from "@/client"
import { Button } from "@/components/ui/button"
import { ServicesForm } from "@/components/WebContent/ServicesForm"

export const Route = createFileRoute("/_layout/web-content/services")({
    component: ServicesPage,
    head: () => ({
        meta: [
            {
                title: "Services - Web Content",
            },
        ],
    }),
})

function ServicesContent() {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const { data: servicesSections } = useSuspenseQuery({
        queryKey: ["web-content-services"],
        queryFn: () => WebContentService.listServices(),
    })

    if (selectedId) {
        return (
            <ServicesForm
                servicesId={selectedId}
                onBack={() => setSelectedId(null)}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/web-content" aria-label="Back to Web Content">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Services & Treatments</h1>
                    <p className="text-muted-foreground">
                        Manage service offerings with descriptions and images
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {servicesSections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No services sections created yet</p>
                        <Button onClick={() => setSelectedId(-1)}>Create Services</Button>
                    </div>
                ) : (
                    servicesSections.map((services) => (
                        <div
                            key={services.id}
                            className="border rounded-lg p-6 bg-card hover:shadow-md transition space-y-4"
                        >
                            <h3 className="font-semibold text-lg">{services.title}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="border rounded p-4 bg-muted/50 space-y-2"
                                    >
                                        <p className="font-semibold text-sm">{service.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {service.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Icon: {service.icon}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedId(services.id)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function ServicesPage() {
    return <ServicesContent />
}
