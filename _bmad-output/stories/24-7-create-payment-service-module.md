# Story 24.7: Create Payment Service Module

Status: done

## Story

As a **developer**,
I want a `paymentService.ts` module,
So that Stripe operations are centralized and type-safe.

## Acceptance Criteria

1. **Given** the paymentService module exists
   **When** used throughout the application
   **Then** it provides functions for:
     - `initiateCheckout(tripId)` - Call checkout Edge Function
     - `getPaymentByBookingId(bookingId)` - Retrieve payment record
     - `getPaymentsByUserId(userId)` - List user's payments
     - `calculatePlatformFee(amount)` - Calculate fee (15%)
     - `calculateVendorPayout(amount, fee)` - Calculate vendor amount

2. **Given** the service calls Edge Functions
   **When** API calls are made
   **Then** all Stripe-related Edge Function calls include proper authentication
   **And** errors are handled consistently with ApiResponse pattern

3. **Given** TypeScript types are used
   **When** working with payments
   **Then** TypeScript types align with database schema and Stripe types
   **And** all functions have proper return types

4. **Given** the service is used for checkout
   **When** initiating checkout
   **Then** idempotency is handled (prevent double-click issues)
   **And** loading states can be managed by calling code

## Tasks / Subtasks

- [x] Task 1: Create service file structure (AC: #1, #3)
  - [x] 1.1: Created `src/lib/paymentService.ts`
  - [x] 1.2: Defined Payment type matching database schema
  - [x] 1.3: Defined CheckoutResponse and error types
  - [x] 1.4: Following ApiResponse discriminated union pattern

- [x] Task 2: Implement checkout initiation (AC: #1, #2, #4)
  - [x] 2.1: Created `initiateCheckout(tripId: string)` function
  - [x] 2.2: Calls checkout Edge Function with JWT auth
  - [x] 2.3: Returns sessionUrl on success or error message
  - [x] 2.4: Created `useCheckoutWithRedirect()` convenience hook

- [x] Task 3: Implement payment queries (AC: #1, #2)
  - [x] 3.1: Created `getPaymentByBookingId(bookingId: string)` function
  - [x] 3.2: Created `getPaymentsByUserId(userId: string)` function
  - [x] 3.3: Created `getPaymentBySessionId(sessionId: string)` function
  - [x] 3.4: Queries through booking -> trip -> user relationship

- [x] Task 4: Implement fee calculation utilities (AC: #1, #3)
  - [x] 4.1: Created `calculatePlatformFee(amount: number)` function
  - [x] 4.2: Created `calculateVendorPayout(amount: number)` function
  - [x] 4.3: Exported `PLATFORM_FEE_PERCENTAGE` constant (0.15)
  - [x] 4.4: Uses `Math.round()` for consistent cent rounding

- [x] Task 5: Create TanStack Query hooks (AC: #2)
  - [x] 5.1: Created `src/hooks/usePayment.ts`
  - [x] 5.2: Implemented `usePaymentByBookingId(bookingId)` hook
  - [x] 5.3: Implemented `useUserPayments()` hook
  - [x] 5.4: Implemented `useInitiateCheckout()` mutation hook
  - [x] 5.5: Added `usePaymentBySessionId(sessionId)` hook

- [x] Task 6: Add comprehensive TypeScript types (AC: #3)
  - [x] 6.1: Added Payment interface to `src/lib/types.ts`
  - [x] 6.2: Added PaymentStatus union type
  - [x] 6.3: Added CheckoutRequest and CheckoutResponse types
  - [x] 6.4: Added generic ApiResponse<T> type

## Dev Notes

### Architecture Patterns & Constraints

**Service Layer Pattern (from project-context.md):**
```typescript
// lib/paymentService.ts
import { supabase } from '@/lib/supabase'

export async function getPaymentByBookingId(
  bookingId: string
): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
```

**API Response Pattern:**
```typescript
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }
```

### Type Definitions

```typescript
// src/lib/types.ts additions

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface Payment {
  id: string
  booking_id: string
  stripe_payment_intent_id: string
  stripe_checkout_session_id: string | null
  amount: number          // In cents
  currency: string
  platform_fee: number    // In cents
  vendor_payout: number   // In cents
  status: PaymentStatus
  refund_amount: number
  refund_reason: string | null
  created_at: string
  updated_at: string
}

export interface CheckoutRequest {
  tripId: string
}

export interface CheckoutResponse {
  success: boolean
  sessionUrl?: string
  sessionId?: string
  error?: string
  errorCode?: string
}
```

### Payment Service Implementation

```typescript
// src/lib/paymentService.ts
import { supabase } from '@/lib/supabase'
import type { Payment, CheckoutResponse, ApiResponse } from '@/lib/types'

// Constants
export const PLATFORM_FEE_PERCENTAGE = 0.15

// Fee Calculations
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENTAGE)
}

export function calculateVendorPayout(amountCents: number): number {
  return amountCents - calculatePlatformFee(amountCents)
}

// Checkout Initiation
export async function initiateCheckout(
  tripId: string
): Promise<ApiResponse<CheckoutResponse>> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { data: null, error: 'Not authenticated' }
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripId }),
      }
    )

    const result: CheckoutResponse = await response.json()

    if (!response.ok || !result.success) {
      return { data: null, error: result.error || 'Checkout failed' }
    }

    return { data: result, error: null }
  } catch (err) {
    return { data: null, error: 'Network error during checkout' }
  }
}

// Payment Queries
export async function getPaymentByBookingId(
  bookingId: string
): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getPaymentsByUserId(
  userId: string
): Promise<ApiResponse<Payment[]>> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      booking:bookings!inner(user_id)
    `)
    .eq('booking.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// Format helpers
export function formatAmountFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
```

### TanStack Query Hooks

```typescript
// src/hooks/usePayment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPaymentByBookingId,
  getPaymentsByUserId,
  initiateCheckout,
} from '@/lib/paymentService'
import { useAuth } from '@/hooks/useAuth'

export function usePaymentByBookingId(bookingId: string) {
  return useQuery({
    queryKey: ['payments', 'booking', bookingId],
    queryFn: () => getPaymentByBookingId(bookingId),
    enabled: !!bookingId,
  })
}

export function useUserPayments() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['payments', 'user', user?.id],
    queryFn: () => getPaymentsByUserId(user!.id),
    enabled: !!user?.id,
  })
}

export function useInitiateCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tripId: string) => initiateCheckout(tripId),
    onSuccess: () => {
      // Invalidate relevant queries after successful checkout
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}
```

### Previous Story Intelligence

**From Story 24.1 (checkout Edge Function):**
- Checkout returns `{ success, sessionUrl, sessionId, error }`
- Error codes: INSUFFICIENT_INVENTORY, VENDOR_NOT_PAYMENT_READY, etc.
- Platform fee is 15% of total

**From project-context.md:**
- Service layer pattern: All Supabase calls through service files
- ApiResponse discriminated union pattern
- TanStack Query for data fetching
- Query key hierarchy: `['payments', bookingId]`

### File Structure Requirements

```
src/
  lib/
    paymentService.ts     # Service module (this story)
    types.ts              # Add Payment types
  hooks/
    usePayment.ts         # TanStack Query hooks
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 24.7]
- [Source: project-context.md#Service Layer Pattern]
- [Source: project-context.md#TanStack Query Hook Pattern]
- [Source: _bmad-output/stories/24-1-create-checkout-edge-function.md - API contracts]

### Testing Requirements

**Unit Tests:**
```typescript
// lib/paymentService.test.ts
describe('paymentService', () => {
  describe('calculatePlatformFee', () => {
    it('calculates 15% fee correctly', () => {
      expect(calculatePlatformFee(10000)).toBe(1500)
      expect(calculatePlatformFee(1234)).toBe(185) // Rounded
    })
  })

  describe('calculateVendorPayout', () => {
    it('calculates 85% payout correctly', () => {
      expect(calculateVendorPayout(10000)).toBe(8500)
    })
  })
})
```

**Test Scenarios:**
1. ✅ calculatePlatformFee returns correct 15% → Rounds to nearest cent
2. ✅ calculateVendorPayout returns amount minus fee → Correct calculation
3. ✅ initiateCheckout with valid trip → Returns sessionUrl
4. ✅ initiateCheckout without auth → Returns error
5. ✅ getPaymentByBookingId → Returns payment or null
6. ✅ formatAmountFromCents(1234) → "$12.34"

### Usage Examples

```typescript
// In a component
import { useInitiateCheckout } from '@/hooks/usePayment'
import { formatAmountFromCents, calculatePlatformFee } from '@/lib/paymentService'

function CheckoutButton({ tripId, totalCents }: Props) {
  const { mutate: checkout, isPending } = useInitiateCheckout()

  const handleCheckout = () => {
    checkout(tripId, {
      onSuccess: (result) => {
        if (result.data?.sessionUrl) {
          window.location.href = result.data.sessionUrl
        }
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div>
      <p>Total: {formatAmountFromCents(totalCents)}</p>
      <p>Platform Fee: {formatAmountFromCents(calculatePlatformFee(totalCents))}</p>
      <Button onClick={handleCheckout} disabled={isPending}>
        {isPending ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </div>
  )
}
```

### Security Considerations

- Never expose secret keys client-side
- Use JWT auth for all Edge Function calls
- Fee calculations are for display only (server authoritative)
- RLS ensures users only see their own payments

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- Followed existing service layer patterns in codebase
- Added ApiResponse<T> generic type for discriminated union pattern
- Created comprehensive test suite with 20 tests

### Completion Notes List
1. Created paymentService.ts with all required functions
2. Added Payment, PaymentStatus, CheckoutResponse types to types.ts
3. Created TanStack Query hooks in usePayment.ts
4. Fee calculations use Math.round for consistent cent handling
5. Added status helper functions (labels, colors, predicates)
6. Created useCheckoutWithRedirect for convenient checkout flow
7. All 20 unit tests pass

### File List
- `src/lib/paymentService.ts` - Payment service module (220 lines)
- `src/lib/paymentService.test.ts` - Unit tests (20 tests)
- `src/hooks/usePayment.ts` - TanStack Query hooks
- `src/lib/types.ts` - Added Payment types

