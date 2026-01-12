/**
 * Vendor Operations Page
 * Stories: 27.1-27.4 - Vendor Check-In & Operations
 *
 * Main page for vendors to check in guests and view today's bookings.
 * Uses Supabase real-time queries to fetch and update booking data.
 */

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRScanner } from './QRScanner'
import { ValidationCard } from './ValidationCard'
import { bookingService, CheckInValidationResult } from '@/lib/bookingService'
import { enqueueOfflineAction, flushOfflineQueue, getPendingActions } from '@/lib/offlineQueue'
import { supabase } from '@/lib/supabase'
import {
  Camera,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, format, startOfDay, endOfDay } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VendorSession } from '@/lib/types'
import { toast } from 'sonner'

interface VendorBooking {
  id: string
  bookingReference: string
  travelerName: string
  travelerEmail: string
  experienceId: string
  experienceName: string
  dateTime: string
  guestCount: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'no_show' | 'cancelled' | 'refunded'
  checkedInAt?: string | null
  tripId: string
}

interface VendorOperationsPageProps {
  session: VendorSession
}

// Fetch today's bookings for vendor's experiences
async function fetchTodaysBookings(vendorId: string): Promise<VendorBooking[]> {
  const today = new Date()
  const dayStart = format(startOfDay(today), 'yyyy-MM-dd')
  const dayEnd = format(endOfDay(today), 'yyyy-MM-dd')

  // Query bookings through trip_items that reference vendor's experiences
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      reference,
      status,
      trip_id,
      checked_in_at,
      trips!inner (
        id,
        user_id,
        name,
        profiles!inner (
          full_name,
          email
        ),
        trip_items!inner (
          id,
          experience_id,
          date,
          time,
          guests,
          experiences!inner (
            id,
            title,
            vendor_id
          )
        )
      )
    `
    )
    .eq('trips.trip_items.experiences.vendor_id', vendorId)
    .gte('trips.trip_items.date', dayStart)
    .lte('trips.trip_items.date', dayEnd)
    .in('status', ['confirmed', 'pending', 'checked_in', 'no_show'])
    .order('booked_at', { ascending: false })

  if (error) {
    console.error('Error fetching vendor bookings:', error)
    throw new Error('Failed to load bookings')
  }

  // Transform the nested data into flat VendorBooking objects
  const bookings: VendorBooking[] = []

  for (const row of data || []) {
    const trip = row.trips as any
    const profile = trip.profiles

    // Filter trip items that belong to this vendor
    const vendorItems = trip.trip_items.filter(
      (item: any) => item.experiences.vendor_id === vendorId
    )

    for (const item of vendorItems) {
      // Use profile name as traveler name or fallback to trip name or "Guest"
      const travelerName = profile?.full_name || trip.name || 'Guest'
      const travelerEmail = profile?.email || ''

      // Build datetime from date and time
      const dateTime = item.date
        ? item.time
          ? `${item.date}T${item.time}`
          : item.date
        : new Date().toISOString()

      bookings.push({
        id: row.id,
        bookingReference: row.reference,
        travelerName,
        travelerEmail,
        experienceId: item.experience_id,
        experienceName: item.experiences.title,
        dateTime,
        guestCount: item.guests || 1,
        status: row.status as VendorBooking['status'],
        checkedInAt: row.checked_in_at,
        tripId: trip.id,
      })
    }
  }

  return bookings
}

export function VendorOperationsPage({ session }: VendorOperationsPageProps) {
  const queryClient = useQueryClient()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(
    null
  )
  const [validationResult, setValidationResult] = useState<CheckInValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Fetch today's bookings
  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-bookings-today', session.vendorId],
    queryFn: () => fetchTodaysBookings(session.vendorId),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Flush any offline actions on mount or when coming online
  useEffect(() => {
    const flush = async () => {
      const pending = getPendingActions().length
      if (pending === 0) return
      const { processed } = await flushOfflineQueue(async (action) => {
        if (action.action === 'check_in') {
          await bookingService.checkInBooking(action.bookingId, action.vendorId)
        } else {
          await bookingService.markNoShow(action.bookingId, action.vendorId)
        }
      })
      if (processed > 0) {
        queryClient.invalidateQueries({ queryKey: ['vendor-bookings-today', session.vendorId] })
        toast.success(`Synced ${processed} offline action${processed === 1 ? '' : 's'}`)
      }
    }

    flush()
    const handler = () => flush()
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [queryClient, session.vendorId])

  const enqueueAndNotify = (bookingId: string, action: 'check_in' | 'no_show') => {
    enqueueOfflineAction({ bookingId, vendorId: session.vendorId, action })
    toast.success('Saved offline. Will sync when online.')
    setSelectedBooking(null)
    setValidationResult(null)
  }

  // Realtime refetch on booking changes (lightweight listener)
  useEffect(() => {
    const channel = supabase
      .channel(`vendor-bookings-${session.vendorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['vendor-bookings-today', session.vendorId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, session.vendorId])

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueAndNotify(bookingId, 'check_in')
        return { queued: true }
      }
      await bookingService.checkInBooking(bookingId, session.vendorId)
      return { queued: false }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-bookings-today', session.vendorId],
      })
      if (!result?.queued) {
        toast.success('Guest checked in successfully')
      }
      setSelectedBooking(null)
      setValidationResult(null)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Check-in failed')
    },
  })

  // No-show mutation
  const noShowMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueAndNotify(bookingId, 'no_show')
        return { queued: true }
      }
      await bookingService.markNoShow(bookingId, session.vendorId)
      return { queued: false }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-bookings-today', session.vendorId],
      })
      if (!result?.queued) {
        toast.success('Marked as no-show')
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to mark no-show')
    },
  })

  const handleQRScan = useCallback(
    async (bookingId: string) => {
      setScannerOpen(false)
      setIsValidating(true)
      try {
        const result = await bookingService.validateBookingForCheckIn(bookingId, session.vendorId)
        setValidationResult(result)
      } catch (err) {
        console.error('Validation error:', err)
        toast.error('Failed to validate ticket. Please try again.')
      } finally {
        setIsValidating(false)
      }
    },
    [session.vendorId]
  )

  const handleCheckIn = useCallback(
    (bookingId: string) => {
      checkInMutation.mutate(bookingId)
    },
    [checkInMutation]
  )

  const handleNoShow = useCallback(
    (bookingId: string) => {
      noShowMutation.mutate(bookingId)
    },
    [noShowMutation]
  )

  // Filter to show pending/confirmed (actionable) and checked_in/no_show (today's activity)
  const actionableBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  )
  const pendingCount = actionableBookings.length
  const checkedInCount = bookings.filter((b) => b.status === 'checked_in').length
  const totalGuests = bookings.reduce((sum, b) => sum + b.guestCount, 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Operations</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">{checkedInCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{totalGuests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scan Button */}
        <Button
          onClick={() => setScannerOpen(true)}
          size="lg"
          className="w-full h-16 text-lg"
        >
          <Camera className="w-6 h-6 mr-2" />
          Scan Ticket QR Code
        </Button>

        {/* Today's Bookings */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">
            Today's Bookings
          </h2>

          <div className="space-y-3">
            {bookings.map(booking => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {booking.travelerName}
                        </h3>
                        <Badge
                          variant={
                            booking.status === 'checked_in'
                              ? 'default'
                              : booking.status === 'no_show'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {booking.status === 'checked_in'
                            ? 'Checked In'
                            : booking.status === 'no_show'
                              ? 'No Show'
                              : booking.status === 'confirmed'
                                ? 'Confirmed'
                                : 'Pending'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        {booking.experienceName}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(booking.dateTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                        </div>
                      </div>

                      {booking.status === 'checked_in' && booking.checkedInAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Checked in {formatDistanceToNow(booking.checkedInAt, { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {(booking.status === 'pending' ||
                        booking.status === 'confirmed') && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(booking.id)}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Check In
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNoShow(booking.id)}
                              disabled={noShowMutation.isPending}
                            >
                              {noShowMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              No Show
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {isLoading && (
              <Card className="p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">
                  Loading today's bookings...
                </p>
              </Card>
            )}

            {error && !isLoading && (
              <Card className="p-12 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
                <p className="text-destructive mb-4">Failed to load bookings</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </Card>
            )}

            {!isLoading && !error && bookings.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No bookings scheduled for today
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Validation Result Modal */}
      {(validationResult || isValidating) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <ValidationCard
            result={validationResult}
            isValidating={isValidating}
            onCheckIn={handleCheckIn}
            onClose={() => setValidationResult(null)}
          />
        </div>
      )}

      {/* Manual Booking Details Modal - Still used for clicking on list items */}
      {selectedBooking && !validationResult && !isValidating && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="max-w-md w-full p-6">
              <h2 className="font-display text-xl font-bold mb-4">
                Booking Details
              </h2>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Traveler</p>
                  <p className="font-semibold">{selectedBooking.travelerName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold">{selectedBooking.experienceName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">
                    {new Date(selectedBooking.dateTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{selectedBooking.guestCount}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {(selectedBooking.status === 'pending' ||
                  selectedBooking.status === 'confirmed') ? (
                  <>
                    <Button
                      onClick={() => handleCheckIn(selectedBooking.id)}
                      className="flex-1"
                      disabled={checkInMutation.isPending}
                    >
                      {checkInMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Check In
                    </Button>
                    <Button
                      onClick={() => setSelectedBooking(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setSelectedBooking(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
