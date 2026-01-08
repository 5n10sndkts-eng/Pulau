import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Trip } from '@/lib/types'
import { BookingData } from './CheckoutFlow'
import { formatPrice } from '@/lib/helpers'
import { ArrowLeft, CreditCard, Lock, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentStepProps {
  trip: Trip
  bookingData: BookingData
  onBack: () => void
  onContinue: (data: {
    promoCode?: string
    paymentMethod: 'card' | 'paypal' | 'applepay' | 'googlepay'
    cardDetails?: BookingData['cardDetails']
    termsAccepted: boolean
  }) => void
}

export function PaymentStep({ trip, onBack, onContinue }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'applepay' | 'googlepay'>('card')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const discount = promoApplied ? trip.subtotal * 0.1 : 0
  const finalTotal = trip.total - discount

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'BALI10') {
      setPromoApplied(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) return

    setIsProcessing(true)
    onContinue({
      promoCode: promoApplied ? promoCode : undefined,
      paymentMethod,
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      termsAccepted,
    })
  }

  const isValid =
    termsAccepted &&
    (paymentMethod !== 'card' ||
      (cardDetails.number.length >= 15 &&
        cardDetails.expiry.length >= 5 &&
        cardDetails.cvv.length >= 3 &&
        cardDetails.name.length > 0))

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold">Payment</h1>
          <p className="text-muted-foreground">Secure checkout powered by industry-leading encryption</p>
        </div>
      </div>

      <Card className="p-6">
        <button
          type="button"
          className="w-full flex items-center justify-between mb-4"
          onClick={() => setShowSummary(!showSummary)}
        >
          <h2 className="font-display text-xl font-bold">Order Summary</h2>
          {showSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showSummary && (
          <div className="space-y-2 mb-4 pb-4 border-b">
            {trip.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Experience {index + 1} × {item.guests}
                </span>
                <span>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({trip.items.length} experiences)</span>
            <span>{formatPrice(trip.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              Service fee
              <Info className="w-3 h-3 text-muted-foreground" />
            </span>
            <span>{formatPrice(trip.serviceFee)}</span>
          </div>
          {promoApplied && (
            <div className="flex justify-between text-sm text-success">
              <span>Promo discount (BALI10)</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Label htmlFor="promoCode" className="text-sm font-semibold mb-2 block">
            Promo Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="promoCode"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              disabled={promoApplied}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyPromo}
              disabled={!promoCode || promoApplied}
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-success mt-2">✓ 10% discount applied!</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Try code: BALI10</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-bold mb-4">Payment Method</h2>

        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">Credit / Debit Card</span>
              </div>
              <div className="flex gap-2">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop"
                  alt="Visa"
                  className="h-6 w-auto opacity-60"
                />
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop"
                  alt="Mastercard"
                  className="h-6 w-auto opacity-60"
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <span className="font-semibold">PayPal</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('applepay')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === 'applepay'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white text-xs font-bold">

              </div>
              <span className="font-semibold">Apple Pay</span>
            </div>
          </button>
        </div>

        {paymentMethod === 'card' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardDetails.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                  const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
                  setCardDetails({ ...cardDetails, number: formatted })
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4)
                    }
                    setCardDetails({ ...cardDetails, expiry: value })
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setCardDetails({ ...cardDetails, cvv: value })
                  }}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card *</Label>
              <Input
                id="cardName"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="JOHN DOE"
                required
              />
            </div>
          </div>
        )}
      </Card>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-success/10 text-success border-success">
              Secure Payment
            </Badge>
            <span className="text-sm">256-bit encryption • PCI DSS compliant</span>
          </div>
        </AlertDescription>
      </Alert>

      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the{' '}
              <button type="button" className="text-primary underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary underline">
                Cancellation Policy
              </button>
              . I understand that local operators will contact me to confirm pickup details and answer any questions.
            </Label>
          </div>
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={!isValid || isProcessing}>
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay ${formatPrice(finalTotal)}`
        )}
      </Button>

      <div className="text-center text-xs text-muted-foreground">
        Your payment information is encrypted and secure. We never store your full card details.
      </div>
    </form>
  )
}
