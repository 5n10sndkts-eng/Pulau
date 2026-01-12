import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Trip } from '@/lib/types'
import { ReviewStep } from './ReviewStep'
import { TravelerDetailsStep } from './TravelerDetailsStep'
import { PaymentStep } from './PaymentStep'
import { ConfirmationStep } from './ConfirmationStep'
import { CheckoutProgress } from './CheckoutProgress'
import { trackCheckoutStep, measureTiming } from '@/lib/sentry'
import { initiateCheckout } from '@/lib/paymentService'
import { isSupabaseConfigured } from '@/lib/supabase'
import { toast } from 'sonner'

export type CheckoutStep = 'review' | 'details' | 'payment' | 'confirmation'

export interface TravelerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  nationality: string
}

export interface BookingData {
  leadTraveler: TravelerInfo
  additionalTravelers: Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
  specialRequests: string
  promoCode?: string
  paymentMethod: 'card' | 'paypal' | 'applepay' | 'googlepay'
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
  termsAccepted: boolean
}

interface CheckoutFlowProps {
  trip: Trip
  onBack: () => void
  onComplete: (bookingRef: string) => void
}

export function CheckoutFlow({ trip, onBack, onComplete }: CheckoutFlowProps) {
  const [session, setSession] = useKV<Partial<BookingData> & {
    currentStep: CheckoutStep,
    completedSteps: CheckoutStep[]
  }>('pulau_checkout_session', {
    currentStep: 'review',
    completedSteps: [],
    additionalTravelers: [],
    specialRequests: '',
    paymentMethod: 'card',
    termsAccepted: false,
  })

  const currentStep = session?.currentStep || 'review'
  const completedSteps = session?.completedSteps || []

  // Track checkout step changes for APM (Story 32-2)
  const [stepStartTime] = useState(() => performance.now())
  useEffect(() => {
    const stepMap = {
      review: 'review',
      details: 'traveler-details',
      payment: 'payment',
      confirmation: 'confirmation',
    } as const

    trackCheckoutStep(stepMap[currentStep], {
      itemCount: trip.items.length,
      total: trip.total,
    })

    // Measure time on each step when leaving
    return () => {
      const duration = performance.now() - stepStartTime
      measureTiming(`checkout.step.${currentStep}`, duration)
    }
  }, [currentStep, trip.items.length, trip.total, stepStartTime])

  const updateSession = (updates: Partial<NonNullable<typeof session>>) => {
    setSession((prev) => {
      const base = prev || {
        currentStep: 'review' as CheckoutStep,
        completedSteps: [] as CheckoutStep[],
        additionalTravelers: [],
        specialRequests: '',
        paymentMethod: 'card' as const,
        termsAccepted: false,
      }
      const next = { ...base, ...updates }
      return {
        ...next,
        currentStep: next.currentStep || 'review',
        completedSteps: next.completedSteps || []
      }
    })
  }

  const handleReviewContinue = () => {
    updateSession({
      currentStep: 'details',
      completedSteps: [...new Set([...completedSteps, 'review' as CheckoutStep])]
    })
  }

  const handleDetailsContinue = (data: {
    leadTraveler: TravelerInfo
    additionalTravelers: Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
    specialRequests: string
  }) => {
    updateSession({
      ...data,
      currentStep: 'payment',
      completedSteps: [...new Set([...completedSteps, 'details' as CheckoutStep])]
    })
  }

  const handlePaymentContinue = async (data: {
    promoCode?: string
    paymentMethod: 'card' | 'paypal' | 'applepay' | 'googlepay'
    cardDetails?: BookingData['cardDetails']
    termsAccepted: boolean
  }) => {
    updateSession({ ...data })

    // If Supabase is configured and payment method is card, try real checkout
    if (isSupabaseConfigured() && data.paymentMethod === 'card') {
      try {
        const { data: response, error } = await initiateCheckout(trip.id)

        if (error || !response?.success) {
          toast.error(error || 'Failed to initiate checkout')
          return
        }

        if (response.sessionUrl) {
          // Redirect to Stripe Hosted Checkout
          window.location.href = response.sessionUrl
          return
        }
      } catch (err) {
        console.error('Checkout error:', err)
        toast.error('An unexpected error occurred')
        return
      }
    }

    // Fallback / Mock Flow (Demo Mode or other methods)
    setTimeout(() => {
      const bookingRef = `PUL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`
      updateSession({
        currentStep: 'confirmation',
        completedSteps: [...new Set([...completedSteps, 'payment' as CheckoutStep])]
      })
      onComplete(bookingRef)
    }, 1500)
  }

  const handleStepBack = () => {
    if (currentStep === 'details') {
      updateSession({ currentStep: 'review' })
    } else if (currentStep === 'payment') {
      updateSession({ currentStep: 'details' })
    } else if (currentStep === 'review') {
      onBack()
    }
  }

  const handleStepClick = (stepId: CheckoutStep) => {
    // Only allow navigating to current or completed steps
    if (stepId === currentStep || completedSteps.includes(stepId)) {
      updateSession({ currentStep: stepId })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {currentStep !== 'confirmation' && (
        <div className="sticky top-0 z-10 bg-card border-b">
          <CheckoutProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      )}

      {currentStep === 'review' && (
        <ReviewStep trip={trip} onBack={handleStepBack} onContinue={handleReviewContinue} />
      )}

      {currentStep === 'details' && (
        <TravelerDetailsStep
          trip={trip}
          initialData={{
            leadTraveler: session?.leadTraveler,
            additionalTravelers: session?.additionalTravelers || [],
            specialRequests: session?.specialRequests || '',
          }}
          onBack={handleStepBack}
          onContinue={handleDetailsContinue}
        />
      )}

      {currentStep === 'payment' && (
        <PaymentStep
          trip={trip}
          bookingData={session as BookingData}
          onBack={handleStepBack}
          onContinue={handlePaymentContinue}
        />
      )}

      {currentStep === 'confirmation' && (
        <ConfirmationStep
          trip={trip}
          bookingData={session as BookingData}
          bookingRef={`PUL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`}
        />
      )}
    </div>
  )
}
