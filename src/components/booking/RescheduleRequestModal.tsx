/**
 * Reschedule Request Modal
 * Story: 31-2 - Build Reschedule Request Interface
 * Epic: 31 - Booking Modifications & Rescheduling
 *
 * Modal for customers to request a booking reschedule.
 * Shows available slots, price difference, and handles request submission.
 */

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  DollarSign,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import {
  checkModificationAllowed,
  calculateModificationPrice,
  createModificationRequest,
  formatPriceDifference,
  ModificationAllowedResult,
  ModificationPriceResult,
} from '@/lib/modificationService'
import { slotService, ExperienceSlot, DateRange } from '@/lib/slotService'

// ============================================================================
// TYPES
// ============================================================================

interface BookingItem {
  tripItemId: string
  bookingId: string
  experienceId: string
  experienceTitle: string
  vendorId: string
  vendorName: string
  currentDate: string
  currentTime: string
  currentGuests: number
  currentPrice: number // cents
}

interface RescheduleRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: BookingItem
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RescheduleRequestModal({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: RescheduleRequestModalProps) {
  // State
  const [step, setStep] = useState<'check' | 'select' | 'confirm' | 'success' | 'error'>('check')
  const [eligibility, setEligibility] = useState<ModificationAllowedResult | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<ExperienceSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<ExperienceSlot[]>([])
  const [priceCalc, setPriceCalc] = useState<ModificationPriceResult | null>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const checkEligibility = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await checkModificationAllowed(booking.tripItemId, 'reschedule')
      setEligibility(result)

      if (result.allowed) {
        setStep('select')
      } else {
        setStep('error')
        setError(result.reason || 'Rescheduling is not available for this booking')
      }
    } catch (err) {
      setStep('error')
      setError('Failed to check reschedule eligibility')
    } finally {
      setLoading(false)
    }
  }, [booking.tripItemId])

  // Check eligibility on mount
  useEffect(() => {
    if (open) {
      checkEligibility()
    } else {
      // Reset state when modal closes
      setStep('check')
      setEligibility(null)
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setAvailableSlots([])
      setPriceCalc(null)
      setCustomerNotes('')
      setError(null)
    }
  }, [open, checkEligibility])

  async function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setPriceCalc(null)

    if (!date) return

    setLoading(true)

    try {
      // Fetch available slots for this date
      const dateStr = format(date, 'yyyy-MM-dd')
      const dateRange: DateRange = {
        startDate: dateStr,
        endDate: dateStr,
      }
      const slots = await slotService.getAvailableSlots(
        booking.experienceId,
        dateRange
      )

      // Filter out the current slot if it's on the same date
      const filteredSlots = slots.filter(
        (s) =>
          !(
            s.slot_date === booking.currentDate &&
            s.slot_time === booking.currentTime
          )
      )

      setAvailableSlots(filteredSlots)
    } catch (err) {
      console.error('Error fetching slots:', err)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSlotSelect(slot: ExperienceSlot) {
    setSelectedSlot(slot)
    setLoading(true)

    try {
      // Calculate price difference
      const price = await calculateModificationPrice(
        booking.tripItemId,
        slot.slot_date,
        slot.slot_time,
        booking.currentGuests
      )

      setPriceCalc(price)

      if (price.error) {
        setError(price.error)
      }
    } catch (err) {
      setError('Failed to calculate price')
    } finally {
      setLoading(false)
    }
  }

  function handleProceedToConfirm() {
    if (selectedSlot && priceCalc && !priceCalc.error) {
      setStep('confirm')
    }
  }

  async function handleSubmitRequest() {
    if (!selectedSlot || !priceCalc) return

    setLoading(true)
    setError(null)

    try {
      const result = await createModificationRequest({
        bookingId: booking.bookingId,
        tripItemId: booking.tripItemId,
        vendorId: booking.vendorId,
        modificationType: 'reschedule',
        originalDate: booking.currentDate,
        originalTime: booking.currentTime,
        originalGuests: booking.currentGuests,
        originalTotalPrice: booking.currentPrice,
        requestedDate: selectedSlot.slot_date,
        requestedTime: selectedSlot.slot_time,
        customerNotes: customerNotes || undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setStep('success')
      onSuccess?.()
    } catch (err) {
      setError('Failed to submit reschedule request')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            {booking.experienceTitle} with {booking.vendorName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <AnimatePresence mode="wait">
            {/* Loading / Checking */}
            {step === 'check' && loading && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Checking reschedule eligibility...</p>
              </motion.div>
            )}

            {/* Error State */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-8"
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="text-center">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Select Date & Time */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Current Booking Info */}
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Current Booking
                  </p>
                  <p className="font-semibold">
                    {format(parseISO(booking.currentDate), 'EEEE, MMMM d, yyyy')} at{' '}
                    {booking.currentTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.currentGuests} {booking.currentGuests === 1 ? 'guest' : 'guests'}
                  </p>
                </Card>

                {/* Eligibility Info */}
                {eligibility && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {eligibility.modification_count || 0} / {eligibility.max_modifications || 2} reschedules used
                    </Badge>
                  </div>
                )}

                {/* Date Picker */}
                <div>
                  <Label className="mb-2 block">Select New Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date < new Date() ||
                      date > addDays(new Date(), 90) ||
                      isSameDay(date, parseISO(booking.currentDate))
                    }
                    className="rounded-md border"
                  />
                </div>

                {/* Available Slots */}
                {selectedDate && (
                  <div>
                    <Label className="mb-2 block">Available Times</Label>
                    {loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading available times...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No available slots on this date. Please try another date.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSlotSelect(slot)}
                            className="flex flex-col h-auto py-2"
                          >
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.slot_time}
                            </span>
                            <span className="text-xs opacity-70">
                              {slot.available_count} spots
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Price Difference */}
                {priceCalc && !priceCalc.error && (
                  <Card className={`p-4 ${priceCalc.price_difference !== 0 ? 'border-primary/30' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Price Change</span>
                      </div>
                      <span
                        className={`font-semibold ${
                          priceCalc.price_difference > 0
                            ? 'text-destructive'
                            : priceCalc.price_difference < 0
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {formatPriceDifference(priceCalc.price_difference)}
                      </span>
                    </div>
                  </Card>
                )}

                {/* Continue Button */}
                <Button
                  onClick={handleProceedToConfirm}
                  disabled={!selectedSlot || !priceCalc || !!priceCalc.error}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Confirm */}
            {step === 'confirm' && selectedSlot && priceCalc && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Summary */}
                <Card className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">FROM</p>
                      <p className="font-medium">
                        {format(parseISO(booking.currentDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.currentTime}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TO</p>
                      <p className="font-medium">
                        {format(parseISO(selectedSlot.slot_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedSlot.slot_time}</p>
                    </div>
                  </div>

                  {priceCalc.price_difference !== 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price adjustment</span>
                        <span
                          className={`font-semibold ${
                            priceCalc.price_difference > 0 ? 'text-destructive' : 'text-success'
                          }`}
                        >
                          {formatPriceDifference(priceCalc.price_difference)}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Add a note (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Let the vendor know why you're rescheduling..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Info */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your reschedule request will be sent to {booking.vendorName} for approval.
                    They have 48 hours to respond. You&apos;ll receive a notification once they reply.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-8 text-center"
              >
                <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Request Submitted!</h3>
                <p className="text-muted-foreground mb-6">
                  Your reschedule request has been sent to {booking.vendorName}.
                  You&apos;ll be notified when they respond.
                </p>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RescheduleRequestModal
