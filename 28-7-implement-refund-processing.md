# Story 28-7: Implement Refund Processing

**Epic**: 28 - Admin Refunds & Audit Trail  
**Priority**: P1 - Critical Missing Functionality  
**Status**: ready-for-dev  
**Effort**: 1 day

## Context

Refund edge function (`supabase/functions/process-refund/index.ts`) currently returns `{ success: true }` without any actual Stripe integration or database updates. Refunds cannot be processed in production.

## User Story

As an **admin**, I need **functional refund processing** so that **I can issue refunds to travelers through Stripe and update booking records appropriately**.

## Acceptance Criteria

- [ ] Refunds process through Stripe API successfully
- [ ] Payment records update to 'refunded' status
- [ ] Booking records update to 'refunded' status
- [ ] Audit log captures refund action with admin actor
- [ ] Idempotency prevents duplicate refunds
- [ ] Stripe errors handled gracefully with user-friendly messages
- [ ] E2E test covers successful refund flow
- [ ] E2E test covers error cases

## Tasks

### Stripe Integration

- [ ] **DEF-005**: Add Stripe SDK to edge function
- [ ] Import and initialize Stripe with secret key from environment
- [ ] Implement `stripe.refunds.create()` call
- [ ] Use payment_intent_id from payment record
- [ ] Generate idempotency key: `refund_${bookingId}_${timestamp}`
- [ ] Handle Stripe webhook for refund completion (async)

### Database Updates

- [ ] Update `payments` table:
  - Set `status = 'refunded'`
  - Set `refund_id` from Stripe response
  - Set `refunded_at = NOW()`
- [ ] Update `bookings` table:
  - Set `status = 'refunded'`
  - Set `refunded_at = NOW()`
  - Set `refunded_by = admin_user_id`

### Audit Trail

- [ ] Call `auditService.logAction()` with:
  - `action: 'booking.refund'`
  - `resource_type: 'booking'`
  - `resource_id: bookingId`
  - `actor_id: adminUserId`
  - `actor_type: 'admin'`
  - `metadata: { refund_id, amount, reason }`

### Error Handling

- [ ] Check if already refunded (idempotency)
- [ ] Validate booking exists and is in refundable state
- [ ] Catch Stripe API errors (insufficient funds, invalid payment, etc.)
- [ ] Return structured error responses
- [ ] Log errors to monitoring service

### Testing

- [ ] Create E2E test: `tests/e2e/admin-refund.spec.ts`
- [ ] Test successful refund flow
- [ ] Test duplicate refund attempt (idempotency)
- [ ] Test invalid booking ID
- [ ] Test Stripe error handling (mock)

## Technical Implementation

### Edge Function Structure

```typescript
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const { bookingId, reason, adminUserId } = await req.json();

    // 1. Fetch booking and payment
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, payment:payments(*)')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
      });
    }

    if (booking.status === 'refunded') {
      return new Response(
        JSON.stringify({ success: true, message: 'Already refunded' }),
        { status: 200 },
      );
    }

    // 2. Process Stripe refund logic here...
    // (See full implementation details in task list)

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Refund error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

## Definition of Done

- [ ] All task checkboxes marked [x]
- [ ] Refunds process successfully in Stripe test mode
- [ ] Database records update correctly
- [ ] Audit trail captures refund actions
- [ ] Idempotency prevents duplicates
- [ ] E2E tests passing
- [ ] Dev Agent Record completed

---

**Related Defects**: DEF-005  
**Blocked By**: Story 25-6 (audit service type errors must be fixed)  
**Blocks**: Epic 28 completion, admin operations production readiness
