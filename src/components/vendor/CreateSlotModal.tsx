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
import { Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { createSlot, type ExperienceSlot, type SlotCreateInput } from '@/lib/slotService'

interface CreateSlotModalProps {
  isOpen: boolean
  onClose: () => void
  experienceId: string
  defaultDate?: Date
  onSlotCreated: (slot: ExperienceSlot) => void
}

export function CreateSlotModal({
  isOpen,
  onClose,
  experienceId,
  defaultDate,
  onSlotCreated,
}: CreateSlotModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [capacity, setCapacity] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
      setTime('09:00')
      setCapacity(10)
      setError(null)
    }
  }, [isOpen, defaultDate])

  const handleSubmit = async () => {
    if (!date || !time) {
      setError('Please select a date and time')
      return
    }

    if (capacity < 1) {
      setError('Capacity must be at least 1')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const input: SlotCreateInput = {
        experienceId,
        slotDate: date,
        slotTime: time,
        totalCapacity: capacity,
      }

      const result = await createSlot(input)

      if (result.success && result.data) {
        onSlotCreated(result.data)
        onClose()
      } else {
        setError(result.error || 'Failed to create slot')
      }
    } catch (e) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Slot
          </DialogTitle>
          <DialogDescription>
            Create a new availability slot for this experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="slot-date">Date</Label>
            <Input
              id="slot-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="slot-time">Start Time</Label>
            <Input
              id="slot-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="slot-capacity">Capacity (max guests)</Label>
            <Input
              id="slot-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              min={1}
              max={100}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Slot
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
