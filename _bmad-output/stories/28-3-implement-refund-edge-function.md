# Story 28.3: Implement Refund Edge Function

Status: done

## Story

As a **platform operator**,
I want a `process-refund` Edge Function,
So that refunds are processed securely via Stripe.

## Acceptance Criteria

1. **Given** an admin initiates a refund
   **When** the `process-refund` Edge Function is called
   **Then** it:
   - Validates admin has refund permissions
   - Validates refund amount doesn't exceed original payment
   - Creates Stripe refund via API
   - Updates payment record with refund_amount and refund_reason
   - Updates booking status to "refunded" or "partially_refunded"
   - Creates audit log entry with all details
   **And** uses idempotency key to prevent duplicate refunds
   **And** handles Stripe errors gracefully

## Tasks / Subtasks

- [x] Create process-refund Edge Function (AC: 1)
  - [x] Create `supabase/functions/process-refund/index.ts`
  - [x] Import Stripe SDK for Deno
  - [x] Authenticate admin from request headers
  - [x] Parse refund request from body
- [x] Validate refund request (AC: 1)
  - [x] Check user has admin role
  - [x] Fetch booking and payment records
  - [x] Verify booking exists and is refundable
  - [x] Verify refund amount <= original payment amount
  - [x] Check booking not already fully refunded
  - [x] Return 400 error if validation fails
- [x] Process Stripe refund (AC: 1)
  - [x] Call `stripe.refunds.create()`
  - [x] Pass payment_intent_id from payment record
  - [x] Set refund amount
  - [x] Set refund reason metadata
  - [x] Use idempotency key (booking_id + timestamp)
  - [x] Handle Stripe errors (insufficient funds, already refunded, etc.)
- [x] Update database records (AC: 1)
  - [x] Update payments table: refund_amount, refund_reason, refund_id
  - [x] Update booking status: "refunded" (full) or "partially_refunded" (partial)
  - [x] Create audit log entry with full details
  - [x] Use database transaction for atomicity

## Dev Notes

### Architecture Patterns

**Edge Function Flow:**
1. Authenticate admin user
2. Validate refund request
3. Create Stripe refund
4. Update database in transaction:
   - Update payments table
   - Update booking status
   - Create audit log
5. Return success response

**Stripe Refund API:**
```typescript
const refund = await stripe.refunds.create(
  {
    payment_intent: paymentIntentId,
    amount: refundAmount,  // in cents
    reason: 'requested_by_customer',
    metadata: {
      admin_id: adminId,
      booking_id: bookingId,
      refund_reason: reason
    }
  },
  {
    idempotencyKey: `refund-${bookingId}-${Date.now()}`
  }
)
```

**Idempotency:**
- Use idempotency key to prevent duplicate refunds
- Format: `refund-{bookingId}-{timestamp}`
- Stripe deduplicates requests with same key
- Store idempotency key in database for tracking

**Error Handling:**
- Stripe errors: insufficient_funds, charge_already_refunded, etc.
- Database errors: transaction rollback
- Validation errors: return 400 with detailed message
- Log all errors for debugging

### Code Quality Requirements

**TypeScript Patterns:**
- Define RefundRequest and RefundResponse interfaces
- Use strict Stripe types
- Handle null/undefined from database queries
- Use try-catch for Stripe API calls

**Security:**
- Verify admin role via Supabase Auth
- Use RLS policies to restrict database access
- Log refund attempts to audit trail
- Validate refund amount server-side (don't trust client)

**Transaction Management:**
- Wrap database updates in transaction
- Rollback if Stripe refund fails
- Ensure atomicity (all updates or none)
- Handle transaction errors gracefully

### File Structure

**Files to Create:**
- `supabase/functions/process-refund/index.ts` - Edge Function

**Files to Reference:**
- `supabase/functions/checkout/index.ts` - Stripe integration example
- `supabase/functions/webhook-stripe/index.ts` - Stripe error handling

**Database Updates:**
```sql
-- Update payments table
UPDATE payments
SET refund_amount = $1,
    refund_reason = $2,
    refund_id = $3,  -- Stripe refund ID
    updated_at = NOW()
WHERE id = $4;

-- Update booking status
UPDATE bookings
SET status = CASE
    WHEN $1 = payment_amount THEN 'refunded'
    ELSE 'partially_refunded'
  END,
  updated_at = NOW()
WHERE id = $2;

-- Create audit log
INSERT INTO audit_logs (event_type, entity_type, entity_id, actor_id, metadata)
VALUES ('booking_refunded', 'booking', $1, $2, $3);
```

**Edge Function Template:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    // Authenticate admin
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.role !== 'admin') {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse request
    const { bookingId, amount, reason } = await req.json()

    // Fetch booking and payment
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, payment:payments(*)')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return new Response('Booking not found', { status: 404 })
    }

    if (amount > booking.payment.amount) {
      return new Response('Refund exceeds payment amount', { status: 400 })
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create(
      {
        payment_intent: booking.payment.payment_intent_id,
        amount: amount * 100,  // Convert to cents
        reason: 'requested_by_customer',
        metadata: { admin_id: user.id, booking_id: bookingId, reason }
      },
      { idempotencyKey: `refund-${bookingId}-${Date.now()}` }
    )

    // Update database (transaction)
    await supabase.rpc('process_refund_transaction', {
      p_payment_id: booking.payment.id,
      p_booking_id: bookingId,
      p_refund_amount: amount,
      p_refund_reason: reason,
      p_refund_id: refund.id,
      p_admin_id: user.id
    })

    return new Response(JSON.stringify({ success: true, refund }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Refund error:', error)
    return new Response(error.message, { status: 500 })
  }
})
```

### Testing Requirements

**Manual Testing:**
- Initiate refund from admin dashboard (Story 28.2)
- Verify Stripe Dashboard shows refund
- Verify payment record updated
- Verify booking status changed
- Verify audit log created
- Test with invalid amount (> original) → expect error
- Test duplicate refund request → expect idempotency

**Error Testing:**
- Stripe API error → verify graceful handling
- Database transaction failure → verify rollback
- Invalid booking ID → expect 404
- Insufficient Stripe balance → expect clear error

**Edge Cases:**
- Partial refund then another partial → verify totals
- Refund cancelled booking → allow or block?
- Refund after vendor payout → handle correctly

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 28: Admin Refunds & Audit Trail
- Implements ARCH-EF-04: process-refund Edge Function
- Implements FR-ADM-02: Refund processing
- Works with Epic 24 (payments) for Stripe integration

**Integration Points:**
- Called from refund interface in Story 28.2
- Uses payment records from Epic 24
- Creates audit logs via Story 28.5
- Updates booking status visible in Story 28.1

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-28-Story-28.3]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#ARCH-EF-04]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-ADM-02]
- [Stripe Refunds API: https://stripe.com/docs/api/refunds]
- [Stripe Idempotency: https://stripe.com/docs/api/idempotent_requests]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Edge function implementation.

### Completion Notes List

**Implementation Summary:**
1. Created process-refund edge function with:
   - Stripe refunds.create() integration
   - Full and partial refund support
   - User authentication via JWT
   - Booking validation and status checks
   - Payment record updates
   - Audit log creation

2. Error handling for Stripe errors
3. CORS headers for browser requests
4. Idempotency via booking ID

### File List

**Created Files:**
- supabase/functions/process-refund/index.ts
