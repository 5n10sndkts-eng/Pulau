import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2 } from 'lucide-react'
import { vendorService } from '@/lib/vendorService'
import { toast } from 'sonner'

interface CutoffTimePickerProps {
  experienceId: string
  cutoffHours: number
  onUpdate?: (hours: number) => void
}

const PRESET_OPTIONS = [
  { value: 2, label: '2 hours' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
]

export function CutoffTimePicker({
  experienceId,
  cutoffHours,
  onUpdate
}: CutoffTimePickerProps) {
  const [selectedHours, setSelectedHours] = useState(cutoffHours)
  const [customHours, setCustomHours] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCustom, setShowCustom] = useState(
    !PRESET_OPTIONS.some(opt => opt.value === cutoffHours)
  )

  const handlePresetSelect = async (hours: number) => {
    setShowCustom(false)
    setSelectedHours(hours)
    await updateCutoff(hours)
  }

  const handleCustomSubmit = async () => {
    const hours = parseInt(customHours, 10)
    if (isNaN(hours) || hours < 0 || hours > 168) {
      toast.error('Please enter a valid number between 0 and 168 hours')
      return
    }
    setSelectedHours(hours)
    await updateCutoff(hours)
  }

  const updateCutoff = async (hours: number) => {
    setIsUpdating(true)
    try {
      await vendorService.updateExperienceCutoffHours(experienceId, hours)
      onUpdate?.(hours)
      toast.success(`Booking cut-off set to ${hours} hours before start`)
    } catch (error) {
      console.error('Failed to update cutoff:', error)
      toast.error('Failed to update cut-off time')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCutoffDescription = (hours: number): string => {
    if (hours === 0) return 'Bookings accepted until start time'
    if (hours === 1) return 'Booking closes 1 hour before start'
    if (hours < 24) return `Booking closes ${hours} hours before start`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return `Booking closes ${days} day${days > 1 ? 's' : ''} before start`
    }
    return `Booking closes ${days} day${days > 1 ? 's' : ''} ${remainingHours}h before start`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Booking Cut-off Time
        </CardTitle>
        <CardDescription>
          Set how far in advance bookings must be made
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedHours === option.value && !showCustom ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetSelect(option.value)}
              disabled={isUpdating}
            >
              {option.label}
            </Button>
          ))}
          <Button
            variant={showCustom ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCustom(true)}
            disabled={isUpdating}
          >
            Custom
          </Button>
        </div>

        {showCustom && (
          <div className="flex items-center gap-2 mt-3">
            <Input
              type="number"
              min="0"
              max="168"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="Enter hours"
              className="w-32"
              disabled={isUpdating}
            />
            <Label className="text-sm text-muted-foreground">hours</Label>
            <Button
              size="sm"
              onClick={handleCustomSubmit}
              disabled={isUpdating || !customHours}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set'}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal">
            Current: {selectedHours}h
          </Badge>
          <span>{formatCutoffDescription(selectedHours)}</span>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Travelers will not be able to book slots that are within this time window.
          For example, with a 2-hour cut-off, a 10:00 AM slot cannot be booked after 8:00 AM.
        </p>
      </CardContent>
    </Card>
  )
}
