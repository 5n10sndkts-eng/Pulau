/**
 * CheckoutSuccess Component
 * Story: 24.3 - Integrate Stripe Checkout for Payment
 * Phase: 2a - Core Transactional
 *
 * Handles successful return from Stripe Checkout session.
 * Displays confirmation and triggers backend verification via webhook.
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2, AlertCircle, Home, Calendar } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// ================================================
// TYPES
// ================================================

interface CheckoutSuccessProps {
  onNavigateHome: () => void
  onNavigateToTrips: () => void
}

interface SessionStatus {
  status: 'loading' | 'success' | 'pending' | 'error'
  bookingReference?: string
  error?: string
}

// ================================================
// MAIN COMPONENT
// ================================================

export function CheckoutSuccess({ onNavigateHome, onNavigateToTrips }: CheckoutSuccessProps) {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({ status: 'loading' })

  // Verify session status on mount
  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setSessionStatus({ status: 'error', error: 'No session ID provided' })
        return
      }

      // If Supabase is not configured, show success immediately (demo mode)
      if (!isSupabaseConfigured()) {
        // Simulate demo booking reference
        setTimeout(() => {
          setSessionStatus({
            status: 'success',
            bookingReference: `PUL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`,
          })
        }, 1500)
        return
      }

      try {
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          setSessionStatus({ status: 'error', error: 'Please log in to view your booking' })
          return
        }

        // Poll for booking confirmation (webhook may take a moment)
        let attempts = 0
        const maxAttempts = 10
        const pollInterval = 2000 // 2 seconds

        const pollForBooking = async () => {
          attempts++

          // Query payments table (which has stripe_checkout_session_id) and join to booking
          const { data: paymentWithBooking, error } = await supabase
            .from('payments')
            .select(`
              id,
              booking_id,
              bookings!inner (
                id,
                reference,
                status
              )
            `)
            .eq('stripe_checkout_session_id', sessionId)
            .single()

          // Extract booking from the joined result
          const booking = paymentWithBooking?.bookings as { id: string; reference: string; status: string } | null

          if (error && error.code !== 'PGRST116') {
            // Real error, not just "no rows found"
            console.error('Error checking booking:', error)
          }

          if (booking) {
            setSessionStatus({
              status: 'success',
              bookingReference: booking.reference,
            })
            return
          }

          if (attempts < maxAttempts) {
            // Still waiting for webhook
            setSessionStatus({ status: 'pending' })
            setTimeout(pollForBooking, pollInterval)
          } else {
            // Give up polling, but still show success
            // The webhook will eventually process and update the booking
            setSessionStatus({
              status: 'success',
              bookingReference: 'Processing...',
            })
          }
        }

        await pollForBooking()
      } catch (err) {
        console.error('Session verification error:', err)
        setSessionStatus({
          status: 'error',
          error: 'Failed to verify payment. Please contact support.',
        })
      }
    }

    verifySession()
  }, [sessionId])

  // Loading state
  if (sessionStatus.status === 'loading') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 min-h-[60vh] flex flex-col justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="font-display text-xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </Card>
      </div>
    )
  }

  // Pending/Processing state
  if (sessionStatus.status === 'pending') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 min-h-[60vh] flex flex-col justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="font-display text-xl font-bold mb-2">Confirming Your Booking</h2>
          <p className="text-muted-foreground">
            Your payment was successful! We're now creating your booking...
          </p>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (sessionStatus.status === 'error') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 min-h-[60vh] flex flex-col justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="font-display text-xl font-bold mb-2">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-4">{sessionStatus.error}</p>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If you were charged, please contact support with your session ID: {sessionId?.slice(0, 20)}...
            </AlertDescription>
          </Alert>
          <Button onClick={onNavigateHome} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </Card>
      </div>
    )
  }

  // Success state
  return (
    <div className="max-w-md mx-auto p-6 space-y-6 min-h-[60vh] flex flex-col justify-center">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your adventure awaits! We're preparing your booking confirmation.
        </p>

        {sessionStatus.bookingReference && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="font-mono font-bold text-lg">{sessionStatus.bookingReference}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            📧 A confirmation email with your tickets will be sent shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            📱 Your vendors will contact you with pickup details.
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        <Button onClick={onNavigateToTrips} className="w-full" size="lg">
          <Calendar className="h-4 w-4 mr-2" />
          View My Bookings
        </Button>
        <Button onClick={onNavigateHome} variant="outline" className="w-full">
          <Home className="h-4 w-4 mr-2" />
          Continue Exploring
        </Button>
      </div>
    </div>
  )
}
