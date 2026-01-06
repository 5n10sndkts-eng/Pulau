import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ExperienceAvailability, VendorSession } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'

interface VendorAvailabilityCalendarProps {
  experienceId: string
  session: VendorSession
  onBack: () => void
}

export function VendorAvailabilityCalendar({ 
  experienceId, 
  session, 
  onBack 
}: VendorAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilityData, setAvailabilityData] = useKV<ExperienceAvailability[]>(
    `availability:${experienceId}`,
    []
  )
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [editSlots, setEditSlots] = useState(10)
  const [editBlocked, setEditBlocked] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringDays, setRecurringDays] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [recurringSlots, setRecurringSlots] = useState(10)
  const [recurringStartDate, setRecurringStartDate] = useState('')
  const [recurringEndDate, setRecurringEndDate] = useState('')

  const safeAvailability = availabilityData || []

  // Generate 12 months of dates
  const getMonthDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const dates: Date[] = []
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d))
    }
    
    return dates
  }

  const monthDates = getMonthDates()

  const getAvailabilityForDate = (date: Date): ExperienceAvailability | null => {
    const dateStr = date.toISOString().split('T')[0]
    return safeAvailability.find(a => a.date === dateStr) || null
  }

  const getDateColor = (availability: ExperienceAvailability | null) => {
    if (!availability || availability.status === 'blocked') {
      return 'bg-gray-200 text-gray-600'
    }
    
    if (availability.slotsAvailable === 0) {
      return 'bg-red-100 text-red-700'
    }
    
    const percentage = (availability.slotsAvailable / availability.slotsTotal) * 100
    
    if (percentage > 50) {
      return 'bg-green-100 text-green-700'
    }
    
    return 'bg-yellow-100 text-yellow-700'
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const availability = getAvailabilityForDate(date)
    
    setEditingDate(dateStr)
    setEditSlots(availability?.slotsTotal || 10)
    setEditBlocked(availability?.status === 'blocked')
  }

  const handleSaveEdit = () => {
    if (!editingDate) return

    const newAvailability: ExperienceAvailability = {
      id: `avail_${experienceId}_${editingDate}`,
      experienceId,
      date: editingDate,
      slotsAvailable: editBlocked ? 0 : editSlots,
      slotsTotal: editSlots,
      status: editBlocked ? 'blocked' : 'available'
    }

    const updatedData = safeAvailability.filter(a => a.date !== editingDate)
    updatedData.push(newAvailability)
    
    setAvailabilityData(updatedData)
    setEditingDate(null)
    toast.success('Availability updated')
  }

  const handleSetRecurring = () => {
    if (!recurringStartDate || !recurringEndDate) {
      toast.error('Please select start and end dates')
      return
    }

    const start = new Date(recurringStartDate)
    const end = new Date(recurringEndDate)
    const newAvailability: ExperienceAvailability[] = []

    const current = new Date(start)
    while (current <= end) {
      const dayOfWeek = current.getDay()
      
      if (recurringDays[dayOfWeek]) {
        const dateStr = current.toISOString().split('T')[0]
        
        newAvailability.push({
          id: `avail_${experienceId}_${dateStr}`,
          experienceId,
          date: dateStr,
          slotsAvailable: recurringSlots,
          slotsTotal: recurringSlots,
          status: 'available'
        })
      }
      
      current.setDate(current.getDate() + 1)
    }

    // Merge with existing, replacing duplicates
    const existingDates = new Set(safeAvailability.map(a => a.date))
    const filtered = safeAvailability.filter(a => {
      const inNewRange = new Date(a.date) >= start && new Date(a.date) <= end
      return !inNewRange || !recurringDays[new Date(a.date).getDay()]
    })
    
    setAvailabilityData([...filtered, ...newAvailability])
    setShowRecurringModal(false)
    toast.success(`${newAvailability.length} dates updated`)
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    
    // Limit to 12 months from now
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 12)
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth)
    }
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const getMonthStartOffset = () => {
    if (monthDates.length === 0) return 0
    return monthDates[0].getDay()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Experiences
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Availability</h1>
            <p className="text-white/80 mt-1">Set which dates your experience is available</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-display text-xl font-semibold min-w-[200px] text-center">
                  {monthName}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setShowRecurringModal(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Set Recurring
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-100" />
                <span>Available (&gt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-yellow-100" />
                <span>Limited (1-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-red-100" />
                <span>Sold Out</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <span>Blocked</span>
              </div>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day names */}
              {dayNames.map(day => (
                <div 
                  key={day} 
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells */}
              {Array.from({ length: getMonthStartOffset() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Date cells */}
              {monthDates.map(date => {
                const availability = getAvailabilityForDate(date)
                const colorClass = getDateColor(availability)

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium
                      transition-all duration-200 hover:scale-105
                      flex flex-col items-center justify-center
                      cursor-pointer
                      ${colorClass}
                    `}
                  >
                    <span>{date.getDate()}</span>
                    {availability && (
                      <span className="text-xs">
                        {availability.status === 'blocked' ? '🚫' : availability.slotsAvailable}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Date Modal */}
      <Dialog open={editingDate !== null} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Availability - {editingDate && new Date(editingDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </DialogTitle>
            <DialogDescription>
              Set the number of available slots for this date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="blocked">Block this date</Label>
              <Switch
                id="blocked"
                checked={editBlocked}
                onCheckedChange={setEditBlocked}
              />
            </div>

            {!editBlocked && (
              <div className="space-y-2">
                <Label htmlFor="slots">Slots Available</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditSlots(Math.max(0, editSlots - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="slots"
                    type="number"
                    value={editSlots}
                    onChange={(e) => setEditSlots(parseInt(e.target.value) || 0)}
                    className="text-center"
                    min="0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditSlots(editSlots + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Availability Modal */}
      <Dialog open={showRecurringModal} onOpenChange={setShowRecurringModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Recurring Availability</DialogTitle>
            <DialogDescription>
              Choose which days of the week you operate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="space-y-2">
                {fullDayNames.map((day, index) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={recurringDays[index]}
                      onCheckedChange={(checked) => {
                        const newDays = [...recurringDays]
                        newDays[index] = checked as boolean
                        setRecurringDays(newDays)
                      }}
                    />
                    <label
                      htmlFor={`day-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurring-slots">Slots Per Day</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRecurringSlots(Math.max(0, recurringSlots - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="recurring-slots"
                  type="number"
                  value={recurringSlots}
                  onChange={(e) => setRecurringSlots(parseInt(e.target.value) || 0)}
                  className="text-center"
                  min="0"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRecurringSlots(recurringSlots + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecurringModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetRecurring}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
