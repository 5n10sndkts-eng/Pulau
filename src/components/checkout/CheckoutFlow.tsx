import { useState } from 'react'
import { Trip } from '@/lib/types'
import { ReviewStep } from './ReviewStep'
import { TravelerDetailsStep } from './TravelerDetailsStep'
import { PaymentStep } from './PaymentStep'
import { ConfirmationStep } from './ConfirmationStep'
import { CheckoutProgress } from './CheckoutProgress'

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
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review')
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    additionalTravelers: [],
    specialRequests: '',
    paymentMethod: 'card',
    termsAccepted: false,
  })

  const handleReviewContinue = () => {
    setCurrentStep('details')
  }

  const handleDetailsContinue = (data: {
    leadTraveler: TravelerInfo
    additionalTravelers: Omit<TravelerInfo, 'email' | 'phone' | 'countryCode'>[]
    specialRequests: string
  }) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep('payment')
  }

  const handlePaymentContinue = (data: {
    promoCode?: string
    paymentMethod: 'card' | 'paypal' | 'applepay' | 'googlepay'
    cardDetails?: BookingData['cardDetails']
    termsAccepted: boolean
  }) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    
    setTimeout(() => {
      const bookingRef = `PUL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`
      setCurrentStep('confirmation')
      onComplete(bookingRef)
    }, 1500)
  }

  const handleStepBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('review')
    } else if (currentStep === 'payment') {
      setCurrentStep('details')
    } else if (currentStep === 'review') {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {currentStep !== 'confirmation' && (
        <div className="sticky top-0 z-10 bg-card border-b">
          <CheckoutProgress currentStep={currentStep} />
        </div>
      )}

      {currentStep === 'review' && (
        <ReviewStep trip={trip} onBack={handleStepBack} onContinue={handleReviewContinue} />
      )}

      {currentStep === 'details' && (
        <TravelerDetailsStep
          trip={trip}
          initialData={{
            leadTraveler: bookingData.leadTraveler,
            additionalTravelers: bookingData.additionalTravelers || [],
            specialRequests: bookingData.specialRequests || '',
          }}
          onBack={handleStepBack}
          onContinue={handleDetailsContinue}
        />
      )}

      {currentStep === 'payment' && (
        <PaymentStep
          trip={trip}
          bookingData={bookingData as BookingData}
          onBack={handleStepBack}
          onContinue={handlePaymentContinue}
        />
      )}

      {currentStep === 'confirmation' && (
        <ConfirmationStep
          trip={trip}
          bookingData={bookingData as BookingData}
          bookingRef={`PUL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`}
        />
      )}
    </div>
  )
}
