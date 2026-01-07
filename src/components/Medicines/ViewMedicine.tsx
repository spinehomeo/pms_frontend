import { Eye } from "lucide-react"
import { useState } from "react"

import type { DoctorMedicineStockPublic } from "@/client/MedicinesService"
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
import { cn } from "@/lib/utils"

interface ViewMedicineProps {
  stock: DoctorMedicineStockPublic
}

const ViewMedicine = ({ stock }: ViewMedicineProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const expiryDate = stock.expiry_date ? new Date(stock.expiry_date) : null
  const today = new Date()
  const isExpired = expiryDate ? expiryDate < today : false
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
  const isLowStock = stock.quantity <= stock.low_stock_threshold

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
            <DialogTitle>Medicine Stock Details</DialogTitle>
            <DialogDescription>
              Complete information about the medicine stock item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Medicine</p>
              <p className="text-base font-semibold text-lg">{stock.medicine_name || "Unknown"}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potency</p>
                <p className="text-base font-mono">{stock.potency}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potency Scale</p>
                <p className="text-base">{stock.potency_scale}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Form</p>
                <Badge variant="outline" className="capitalize mt-1">
                  {stock.form}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={stock.is_active ? "default" : "secondary"} className="mt-1">
                  {stock.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className={cn(
                  "text-base font-semibold",
                  isLowStock && "text-orange-500"
                )}>
                  {stock.quantity} {stock.unit}
                </p>
                {isLowStock && (
                  <p className="text-xs text-orange-500 mt-1">Low stock warning</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Threshold</p>
                <p className="text-base">{stock.low_stock_threshold} {stock.unit}</p>
              </div>
            </div>

            {stock.expiry_date && expiryDate && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                <p className={cn(
                  "text-base",
                  isExpired && "text-red-500 font-medium",
                  !isExpired && daysUntilExpiry && daysUntilExpiry <= 30 && "text-orange-500"
                )}>
                  {expiryDate.toLocaleDateString()}
                  {isExpired && <span className="ml-2 text-xs">(Expired)</span>}
                  {!isExpired && daysUntilExpiry && daysUntilExpiry <= 30 && (
                    <span className="ml-2 text-xs">({daysUntilExpiry} days remaining)</span>
                  )}
                </p>
              </div>
            )}

            {stock.batch_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Batch Number</p>
                <p className="text-base font-mono">{stock.batch_number}</p>
              </div>
            )}

            {stock.manufacturer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                <p className="text-base">{stock.manufacturer}</p>
              </div>
            )}

            {stock.purchase_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p className="text-base">
                  {new Date(stock.purchase_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Storage Location</p>
              <p className="text-base">{stock.storage_location}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewMedicine

