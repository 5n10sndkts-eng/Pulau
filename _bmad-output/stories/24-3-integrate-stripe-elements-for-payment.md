# Story 24.3: Integrate Stripe Checkout for Payment

Status: done

## Story

As a **traveler**,
I want to enter my payment details securely,
So that my card information is protected.

## Acceptance Criteria

1. **Given** I am on the payment step of checkout
   **When** the payment form renders
   **Then** Stripe Elements iframe loads for card input
   **And** I can enter card number, expiry, CVC

2. **Given** I am on a supported device/browser
   **When** viewing payment options
   **Then** Apple Pay / Google Pay buttons appear if supported
   **And** I can use these as alternative payment methods

3. **Given** I am entering card details
   **When** I type card information
   **Then** card input validates in real-time (card type, errors)
   **And** I see the card brand icon as I type

4. **Given** the payment form is submitted
   **When** the card requires 3D Secure verification
   **Then** 3D Secure is enforced for liability shift
   **And** I am redirected to complete verification

5. **Given** Stripe Elements are used
   **When** card data is entered
   **Then** NO raw card data touches our servers (PCI SAQ-A compliance)

## Tasks / Subtasks

- [x] Task 1: Set up Stripe Checkout redirect (AC: #1, #5)
  - [x] 1.1: Checkout Edge Function creates Stripe Checkout Session (from Story 24.1)
  - [x] 1.2: CheckoutReview component redirects to Stripe-hosted checkout page
  - [x] 1.3: Stripe handles all card input securely (PCI SAQ-A compliant)
  - [x] 1.4: No raw card data touches our servers

- [x] Task 2: Handle success return (AC: #1, #3)
  - [x] 2.1: Create `CheckoutSuccess.tsx` success return handler
  - [x] 2.2: Parse session_id from URL query params
  - [x] 2.3: Poll for booking confirmation from webhook
  - [x] 2.4: Display booking reference and confirmation

- [x] Task 3: Handle cancel return (AC: #2)
  - [x] 3.1: Create `CheckoutCancel.tsx` cancel handler
  - [x] 3.2: Explain why payment may have been cancelled
  - [x] 3.3: Provide retry and return options
  - [x] 3.4: Link to support contact

- [x] Task 4: Add routes for return URLs (AC: #4, #5)
  - [x] 4.1: Add `/checkout/success` route to App.tsx
  - [x] 4.2: Add `/checkout/cancel` route to App.tsx
  - [x] 4.3: Wrap routes with ProtectedRoute
  - [x] 4.4: Wire navigation callbacks

- [x] Task 5: Implement UX states (AC: #1, #3)
  - [x] 5.1: Loading state during session verification
  - [x] 5.2: Pending state while waiting for webhook
  - [x] 5.3: Error state with support contact
  - [x] 5.4: Demo mode support for development

## Dev Notes

### Architecture Patterns & Constraints

**Component Structure:**
```
src/components/checkout/
  StripeProvider.tsx      # Wraps app/checkout with Elements
  PaymentForm.tsx         # Card input form (this story)
  CheckoutSuccess.tsx     # Success screen after payment
  CheckoutCancel.tsx      # Cancel/return screen
```

**Stripe Provider Setup:**
```typescript
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
```

**Payment Flow (Stripe Checkout Session):**
```
1. User clicks "Pay Now" on CheckoutReview (Story 24.2)
2. Frontend calls checkout Edge Function (Story 24.1)
3. Edge Function creates Stripe Checkout Session
4. Edge Function returns sessionUrl
5. Frontend redirects to Stripe-hosted checkout page
6. Stripe handles card input, 3DS, Apple/Google Pay
7. On success, Stripe redirects to success_url
8. Webhook confirms payment (Story 24.4)
```

### Previous Story Intelligence

**From Story 24.1 (checkout Edge Function):**
- Returns `sessionUrl` for Stripe Checkout redirect
- Success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/checkout/cancel`
- Payment modes: card only (MVP)

**From Story 24.2 (CheckoutReview):**
- CheckoutReview calls checkout function and receives sessionUrl
- This story handles the redirect and return screens

### Technical Requirements

**Environment Variables:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**Stripe Checkout Redirect:**
```typescript
// Simple redirect to Stripe-hosted checkout
function handlePayment(sessionUrl: string) {
  // Stripe handles all card input securely
  window.location.href = sessionUrl
}
```

**Success Page Handler:**
```typescript
// src/components/checkout/CheckoutSuccess.tsx
export function CheckoutSuccess() {
  const searchParams = new URLSearchParams(window.location.search)
  const sessionId = searchParams.get('session_id')

  // Optionally verify session status via API
  // Main confirmation handled by webhook (Story 24.4)

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your booking is being confirmed...</p>
    </div>
  )
}
```

**Cancel Page Handler:**
```typescript
// src/components/checkout/CheckoutCancel.tsx
export function CheckoutCancel() {
  const navigate = useNavigate() // or setCurrentScreen

  return (
    <div>
      <h1>Payment Cancelled</h1>
      <p>Your booking was not completed.</p>
      <button onClick={() => navigate('/trip')}>Return to Trip</button>
    </div>
  )
}
```

### UX Requirements

**Stripe Checkout Benefits (vs Custom Elements):**
- PCI compliance handled by Stripe
- Built-in Apple Pay / Google Pay
- Built-in 3D Secure handling
- Mobile-optimized UI
- Localized in 40+ languages

**Loading States:**
- "Redirecting to secure checkout..." message
- Spinner while checkout session is being created

**Error States:**
- Toast for failed session creation
- Return to checkout review on cancel

### File Structure Requirements

```
src/
  components/
    checkout/
      StripeProvider.tsx    # Stripe Elements wrapper
      PaymentForm.tsx       # Optional: only if using embedded Elements
      CheckoutSuccess.tsx   # Success return handler
      CheckoutCancel.tsx    # Cancel return handler
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 24.3]
- [Source: _bmad-output/stories/24-1-create-checkout-edge-function.md - Success/Cancel URLs]
- [Source: Stripe Checkout documentation - https://stripe.com/docs/payments/checkout]
- [Source: project-context.md#Code Organization]

### PCI Compliance Notes

**SAQ-A Compliance (Stripe Checkout):**
- Card data never touches our servers
- All card input happens on Stripe-hosted page
- Payment confirmation via webhook only
- No card numbers in logs or database

**DO NOT:**
- Log any card details
- Store card numbers in state
- Pass card data to our backend
- Use custom card input fields (use Stripe-hosted checkout)

### Testing Requirements

**Test Cards (Stripe Test Mode):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3DS Required: `4000 0025 0000 3155`
- Insufficient Funds: `4000 0000 0000 9995`

**Test Scenarios:**
1. ✅ Redirect to Stripe Checkout → Opens Stripe-hosted page
2. ✅ Complete payment with test card → Redirects to success page
3. ✅ Cancel payment → Redirects to cancel page
4. ✅ 3DS required card → Completes 3DS flow
5. ✅ Declined card → Shows decline error on Stripe page

### Security Considerations

- HTTPS required for all Stripe integration
- Publishable key only (never expose secret key client-side)
- Session URL should be short-lived (typically 24 hours)
- Always verify payment success via webhook, not redirect

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- TypeScript compilation: PASS
- Build: PASS
- Tests: 29/29 PASS

### Completion Notes List
1. Created CheckoutSuccess.tsx for handling successful Stripe Checkout returns
   - Parses session_id from URL query params
   - Polls for booking confirmation via Supabase
   - Shows loading, pending, success, and error states
   - Displays booking reference when available
   - Demo mode support for development
2. Created CheckoutCancel.tsx for handling cancelled payments
   - Explains why payment may have been cancelled
   - Provides Try Again, Return to Cart, and Continue Browsing options
   - Links to support contact
3. Added routes to App.tsx
   - /checkout/success - Protected route for success handler
   - /checkout/cancel - Protected route for cancel handler
4. Implementation uses Stripe-hosted Checkout (redirect-based)
   - All payment form handling done by Stripe
   - PCI SAQ-A compliant - no card data touches our servers
   - Apple Pay / Google Pay / 3D Secure handled automatically by Stripe

### Code Review Fixes (Post-Implementation)
1. **CRITICAL FIX**: CheckoutSuccess.tsx queried wrong table for session ID
   - Original: Queried `bookings` table for `stripe_checkout_session_id`
   - Fixed: Now queries `payments` table (which has the field) with join to get booking reference

### File List
- src/components/checkout/CheckoutSuccess.tsx (CREATED, FIXED in code review)
- src/components/checkout/CheckoutCancel.tsx (CREATED)
- src/components/checkout/CheckoutSuccess.test.tsx (CREATED)
- src/App.tsx (MODIFIED - added routes)

