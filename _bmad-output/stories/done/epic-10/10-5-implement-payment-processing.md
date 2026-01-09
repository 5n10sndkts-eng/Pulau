# Story 10.5: Implement Payment Processing

Status: done

## Story

As a traveler submitting payment,
I want my payment processed securely,
So that my booking is confirmed.

## Acceptance Criteria

**AC #1: Process payment with loading state**
**Given** I tap "Pay $XXX" button on payment screen
**When** payment processing begins
**Then** button shows loading spinner and "Processing..."
**And** all form inputs are disabled during processing
**And** payment token is generated via payment gateway (Stripe/PayPal)

**AC #2: Create booking record**
**And** booking record created in bookings KV namespace:
  - id, user_id, trip_id, status: 'pending', total_amount, payment_token, created_at

**AC #3: Handle successful payment**
**When** payment succeeds
**Then** booking status updates to 'confirmed'
**And** booking_reference generated (format: PL-XXXXXX)
**And** user advances to Step 4 (Confirmation)

**AC #4: Handle payment failure**
**When** payment fails
**Then** error message displays: "Payment failed: [reason]"
**And** "Try Again" button allows retry
**And** booking status remains 'pending' or 'failed'

## Tasks / Subtasks

### Task 1: Integrate payment gateway SDK (AC: #1)
- [x] Install Stripe SDK: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- [x] Initialize Stripe with publishable key
- [x] Wrap payment form in Elements provider
- [x] Configure Stripe Elements appearance to match design
- [x] Set up PayPal SDK if supporting PayPal

### Task 2: Implement payment token generation (AC: #1)
- [x] Create payment method using Stripe Elements
- [x] Generate payment token from card details
- [x] Handle tokenization errors (invalid card, etc.)
- [x] Add client-side card validation before tokenization
- [x] Show loading state during token generation

### Task 3: Create booking record on payment submission (AC: #2)
- [x] Create POST /api/bookings endpoint
- [x] Generate booking record with pending status
- [x] Store trip snapshot, traveler details, and payment token
- [x] Return booking ID to client
- [x] Handle Spark KV store errors gracefully

### Task 4: Process payment and confirm booking (AC: #3)
- [x] Send payment token to backend for processing
- [x] Charge payment via Stripe/PayPal API
- [x] Update booking status to 'confirmed' on success
- [x] Generate unique booking_reference (PL-XXXXXX format)
- [x] Store payment transaction ID in Spark KV store

### Task 5: Handle payment errors and retries (AC: #4)
- [x] Catch payment processing errors
- [x] Display user-friendly error messages
- [x] Map Stripe error codes to readable messages
- [x] Add "Try Again" button to retry payment
- [x] Log failed payment attempts for debugging

## Dev Notes

### Technical Guidance
- Use Stripe for credit card processing (PCI compliant)
- Never store raw card details on client or server
- Payment tokens are single-use and expire
- Backend should verify payment success with Stripe API
- Use Stripe webhooks for async payment confirmations

### Stripe Integration
```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: travelerDetails.primaryContact.fullName,
        email: travelerDetails.primaryContact.email
      }
    });

    if (error) {
      setPaymentError(error.message);
      return;
    }

    // Send to backend for processing
    const response = await fetch('/api/bookings/process-payment', {
      method: 'POST',
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        bookingId,
        amount: totalAmount
      })
    });

    const result = await response.json();

    if (result.success) {
      // Payment succeeded
      updateBookingStatus('confirmed');
      nextStep(); // Go to confirmation
    } else {
      setPaymentError(result.error);
    }
  };

  return <form onSubmit={handlePayment}>...</form>;
};
```

### Booking Reference Generation
```typescript
const generateBookingReference = (): string => {
  const prefix = 'PL';
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}-${randomDigits}`;
};
```

### Error Handling
```typescript
const mapStripeError = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try another payment method.',
    'insufficient_funds': 'Your card has insufficient funds.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'The CVV code is incorrect.',
    'processing_error': 'An error occurred while processing your payment. Please try again.'
  };
  return errorMap[errorCode] || 'Payment could not be processed. Please try again.';
};
```

### Booking Data Structure
```typescript
interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  booking_reference: string; // e.g., "PL-123456"
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  total_amount: number;
  payment_method_id: string;
  payment_intent_id: string; // From Stripe
  traveler_details: TravelerDetails;
  trip_snapshot: Trip;
  created_at: string;
  updated_at: string;
}
```

### Security Considerations
- Use HTTPS for all payment requests
- Validate payment amount on server (don't trust client)
- Implement rate limiting on payment endpoint
- Log all payment attempts for fraud detection
- Use Stripe's SCA (Strong Customer Authentication) for 3D Secure

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.5]
- [Source: prd/pulau-prd.md#Payment Processing]
- [Related: Story 10.4 - Build Step 3 - Payment Screen]
- [Technical: Stripe Documentation]
- [Technical: PCI Compliance Guidelines]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

