import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Eye } from "lucide-react"
import { useState } from "react"

import { WebContentService } from "@/client"
import { Button } from "@/components/ui/button"
import { HeroSectionForm } from "@/components/WebContent/HeroSectionForm"

export const Route = createFileRoute("/_layout/web-content/hero-section")({
    component: HeroSectionPage,
    head: () => ({
        meta: [
            {
                title: "Hero Section - Web Content",
            },
        ],
    }),
})

function HeroSectionContent() {
    const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null)
    const { data: heroSections } = useSuspenseQuery({
        queryKey: ["web-content-hero-sections"],
        queryFn: () => WebContentService.listHeroSections(),
    })

    if (selectedHeroId) {
        return (
            <HeroSectionForm
                heroId={selectedHeroId}
                onBack={() => setSelectedHeroId(null)}
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
                    <h1 className="text-2xl font-bold">Hero Section</h1>
                    <p className="text-muted-foreground">
                        Manage the main banner content displayed on your website
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {heroSections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No hero sections created yet</p>
                        <Button onClick={() => setSelectedHeroId(-1)}>Create Hero Section</Button>
                    </div>
                ) : (
                    heroSections.map((hero) => (
                        <div
                            key={hero.id}
                            className="border rounded-lg p-6 flex items-start justify-between bg-card hover:shadow-md transition"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{hero.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{hero.subtitle}</p>
                                <div className="flex gap-2 flex-wrap">
                                    {hero.credentials.map((cred) => (
                                        <span key={cred.id} className="text-xs bg-muted px-2 py-1 rounded">
                                            {cred.label}: {cred.value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedHeroId(hero.id)}
                                className="ml-4"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function HeroSectionPage() {
    return <HeroSectionContent />
}
