/**
 * PaymentRequestButton Component
 * Story: 33.4 - Checkout Form Optimization (AC #4)
 *
 * One-tap payment button styled like Apple Pay / Google Pay
 * Visual only for MVP - actual payment integration in Epic 24
 */

import { Button } from '@/components/ui/button';
import { AppleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentRequestButtonProps {
  /** Total amount to display */
  amount: number;
  /** Currency code */
  currency?: string;
  /** Callback when button is clicked */
  onPay: () => void;
  /** Is processing payment */
  isProcessing?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function PaymentRequestButton({
  amount,
  currency = 'USD',
  onPay,
  isProcessing = false,
  disabled = false,
}: PaymentRequestButtonProps) {
  const [paymentType, setPaymentType] = useState<'applepay' | 'googlepay' | 'default'>('default');

  useEffect(() => {
    // Detect if Apple Pay is available
    const isApplePayAvailable = 
      typeof window !== 'undefined' &&
      'ApplePaySession' in window &&
      (window as any).ApplePaySession?.canMakePayments?.();

    // Detect if Google Pay is available (simplified check)
    const isGooglePayAvailable = 
      typeof window !== 'undefined' && 
      navigator.userAgent.includes('Android');

    if (isApplePayAvailable) {
      setPaymentType('applepay');
    } else if (isGooglePayAvailable) {
      setPaymentType('googlepay');
    }
  }, []);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);

  if (paymentType === 'applepay') {
    return (
      <Button
        size="lg"
        onClick={onPay}
        disabled={disabled || isProcessing}
        className="w-full h-14 bg-black hover:bg-black/90 text-white text-lg font-medium rounded-xl shadow-lg"
      >
        {isProcessing ? (
          'Processing...'
        ) : (
          <div className="flex items-center gap-2">
            <AppleIcon className="w-6 h-6" />
            <span>Pay {formattedAmount}</span>
          </div>
        )}
      </Button>
    );
  }

  if (paymentType === 'googlepay') {
    return (
      <Button
        size="lg"
        onClick={onPay}
        disabled={disabled || isProcessing}
        className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 text-lg font-medium rounded-xl shadow-lg"
      >
        {isProcessing ? (
          'Processing...'
        ) : (
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72 0-4.827 3.773-8.72 8.6-8.72 2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
            </svg>
            <span>Pay {formattedAmount}</span>
          </div>
        )}
      </Button>
    );
  }

  // Default button for other browsers
  return (
    <Button
      size="lg"
      onClick={onPay}
      disabled={disabled || isProcessing}
      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-xl shadow-lg"
    >
      {isProcessing ? 'Processing Payment...' : `Pay ${formattedAmount}`}
    </Button>
  );
}
