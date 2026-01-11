# Story 27.5: Create Vendor Payout Status Edge Function

Status: done

## Story

As a **vendor**,
I want to check my payout status,
So that I know when to expect payment.

## Acceptance Criteria

1. **Given** I have completed bookings
   **When** I call the `vendor-payout-status` Edge Function
   **Then** it returns:
   - Pending payouts (funds in escrow)
   - Scheduled payouts (with expected date)
   - Completed payouts (with Stripe transfer ID)
   - Payout schedule settings from Stripe account
   **And** data is fetched from Stripe Connect API
   **And** response is cached for 5 minutes to reduce API calls

## Tasks / Subtasks

- [x] Create vendor-payout-status Edge Function (AC: 1)
  - [x] Create `supabase/functions/vendor-payout-status/index.ts`
  - [x] Set up Deno imports for Stripe SDK
  - [x] Authenticate vendor from request headers
  - [x] Retrieve vendor's stripe_account_id from database
- [x] Fetch payout data from Stripe (AC: 1)
  - [x] Call Stripe Connect API: `stripe.payouts.list({ stripeAccount: vendorStripeId })`
  - [x] Filter by status: pending, in_transit, paid, failed
  - [x] Get balance transactions for pending funds
  - [x] Retrieve payout schedule from Stripe account settings
- [x] Calculate payout summaries (AC: 1)
  - [x] Sum pending payouts (funds in escrow)
  - [x] List scheduled payouts with arrival_date
  - [x] List completed payouts with amount and transfer_id
  - [x] Show next payout date based on schedule
- [x] Implement caching (AC: 1)
  - [x] Cache response in Supabase for 5 minutes
  - [x] Use vendor_id as cache key
  - [x] Return cached data if fresh
  - [x] Refetch from Stripe if cache expired

## Dev Notes

### Architecture Patterns

**Edge Function Structure:**
- Deno runtime (TypeScript)
- Stripe SDK for Node.js (Deno-compatible)
- Authenticate vendor via JWT from request headers
- Call Stripe Connect API with vendor's stripe_account_id

**Stripe Connect API:**
- Endpoint: `GET /v1/payouts` with `Stripe-Account: acct_XXX` header
- Returns payouts for connected account
- Filter by status: pending, in_transit, paid, failed
- Get account balance: `GET /v1/balance`

**Response Structure:**
```typescript
interface PayoutStatusResponse {
  pending: {
    amount: number  // in cents
    currency: string
  }
  scheduled: Array<{
    amount: number
    currency: string
    arrivalDate: string  // ISO date
    payoutId: string
  }>
  completed: Array<{
    amount: number
    currency: string
    paidDate: string
    transferId: string
  }>
  payoutSchedule: {
    interval: 'daily' | 'weekly' | 'monthly' | 'manual'
    weeklyAnchor?: 'monday' | 'tuesday' | ...
    monthlyAnchor?: number  // day of month
  }
  nextPayoutDate?: string
}
```

### Code Quality Requirements

**TypeScript Patterns:**
- Use strict types for Stripe API responses
- Define PayoutStatusResponse interface
- Handle undefined/null from Stripe gracefully
- Use try-catch for Stripe API errors

**Error Handling:**
- Stripe API errors → return 500 with error message
- Vendor not found → return 404
- No stripe_account_id → return 400 "Vendor not onboarded"
- Rate limit exceeded → return 429

**Caching Strategy:**
- Store in Supabase table: `payout_status_cache`
- Columns: vendor_id, data (JSONB), cached_at (TIMESTAMPTZ)
- TTL: 5 minutes
- Invalidate on explicit refresh request

### File Structure

**Files to Create:**
- `supabase/functions/vendor-payout-status/index.ts` - Edge Function

**Files to Reference:**
- `supabase/functions/checkout/index.ts` - Example Edge Function structure
- `src/lib/paymentService.ts` - Stripe SDK patterns (client-side)

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
    // Authenticate vendor
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return new Response('Unauthorized', { status: 401 })

    // Get vendor's Stripe account ID
    const { data: vendor } = await supabase
      .from('vendors')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (!vendor?.stripe_account_id) {
      return new Response('Vendor not onboarded to Stripe', { status: 400 })
    }

    // Check cache
    const { data: cached } = await supabase
      .from('payout_status_cache')
      .select('data, cached_at')
      .eq('vendor_id', vendor.id)
      .single()

    if (cached && (Date.now() - new Date(cached.cached_at).getTime()) < 300000) {
      return new Response(JSON.stringify(cached.data), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch from Stripe
    const payouts = await stripe.payouts.list(
      { limit: 100 },
      { stripeAccount: vendor.stripe_account_id }
    )

    const balance = await stripe.balance.retrieve({
      stripeAccount: vendor.stripe_account_id
    })

    const account = await stripe.accounts.retrieve(vendor.stripe_account_id)

    // Build response...
    const response = { /* ... */ }

    // Cache response
    await supabase
      .from('payout_status_cache')
      .upsert({
        vendor_id: vendor.id,
        data: response,
        cached_at: new Date().toISOString()
      })

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
})
```

### Testing Requirements

**Manual Testing:**
- Call edge function from vendor dashboard
- Verify pending payouts displayed
- Verify scheduled payouts with dates
- Verify completed payouts with transfer IDs
- Check Stripe Dashboard for accuracy
- Test caching (call twice within 5 minutes, verify same response)

**Edge Cases:**
- Vendor with no payouts yet (return empty arrays)
- Stripe API timeout (handle gracefully)
- Invalid stripe_account_id (return error)
- Cache table doesn't exist (create migration)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 27: Vendor Check-In & Operations
- Implements FR-OPS-02: Payout status checking
- Works with Epic 22 (Vendor Stripe Onboarding) for stripe_account_id
- Uses Stripe Connect API from Epic 24 (Payment)

**Integration Points:**
- Uses stripe_account_id from Epic 22 (vendor onboarding)
- Called from vendor dashboard UI
- May display on Story 27.4 (operations page) or separate payout page
- Uses Stripe API like Epic 24 (checkout edge function)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-27-Story-27.5]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-OPS-02]
- [Stripe Payouts API: https://stripe.com/docs/api/payouts]
- [Stripe Connect: https://stripe.com/docs/connect/payouts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Edge function implementation.

### Completion Notes List

**Implementation Summary:**
1. Created vendor-payout-status edge function
2. Stripe Connect integration for payout status
3. Balance retrieval via Stripe API
4. Caching for performance optimization
5. Vendor authentication via JWT

### File List

**Created Files:**
- supabase/functions/vendor-payout-status/index.ts
