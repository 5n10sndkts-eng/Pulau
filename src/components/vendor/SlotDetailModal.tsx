import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Users,
  Ban,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import type { ExperienceSlot } from '@/lib/slotService'

interface SlotDetailModalProps {
  isOpen: boolean
  onClose: () => void
  slot: ExperienceSlot | null
  onBlock: (slotId: string, reason: string) => Promise<void>
  onUnblock: (slotId: string) => Promise<void>
  onDelete: (slotId: string) => Promise<void>
  onUpdate: (slotId: string, updates: { totalCapacity?: number }) => Promise<void>
}

export function SlotDetailModal({
  isOpen,
  onClose,
  slot,
  onBlock,
  onUnblock,
  onDelete,
  onUpdate,
}: SlotDetailModalProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (isOpen && slot) {
      setIsBlocked(slot.is_blocked ?? false)
      setBlockReason('')
      setCapacity(slot.total_capacity)
      setShowDeleteConfirm(false)
    }
  }, [isOpen, slot])

  if (!slot) return null

  const hasBookings = slot.available_count < slot.total_capacity
  const bookedCount = slot.total_capacity - slot.available_count

  const handleBlockToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      if (checked) {
        await onBlock(slot.id, blockReason || 'Manual block by vendor')
      } else {
        await onUnblock(slot.id)
      }
      setIsBlocked(checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCapacity = async () => {
    if (capacity === slot.total_capacity) return
    setIsLoading(true)
    try {
      await onUpdate(slot.id, { totalCapacity: capacity })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(slot.id)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = format(new Date(slot.slot_date), 'EEEE, MMMM d, yyyy')
  const formattedTime = slot.slot_time.slice(0, 5) // HH:MM

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Slot Details
          </DialogTitle>
          <DialogDescription>
            {formattedDate} at {formattedTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status</span>
            {slot.is_blocked ? (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <Ban className="w-3 h-3 mr-1" />
                Blocked
              </Badge>
            ) : slot.available_count === 0 ? (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <Users className="w-3 h-3 mr-1" />
                Sold Out
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            )}
          </div>

          {/* Capacity Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Capacity</span>
              <span className="font-medium">{slot.total_capacity} guests</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-medium">{slot.available_count} spots</span>
            </div>
            {hasBookings && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booked</span>
                <span className="font-medium text-primary">{bookedCount} guests</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Block/Unblock Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="block-toggle" className="font-medium">
                  Block this slot
                </Label>
                <p className="text-xs text-muted-foreground">
                  Blocked slots are not shown to travelers
                </p>
              </div>
              <Switch
                id="block-toggle"
                checked={isBlocked}
                onCheckedChange={handleBlockToggle}
                disabled={isLoading}
              />
            </div>

            {/* Warning for slots with bookings */}
            {hasBookings && !slot.is_blocked && (
              <Alert variant="default" className="border-amber-200 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  This slot has {bookedCount} existing booking{bookedCount > 1 ? 's' : ''}.
                  Blocking will not cancel them, but prevents new bookings.
                </AlertDescription>
              </Alert>
            )}

            {/* Block Reason Input */}
            {!isBlocked && (
              <div className="space-y-2">
                <Label htmlFor="block-reason" className="text-sm">
                  Block reason (optional)
                </Label>
                <Textarea
                  id="block-reason"
                  placeholder="e.g., Equipment maintenance, Private event..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="resize-none h-20"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Edit Capacity */}
          <div className="space-y-3">
            <Label className="font-medium">Edit Capacity</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                min={hasBookings ? bookedCount : 1}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">guests maximum</span>
              {capacity !== slot.total_capacity && (
                <Button
                  size="sm"
                  onClick={handleSaveCapacity}
                  disabled={isLoading || capacity < (hasBookings ? bookedCount : 1)}
                >
                  Save
                </Button>
              )}
            </div>
            {hasBookings && (
              <p className="text-xs text-muted-foreground">
                Cannot reduce below {bookedCount} (current bookings)
              </p>
            )}
          </div>

          <Separator />

          {/* Delete Slot */}
          <div className="space-y-3">
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={hasBookings}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete this slot
              </Button>
            ) : (
              <div className="bg-destructive/10 p-3 rounded-lg space-y-2">
                <p className="text-sm text-destructive font-medium">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {hasBookings && (
              <p className="text-xs text-muted-foreground">
                Cannot delete slots with existing bookings
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
