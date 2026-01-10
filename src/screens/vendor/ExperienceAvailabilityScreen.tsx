import { useState, useEffect, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Ban,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  slotService,
  blockSlot,
  unblockSlot,
  deleteSlot,
  updateSlot,
  type ExperienceSlot,
} from '@/lib/slotService'
import { SlotDetailModal } from '@/components/vendor/SlotDetailModal'
import { CreateSlotModal } from '@/components/vendor/CreateSlotModal'
import 'react-day-picker/dist/style.css'

interface ExperienceAvailabilityScreenProps {
  experienceId: string
  onBack: () => void
}

export function ExperienceAvailabilityScreen({
  experienceId,
  onBack,
}: ExperienceAvailabilityScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date())
  const [slots, setSlots] = useState<ExperienceSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(null)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Load slots for visible date range
  useEffect(() => {
    loadSlots()
  }, [experienceId, displayMonth])

  const loadSlots = async () => {
    setIsLoading(true)
    try {
      const startDate = format(startOfMonth(displayMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(addMonths(displayMonth, 1)), 'yyyy-MM-dd')

      const data = await slotService.getAllSlots(experienceId, { startDate, endDate })
      setSlots(data)
    } catch (error) {
      console.error('Failed to load slots:', error)
      toast.error('Failed to load availability')
    } finally {
      setIsLoading(false)
    }
  }

  // Group slots by date for calendar display
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, ExperienceSlot[]> = {}
    slots.forEach((slot) => {
      const dateKey = slot.slot_date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey]!.push(slot)
    })
    return grouped
  }, [slots])

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    return slotsByDate[dateStr] || []
  }, [selectedDate, slotsByDate])

  // Calendar modifiers
  const blockedDates = useMemo(() => {
    return Object.entries(slotsByDate)
      .filter(([, dateSlots]) => dateSlots.every((s) => s.is_blocked))
      .map(([date]) => new Date(date))
  }, [slotsByDate])

  const availableDates = useMemo(() => {
    return Object.entries(slotsByDate)
      .filter(([, dateSlots]) => dateSlots.some((s) => !s.is_blocked && s.available_count > 0))
      .map(([date]) => new Date(date))
  }, [slotsByDate])

  const soldOutDates = useMemo(() => {
    return Object.entries(slotsByDate)
      .filter(([, dateSlots]) =>
        dateSlots.some((s) => !s.is_blocked && s.available_count === 0)
      )
      .map(([date]) => new Date(date))
  }, [slotsByDate])

  const partialBlockedDates = useMemo(() => {
    return Object.entries(slotsByDate)
      .filter(
        ([, dateSlots]) =>
          dateSlots.some((s) => s.is_blocked) && dateSlots.some((s) => !s.is_blocked)
      )
      .map(([date]) => new Date(date))
  }, [slotsByDate])

  // Handlers
  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const handleSlotClick = (slot: ExperienceSlot) => {
    setSelectedSlot(slot)
    setIsSlotModalOpen(true)
  }

  const handleBlockSlot = async (slotId: string, reason: string) => {
    const result = await blockSlot(slotId, reason)
    if (result.success) {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, is_blocked: true } : s))
      )
      toast.success('Slot blocked')
    } else {
      toast.error(result.error || 'Failed to block slot')
    }
  }

  const handleUnblockSlot = async (slotId: string) => {
    const result = await unblockSlot(slotId)
    if (result.success) {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, is_blocked: false } : s))
      )
      toast.success('Slot unblocked')
    } else {
      toast.error(result.error || 'Failed to unblock slot')
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    const result = await deleteSlot(slotId)
    if (result.success) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
      toast.success('Slot deleted')
    } else {
      toast.error(result.error || 'Failed to delete slot')
    }
  }

  const handleUpdateSlot = async (
    slotId: string,
    updates: { totalCapacity?: number }
  ) => {
    const result = await updateSlot(slotId, updates)
    if (result.success && result.data) {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? result.data! : s))
      )
      toast.success('Slot updated')
    } else {
      toast.error(result.error || 'Failed to update slot')
    }
  }

  const handleSlotCreated = (newSlot: ExperienceSlot) => {
    setSlots((prev) => [...prev, newSlot])
    setIsCreateModalOpen(false)
    toast.success('Slot created')
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Manage Availability</h1>
              <p className="text-xs text-muted-foreground">
                Set dates, times, and capacity
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
        {/* Calendar Column */}
        <Card className="p-4">
          <style>{`
            .rdp-day_selected {
              background-color: var(--primary) !important;
              color: white !important;
            }
            .rdp-day_blocked {
              background-color: #f3f4f6;
              color: #9ca3af;
              position: relative;
            }
            .rdp-day_blocked::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 25%;
              right: 25%;
              height: 1px;
              background: #9ca3af;
            }
            .rdp-day_available {
              background-color: #ecfdf5;
              color: #047857;
              font-weight: bold;
            }
            .rdp-day_soldout {
              background-color: #fef3c7;
              color: #d97706;
            }
            .rdp-day_partial {
              background: linear-gradient(135deg, #ecfdf5 50%, #f3f4f6 50%);
            }
          `}</style>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && handleDayClick(d)}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              modifiers={{
                blocked: blockedDates,
                available: availableDates,
                soldout: soldOutDates,
                partial: partialBlockedDates,
              }}
              modifiersClassNames={{
                blocked: 'rdp-day_blocked',
                available: 'rdp-day_available',
                soldout: 'rdp-day_soldout',
                partial: 'rdp-day_partial',
              }}
            />
          )}
        </Card>

        {/* Slots for Selected Date */}
        <div className="space-y-6">
          {/* Legend */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4" /> Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200 relative">
                  <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-gray-400" />
                </div>
                <span>Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-200" />
                <span>Sold Out</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    background: 'linear-gradient(135deg, #ecfdf5 50%, #f3f4f6 50%)',
                  }}
                />
                <span>Partial</span>
              </div>
            </div>
          </Card>

          {/* Slots List */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {selectedDate
                ? format(selectedDate, 'MMMM d, yyyy')
                : 'Select a date'}
            </h3>

            {selectedDateSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No slots for this date</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateSlots
                  .sort((a, b) => a.slot_time.localeCompare(b.slot_time))
                  .map((slot) => (
                    <button
                      key={slot.id}
                      className="w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left flex items-center justify-between"
                      onClick={() => handleSlotClick(slot)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium">
                          {slot.slot_time.slice(0, 5)}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {slot.available_count}/{slot.total_capacity} available
                        </div>
                      </div>
                      {slot.is_blocked ? (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-600"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      ) : slot.available_count === 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Sold Out
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Open
                        </Badge>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </Card>

          {/* Tips */}
          <div className="bg-primary/5 p-4 rounded-lg text-sm border border-primary/10">
            <p>
              <strong>Tip:</strong> Click on any time slot to block, unblock, or
              edit its capacity. Blocked slots won't appear to travelers.
            </p>
          </div>
        </div>
      </div>

      {/* Slot Detail Modal */}
      <SlotDetailModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false)
          setSelectedSlot(null)
        }}
        slot={selectedSlot}
        onBlock={handleBlockSlot}
        onUnblock={handleUnblockSlot}
        onDelete={handleDeleteSlot}
        onUpdate={handleUpdateSlot}
      />

      {/* Create Slot Modal */}
      <CreateSlotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        experienceId={experienceId}
        defaultDate={selectedDate}
        onSlotCreated={handleSlotCreated}
      />
    </div>
  )
}
