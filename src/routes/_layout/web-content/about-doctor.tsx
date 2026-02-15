import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Eye } from "lucide-react"
import { useState } from "react"

import { WebContentService } from "@/client"
import { Button } from "@/components/ui/button"
import { AboutDoctorForm } from "@/components/WebContent/AboutDoctorForm"

export const Route = createFileRoute("/_layout/web-content/about-doctor")({
    component: AboutDoctorPage,
    head: () => ({
        meta: [
            {
                title: "About Doctor - Web Content",
            },
        ],
    }),
})

function AboutDoctorContent() {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const { data: aboutSections } = useSuspenseQuery({
        queryKey: ["web-content-about-doctor"],
        queryFn: () => WebContentService.listAboutDoctor(),
    })

    if (selectedId) {
        return (
            <AboutDoctorForm
                aboutDoctorId={selectedId}
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
                    <h1 className="text-2xl font-bold">About Doctor</h1>
                    <p className="text-muted-foreground">
                        Manage doctor biography, qualifications, and specializations
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {aboutSections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No about doctor sections created yet</p>
                        <Button onClick={() => setSelectedId(-1)}>Create About Doctor</Button>
                    </div>
                ) : (
                    aboutSections.map((about) => (
                        <div
                            key={about.id}
                            className="border rounded-lg p-6 flex flex-col gap-4 bg-card hover:shadow-md transition"
                        >
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{about.title}</h3>
                                <p className="text-sm text-muted-foreground">{about.experience_title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {about.experience_description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Qualifications</p>
                                    <div className="flex flex-col gap-1">
                                        {about.qualifications.map((qual) => (
                                            <span key={qual.id} className="text-xs bg-muted px-2 py-1 rounded w-fit">
                                                {qual.qualification_text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Specializations</p>
                                    <div className="flex flex-col gap-1">
                                        {about.specializations.map((spec) => (
                                            <span key={spec.id} className="text-xs bg-muted px-2 py-1 rounded w-fit">
                                                {spec.specialization_text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedId(about.id)}
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

function AboutDoctorPage() {
    return <AboutDoctorContent />
}
