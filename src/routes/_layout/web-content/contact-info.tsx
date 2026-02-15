import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Eye, MapPin, Phone, Clock, MessageSquare } from "lucide-react"
import { useState } from "react"

import { WebContentService } from "@/client"
import { Button } from "@/components/ui/button"
import { ContactInformationForm } from "@/components/WebContent/ContactInformationForm"

export const Route = createFileRoute("/_layout/web-content/contact-info")({
    component: ContactInfoPage,
    head: () => ({
        meta: [
            {
                title: "Contact Information - Web Content",
            },
        ],
    }),
})

function ContactInfoContent() {
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const { data: contactInfos } = useSuspenseQuery({
        queryKey: ["web-content-contact-info"],
        queryFn: () => WebContentService.listContactInfo(),
    })

    if (selectedId) {
        return (
            <ContactInformationForm
                contactId={selectedId}
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
                    <h1 className="text-2xl font-bold">Contact Information</h1>
                    <p className="text-muted-foreground">
                        Manage clinic contact details, hours, and WhatsApp information
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {contactInfos.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No contact information created yet</p>
                        <Button onClick={() => setSelectedId(-1)}>Create Contact Information</Button>
                    </div>
                ) : (
                    contactInfos.map((contact) => (
                        <div
                            key={contact.id}
                            className="border rounded-lg p-6 bg-card hover:shadow-md transition space-y-4"
                        >
                            <div>
                                <h3 className="font-semibold text-lg">{contact.title}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold">{contact.address}</p>
                                            <p className="text-muted-foreground">{contact.city}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold">{contact.phone_primary}</p>
                                            {contact.phone_secondary && (
                                                <p className="text-muted-foreground">{contact.phone_secondary}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="text-sm">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Hours</p>
                                            <p className="text-xs">Weekdays: {contact.weekdays_hours}</p>
                                            <p className="text-xs">Saturday: {contact.saturday_hours}</p>
                                            <p className="text-xs">Sunday: {contact.sunday_hours}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="text-sm">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">WhatsApp</p>
                                            <p className="text-xs">{contact.whatsapp_number}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedId(contact.id)}
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

function ContactInfoPage() {
    return <ContactInfoContent />
}
