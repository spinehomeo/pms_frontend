import { Heart, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { MedicinesService } from "@/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface FavoriteMedicineToggleProps {
    medicineId: number
    initialIsFavorite: boolean
}

export const FavoriteMedicineToggle = ({
    medicineId,
    initialIsFavorite,
}: FavoriteMedicineToggleProps) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()

    const toggleFavoriteMutation = useMutation({
        mutationFn: () => MedicinesService.toggleFavoriteMedicine(medicineId),
        onSuccess: (data) => {
            setIsFavorite(!isFavorite)
            showSuccessToast(data.message)
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["medicines-search"] })
            queryClient.invalidateQueries({ queryKey: ["medicines-all"] })
        },
    })

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation()
        toggleFavoriteMutation.mutate()
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            className="h-auto p-1"
        >
            {toggleFavoriteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
                <Heart
                    className={cn(
                        "h-4 w-4",
                        isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                />
            )}
        </Button>
    )
}
