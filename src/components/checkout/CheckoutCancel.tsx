/**
 * CheckoutCancel Component
 * Story: 24.3 - Integrate Stripe Checkout for Payment
 * Phase: 2a - Core Transactional
 *
 * Handles cancelled/aborted Stripe Checkout sessions.
 * Provides options to retry or return to trip planning.
 */

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, ShoppingCart } from 'lucide-react'

// ================================================
// TYPES
// ================================================

interface CheckoutCancelProps {
  onRetryCheckout: () => void
  onReturnToTrip: () => void
  onNavigateHome: () => void
}

// ================================================
// MAIN COMPONENT
// ================================================

export function CheckoutCancel({
  onRetryCheckout,
  onReturnToTrip,
  onNavigateHome,
}: CheckoutCancelProps) {
  return (
    <div className="max-w-md mx-auto p-6 space-y-6 min-h-[60vh] flex flex-col justify-center">
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was not completed. Don't worry - no charges were made and your cart is still saved.
        </p>

        <Alert className="mb-6 text-left">
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Why was my payment cancelled?</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>You may have clicked "Back" or closed the payment page</li>
              <li>Your session may have expired (sessions last 24 hours)</li>
              <li>There may have been a temporary connection issue</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button onClick={onRetryCheckout} className="w-full" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onReturnToTrip} variant="outline" className="w-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Return to Cart
          </Button>
          <Button onClick={onNavigateHome} variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Browsing
          </Button>
        </div>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Having trouble? Contact us at{' '}
          <a href="mailto:support@pulau.travel" className="text-primary underline">
            support@pulau.travel
          </a>
        </p>
      </div>
    </div>
  )
}
