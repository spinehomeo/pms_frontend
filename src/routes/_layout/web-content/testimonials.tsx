import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Eye, Star } from "lucide-react"
import { useState } from "react"

import { WebContentService } from "@/client"
import { Button } from "@/components/ui/button"
import { TestimonialsForm } from "@/components/WebContent/TestimonialsForm"

export const Route = createFileRoute("/_layout/web-content/testimonials")({
    component: TestimonialsPage,
    head: () => ({
        meta: [
            {
                title: "Testimonials - Web Content",
            },
        ],
    }),
})

function TestimonialsContent() {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const { data: testimonialsSections } = useSuspenseQuery({
        queryKey: ["web-content-testimonials"],
        queryFn: () => WebContentService.listTestimonials(),
    })

    if (selectedId) {
        return (
            <TestimonialsForm
                testimonialsId={selectedId}
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
                    <h1 className="text-2xl font-bold">Patient Success Stories</h1>
                    <p className="text-muted-foreground">
                        Manage testimonials and patient reviews with ratings
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {testimonialsSections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No testimonials sections created yet</p>
                        <Button onClick={() => setSelectedId(-1)}>Create Testimonials</Button>
                    </div>
                ) : (
                    testimonialsSections.map((section) => (
                        <div
                            key={section.id}
                            className="border rounded-lg p-6 bg-card hover:shadow-md transition space-y-4"
                        >
                            <h3 className="font-semibold text-lg">{section.title}</h3>

                            <div className="space-y-3">
                                {section.testimonials.map((testimonial) => (
                                    <div
                                        key={testimonial.id}
                                        className="border rounded p-4 bg-muted/50 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                                <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {testimonial.message}
                                        </p>
                                        <div className="flex items-center gap-2 pt-2">
                                            {!testimonial.is_approved && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                    Not Approved
                                                </span>
                                            )}
                                            {testimonial.is_approved && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    Approved
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedId(section.id)}
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

function TestimonialsPage() {
    return <TestimonialsContent />
}
