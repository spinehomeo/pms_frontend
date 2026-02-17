import { Eye, Heart } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { MedicinesService, type MedicinePublic } from "@/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface ViewMedicineProps {
  medicine: MedicinePublic
}

const ViewMedicine = ({ medicine }: ViewMedicineProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(medicine.is_favorite)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => MedicinesService.toggleFavoriteMedicine(medicine.id),
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

  const createdDate = new Date(medicine.created_at)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Eye />
        View Details
      </DropdownMenuItem>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{medicine.name}</DialogTitle>
            <DialogDescription>
              Complete information about this medicine in the global catalog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medicine Name</p>
                <p className="text-base font-semibold">{medicine.name}</p>
              </div>
              <div className="flex gap-2">
                {medicine.is_verified && (
                  <Badge variant="default" className="bg-green-600">
                    Verified
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>
            </div>

            {medicine.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-base">{medicine.description}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potency</p>
                <p className="text-base font-mono">{medicine.potency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potency Scale</p>
                <p className="text-base">{medicine.potency_scale}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Form</p>
                <Badge variant="outline" className="capitalize mt-1">
                  {medicine.form}
                </Badge>
              </div>
            </div>

            {medicine.manufacturer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                <p className="text-base">{medicine.manufacturer}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Added On</p>
                <p className="text-base">{createdDate.toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  {createdDate.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-xs font-mono break-all">
                  {medicine.created_by_doctor_id}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
              <Badge variant={medicine.is_verified ? "default" : "secondary"} className="mt-1">
                {medicine.is_verified ? "Verified ✓" : "Pending Review"}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewMedicine