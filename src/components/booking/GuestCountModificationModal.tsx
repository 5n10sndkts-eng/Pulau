/**
 * Guest Count Modification Modal
 * Story: 31-4 - Create Guest Count Modification
 * Epic: 31 - Booking Modifications & Rescheduling
 *
 * Modal for customers to request a change in guest count for their booking.
 * Shows available capacity, price difference, and handles request submission.
 */

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  DollarSign,
  Plus,
  Minus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
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
  minGuests: number
  maxGuests: number
}

interface GuestCountModificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: BookingItem
  onSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GuestCountModificationModal({
  open,
  onOpenChange,
  booking,
  onSuccess,
}: GuestCountModificationModalProps) {
  // State
  const [step, setStep] = useState<'check' | 'select' | 'confirm' | 'success' | 'error'>('check')
  const [eligibility, setEligibility] = useState<ModificationAllowedResult | null>(null)
  const [guestCount, setGuestCount] = useState(booking.currentGuests)
  const [availableCapacity, setAvailableCapacity] = useState<number | null>(null)
  const [priceCalc, setPriceCalc] = useState<ModificationPriceResult | null>(null)
  const [customerNotes, setCustomerNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const fetchSlotCapacity = useCallback(async () => {
    try {
      const dateRange: DateRange = {
        startDate: booking.currentDate,
        endDate: booking.currentDate,
      }
      const { data: slots, error: slotsError } = await slotService.getAvailableSlots(booking.experienceId, dateRange)

      if (slotsError || !slots) {
        console.error('Error fetching slot capacity:', slotsError)
        return
      }

      const currentSlot = slots.find(
        (s) => s.slot_date === booking.currentDate && s.slot_time === booking.currentTime
      )

      if (currentSlot) {
        // Available = current available + guests we already have booked
        setAvailableCapacity(currentSlot.available_count + booking.currentGuests)
      }
    } catch (err) {
      console.error('Error fetching slot capacity:', err)
    }
  }, [booking.currentDate, booking.currentTime, booking.experienceId, booking.currentGuests])

  const checkEligibility = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await checkModificationAllowed(booking.tripItemId, 'guest_change')
      setEligibility(result)

      if (result.allowed) {
        // Also fetch current slot capacity
        await fetchSlotCapacity()
        setStep('select')
      } else {
        setStep('error')
        setError(result.reason || 'Guest count changes are not available for this booking')
      }
    } catch (err) {
      setStep('error')
      setError('Failed to check modification eligibility')
    } finally {
      setLoading(false)
    }
  }, [booking.tripItemId, fetchSlotCapacity])

  const calculatePrice = useCallback(async (newGuestCount: number) => {
    if (newGuestCount === booking.currentGuests) {
      setPriceCalc(null)
      return
    }

    setLoading(true)

    try {
      const price = await calculateModificationPrice(
        booking.tripItemId,
        booking.currentDate,
        booking.currentTime,
        newGuestCount
      )

      setPriceCalc(price)

      if (price.error) {
        setError(price.error)
      } else {
        setError(null)
      }
    } catch (err) {
      setError('Failed to calculate price')
    } finally {
      setLoading(false)
    }
  }, [booking.currentGuests, booking.tripItemId, booking.currentDate, booking.currentTime])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setGuestCount(booking.currentGuests)
      checkEligibility()
    } else {
      setStep('check')
      setEligibility(null)
      setAvailableCapacity(null)
      setPriceCalc(null)
      setCustomerNotes('')
      setError(null)
    }
  }, [open, booking.currentGuests, checkEligibility])

  // Calculate price when guest count changes
  useEffect(() => {
    if (step === 'select' && guestCount !== booking.currentGuests) {
      calculatePrice(guestCount)
    }
  }, [guestCount, step, booking.currentGuests, calculatePrice])

  function handleGuestChange(delta: number) {
    const newCount = guestCount + delta
    const maxAllowed = availableCapacity !== null
      ? Math.min(booking.maxGuests, availableCapacity)
      : booking.maxGuests

    if (newCount >= booking.minGuests && newCount <= maxAllowed) {
      setGuestCount(newCount)
    }
  }

  function handleProceedToConfirm() {
    if (priceCalc && !priceCalc.error && guestCount !== booking.currentGuests) {
      setStep('confirm')
    }
  }

  async function handleSubmitRequest() {
    if (!priceCalc || guestCount === booking.currentGuests) return

    setLoading(true)
    setError(null)

    try {
      const result = await createModificationRequest({
        bookingId: booking.bookingId,
        tripItemId: booking.tripItemId,
        vendorId: booking.vendorId,
        modificationType: 'guest_change',
        originalDate: booking.currentDate,
        originalTime: booking.currentTime,
        originalGuests: booking.currentGuests,
        originalTotalPrice: booking.currentPrice,
        requestedGuests: guestCount,
        customerNotes: customerNotes || undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setStep('success')
      onSuccess?.()
    } catch (err) {
      setError('Failed to submit modification request')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const maxAllowed = availableCapacity !== null
    ? Math.min(booking.maxGuests, availableCapacity)
    : booking.maxGuests

  const canDecrease = guestCount > booking.minGuests
  const canIncrease = guestCount < maxAllowed
  const hasChanged = guestCount !== booking.currentGuests

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Change Guest Count
          </DialogTitle>
          <DialogDescription>
            {booking.experienceTitle}
          </DialogDescription>
        </DialogHeader>

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
              <p className="text-muted-foreground">Checking eligibility...</p>
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

          {/* Select Guest Count */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current booking</p>
                    <p className="font-semibold">
                      {format(parseISO(booking.currentDate), 'MMM d, yyyy')} at {booking.currentTime}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {booking.currentGuests} {booking.currentGuests === 1 ? 'guest' : 'guests'}
                  </Badge>
                </div>
              </Card>

              {/* Eligibility Info */}
              {eligibility && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {eligibility.modification_count || 0} / {eligibility.max_modifications || 2} changes used
                  </Badge>
                </div>
              )}

              {/* Guest Count Selector */}
              <div className="text-center py-4">
                <Label className="mb-4 block text-base">New Guest Count</Label>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(-1)}
                    disabled={!canDecrease}
                    className="h-12 w-12 rounded-full"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>

                  <motion.div
                    key={guestCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center min-w-[80px]"
                  >
                    <span className="text-5xl font-bold text-primary">{guestCount}</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {guestCount === 1 ? 'guest' : 'guests'}
                    </p>
                  </motion.div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleGuestChange(1)}
                    disabled={!canIncrease}
                    className="h-12 w-12 rounded-full"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Min: {booking.minGuests} | Max: {maxAllowed} guests
                  {availableCapacity !== null && availableCapacity < booking.maxGuests && (
                    <span className="text-amber-600 ml-2">
                      (Limited availability)
                    </span>
                  )}
                </p>
              </div>

              {/* Price Difference */}
              {loading && hasChanged && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating price...
                </div>
              )}

              {priceCalc && !priceCalc.error && hasChanged && (
                <Card className={`p-4 ${priceCalc.price_difference !== 0 ? 'border-primary/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Price Change</span>
                    </div>
                    <span
                      className={`font-semibold ${priceCalc.price_difference > 0
                          ? 'text-destructive'
                          : priceCalc.price_difference < 0
                            ? 'text-success'
                            : ''
                        }`}
                    >
                      {formatPriceDifference(priceCalc.price_difference)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>New total</span>
                    <span>${(priceCalc.new_total / 100).toFixed(2)}</span>
                  </div>
                </Card>
              )}

              {/* Continue Button */}
              <Button
                onClick={handleProceedToConfirm}
                disabled={!hasChanged || !priceCalc || !!priceCalc.error || loading}
                className="w-full"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Confirm */}
          {step === 'confirm' && priceCalc && (
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
                    <p className="text-3xl font-bold text-muted-foreground">
                      {booking.currentGuests}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.currentGuests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">TO</p>
                    <p className="text-3xl font-bold text-primary">{guestCount}</p>
                    <p className="text-sm text-muted-foreground">
                      {guestCount === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                </div>

                {priceCalc.price_difference !== 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price adjustment</span>
                      <span
                        className={`font-semibold ${priceCalc.price_difference > 0 ? 'text-destructive' : 'text-success'
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
                  placeholder="Let the vendor know why you're changing the guest count..."
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
                  Your change request will be sent to {booking.vendorName} for approval.
                  They have 48 hours to respond.
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
                <Button onClick={handleSubmitRequest} disabled={loading} className="flex-1">
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
                Your guest count change request has been sent to {booking.vendorName}.
                You&apos;ll be notified when they respond.
              </p>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default GuestCountModificationModal
