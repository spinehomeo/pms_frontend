import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_layout/web-content/")({
    component: WebContentPage,
    head: () => ({
        meta: [
            {
                title: "Web Content Management",
            },
        ],
    }),
})

const contentSections = [
    {
        id: "hero-section",
        title: "🎯 Hero Section",
        description: "Main landing page banner with title, subtitle, and credentials",
        path: "/web-content/hero-section",
    },
    {
        id: "about-doctor",
        title: "👨‍⚕️ About Doctor",
        description: "Doctor biography, qualifications, experience, and specializations",
        path: "/web-content/about-doctor",
    },
    {
        id: "services",
        title: "🏥 Services & Treatments",
        description: "Service offerings with descriptions and images",
        path: "/web-content/services",
    },
    {
        id: "testimonials",
        title: "⭐ Patient Success Stories",
        description: "Testimonials and patient reviews with ratings",
        path: "/web-content/testimonials",
    },
    {
        id: "contact-info",
        title: "📞 Contact Information",
        description: "Phone, address, hours, and WhatsApp contact details",
        path: "/web-content/contact-info",
    },
]

function WebContentPage() {
    const navigate = useNavigate()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Web Content Management</h1>
                <p className="text-muted-foreground mt-2">
                    Manage all website content sections including hero banners, doctor information, services, testimonials, and contact details.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentSections.map((section) => (
                    <div
                        key={section.id}
                        className="border rounded-lg p-6 bg-card hover:shadow-lg transition-all hover:border-primary"
                    >
                        <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 min-h-10">
                            {section.description}
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate({ to: section.path })}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Manage
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
