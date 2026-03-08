import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type Step = "search" | "register" | "review" | "consultation"

const steps: { key: Step; label: string; number: number }[] = [
    { key: "search", label: "Search", number: 1 },
    { key: "register", label: "Register", number: 2 },
    { key: "review", label: "Review", number: 3 },
    { key: "consultation", label: "Consultation", number: 4 },
]

interface StepIndicatorProps {
    currentStep: Step
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)

    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex
                const isCurrent = index === currentIndex

                return (
                    <div key={step.key} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                    isCompleted && "bg-primary text-primary-foreground",
                                    isCurrent && "bg-primary text-primary-foreground",
                                    !isCompleted &&
                                    !isCurrent &&
                                    "bg-muted text-muted-foreground",
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isCurrent ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-px w-8",
                                    index < currentIndex ? "bg-primary" : "bg-muted",
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
