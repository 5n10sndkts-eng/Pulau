# Story 22.1: Create Stripe Connect Account for Vendor

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **vendor**,
I want to initiate the Stripe Connect onboarding process,
So that I can receive payments for my experiences.

## Acceptance Criteria

1. **Given** I am a registered vendor in the system
   **When** I click "Set Up Payments" on my vendor dashboard
   **Then** the system calls the `vendor-onboard` Edge Function

2. **Given** the `vendor-onboard` Edge Function is called
   **When** I am authenticated as a vendor
   **Then** a Stripe Connect Express account is created with my email
   **And** my `vendors.stripe_account_id` is populated

3. **Given** a Stripe Connect account is created
   **When** the account link is generated
   **Then** I am redirected to Stripe's hosted onboarding flow

4. **Given** the onboarding is initiated
   **When** the system records the action
   **Then** an audit log entry is created for account creation

5. **Given** I return from Stripe onboarding
   **When** I land on the refresh URL
   **Then** I see updated payment setup status on my dashboard

## Tasks / Subtasks

- [x] Task 1: Create `vendor-onboard` Edge Function (AC: #1, #2, #3, #4)
  - [x] 1.1: Create `supabase/functions/vendor-onboard/index.ts`
  - [x] 1.2: Implement Stripe Connect Express account creation
  - [x] 1.3: Store stripe_account_id in vendors table
  - [x] 1.4: Generate and return Stripe Account Link URL
  - [x] 1.5: Create audit log entry for account creation

- [x] Task 2: Add vendor dashboard payment setup trigger (AC: #1, #5)
  - [x] 2.1: Add "Set Up Payments" button to VendorDashboard component
  - [x] 2.2: Call vendor-onboard Edge Function on click
  - [x] 2.3: Handle redirect to Stripe onboarding URL
  - [x] 2.4: Display loading state during API call

- [x] Task 3: Handle Stripe onboarding return (AC: #5)
  - [x] 3.1: Dashboard shows payment status based on vendor record
  - [x] 3.2: Display success/pending status based on onboarding state
  - [x] 3.3: Return/refresh URLs configured in Edge Function

- [x] Task 4: Create vendorOnboardService module
  - [x] 4.1: Create `src/lib/vendorOnboardService.ts`
  - [x] 4.2: Add `initiateStripeOnboarding()` function
  - [x] 4.3: Add TypeScript types for onboarding responses
  - [x] 4.4: Add `getVendorPaymentStatus()` function
  - [x] 4.5: Add `getStripeExpressDashboardLink()` function

## Dev Notes

### Architecture Patterns & Constraints

**Edge Function Pattern (from phase-2-architecture.md):**
```typescript
// supabase/functions/vendor-onboard/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
```

**Stripe Connect Express Account Creation (from architecture):**
- Type: `express`
- Country: `ID` (Indonesia)
- Capabilities: `card_payments`, `transfers`

**Vendor State Machine:**
```
REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
```

### Stripe Connect Flow

1. Vendor clicks "Set Up Payments"
2. Frontend calls `vendor-onboard` Edge Function
3. Edge Function creates Stripe Connect Express account
4. Edge Function generates Account Link URL with return/refresh URLs
5. Frontend redirects vendor to Stripe hosted onboarding
6. Stripe handles KYC collection
7. Vendor returns to app at refresh/return URL
8. Webhook (Story 22.2) updates vendor status

### Environment Variables Required

**Edge Function Secrets (via `supabase secrets set`):**
- `STRIPE_SECRET_KEY` - Stripe secret key for API calls
- `APP_URL` - Base URL for return/refresh URLs (e.g., `https://pulau.app`)

**Already Configured:**
- `SUPABASE_URL` - Auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected

### Stripe Account Link URLs

- **Return URL**: `${APP_URL}/vendor/stripe/return` - User completed or exited onboarding
- **Refresh URL**: `${APP_URL}/vendor/stripe/refresh` - Link expired, needs new link

### Error Handling

- If vendor already has `stripe_account_id`, return existing account link
- If Stripe API fails, return appropriate error to frontend
- All errors logged to audit_logs with actor_type='system'

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Edge Functions Architecture]
- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Vendor KYC & Onboarding Architecture]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 22.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Edge Function created in `supabase/functions/vendor-onboard/index.ts`
- TypeScript type check passed with no errors

### Completion Notes List

1. **Edge Function**: Created `vendor-onboard` Edge Function with full Stripe Connect Express integration
2. **Account Creation**: Creates Stripe Express accounts with Indonesia (ID) country code
3. **Idempotent**: If vendor already has stripe_account_id, generates new account link instead of new account
4. **Audit Logging**: Creates audit log entries for both account creation and onboarding initiation
5. **Dashboard UI**: Added Payment Setup card with status-aware display (pending vs active)
6. **Service Module**: Created vendorOnboardService with initiateStripeOnboarding, getVendorPaymentStatus, getStripeExpressDashboardLink

### Verification Results

- TypeScript type check: ✅ PASS
- All imports resolve correctly
- VendorDashboard shows appropriate payment status cards

### File List

- `supabase/functions/vendor-onboard/index.ts` (CREATED)
- `src/lib/vendorOnboardService.ts` (CREATED)
- `src/components/vendor/VendorDashboard.tsx` (UPDATED)

### Code Review Record

**Reviewed by:** Claude Opus 4.5 (code-review workflow)
**Review Date:** 2026-01-09
**Issues Found:** 0 High, 0 Medium, 0 Low
**Issues Fixed:** 0
**Issues Deferred:** 0

**Acceptance Criteria Verification:**

| AC# | Description | Status |
|-----|-------------|--------|
| 1 | Click "Set Up Payments" calls Edge Function | ✅ PASS |
| 2 | Stripe Connect account created with vendor email | ✅ PASS |
| 3 | Redirect to Stripe onboarding flow | ✅ PASS |
| 4 | Audit log entry created | ✅ PASS |
| 5 | Dashboard shows updated payment status | ✅ PASS |

**Review Notes:**
- All 5 Acceptance Criteria verified as PASS
- Edge Function handles CORS correctly for browser requests
- Error handling includes Stripe-specific error responses
- Dashboard UI conditionally renders based on payment status
