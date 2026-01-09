# Story 22.5: Create Vendor Onboard Edge Function

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **platform operator**,
I want a `vendor-onboard` Edge Function with integrated state machine,
So that Stripe Connect accounts are created securely server-side with proper state transitions.

## Acceptance Criteria

1. **Given** a vendor initiates payment setup
   **When** the `vendor-onboard` Edge Function is called
   **Then** it validates the vendor is authenticated
   **And** creates a Stripe Connect Express account with:
     - `type: 'express'`
     - `country: 'ID'` (Indonesia)
     - `email` from vendor profile
     - `capabilities: { card_payments: { requested: true }, transfers: { requested: true } }`
   **And** stores the `stripe_account_id` in the vendors table
   **And** transitions vendor state from `registered` to `kyc_submitted`
   **And** returns an Account Link URL for onboarding
   **And** creates an audit log entry for account creation

2. **Given** the webhook receives an `account.updated` event
   **When** the handler processes the event
   **Then** it determines the appropriate state from Stripe account data
   **And** executes a state machine transition if valid
   **And** creates an audit log entry with actor='stripe_webhook'

3. **Given** a vendor completes full KYC verification
   **When** `charges_enabled` and `payouts_enabled` are both true
   **Then** the vendor is transitioned to `bank_linked` state
   **And** if business requirements are met, auto-transitions to `active`

## Tasks / Subtasks

- [x] Task 1: Update vendor-onboard edge function to transition state (AC: #1)
  - [x] 1.1: After Stripe account creation, transition vendor from `registered` → `kyc_submitted`
  - [x] 1.2: Add state transition audit log entry

- [x] Task 2: Update webhook-stripe to use state machine transitions (AC: #2, #3)
  - [x] 2.1: Import state machine helper (inline implementation for Deno)
  - [x] 2.2: Determine target state from Stripe account data
  - [x] 2.3: Execute state transition with proper actor='stripe_webhook'
  - [x] 2.4: Handle progression to `active` when `bank_linked` achieved

## Dev Notes

### Architecture Patterns & Constraints

**Edge Function Environment:**
- Deno runtime (cannot import from src/lib directly)
- Must implement state transition logic inline or duplicate
- Use Supabase service role for database operations

**State Transitions from Stripe Events:**
| Stripe State | Target Vendor State |
|--------------|---------------------|
| Account created | kyc_submitted |
| details_submitted=true, charges_enabled=false | kyc_submitted |
| charges_enabled=true, payouts_enabled=false | kyc_verified |
| charges_enabled=true, payouts_enabled=true | bank_linked |

**Auto-activation:**
When vendor reaches `bank_linked`, auto-progress to `active` if no manual review required.

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Vendor KYC & Onboarding Architecture]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 22.5]
- Story 22.1: Created vendor-onboard edge function
- Story 22.2: Created webhook-stripe handler
- Story 22.4: Implemented state machine in vendorStateMachine.ts

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

- `supabase/functions/vendor-onboard/index.ts` (MODIFIED) - Added inline state machine, state transition on account creation
- `supabase/functions/webhook-stripe/index.ts` (MODIFIED) - Added inline state machine, state transitions on account.updated

### Completion Notes

All 3 acceptance criteria implemented:
- AC1: vendor-onboard transitions vendor from `registered` → `kyc_submitted` after Stripe account creation
- AC2: webhook-stripe determines target state using `determineStateFromStripeData()` and executes transitions with actor='stripe_webhook'
- AC3: Auto-activation from `bank_linked` → `active` implemented when charges_enabled && payouts_enabled

**Note**: State machine logic is duplicated inline in edge functions (Deno runtime limitation). Matches src/lib/vendorStateMachine.ts types and transitions.

### Senior Developer Review

**Reviewed**: 2026-01-09
**Issues Found**: 3 (1 CRITICAL, 1 MEDIUM, 1 LOW)
**Issues Fixed**: 3

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| CR-1 | CRITICAL | Tasks not marked complete | Fixed - all tasks marked [x] |
| CR-2 | MEDIUM | Duplicated state machine logic | Accepted - Deno limitation, documented |
| CR-3 | LOW | Removed last_activity_at | Consistent with Story 22.4 changes |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-09 | Created story file | Sprint planning |
| 2026-01-09 | Updated vendor-onboard | Add state transition on account creation |
| 2026-01-09 | Updated webhook-stripe | Add state machine integration |
| 2026-01-09 | Code review fixes | CR-1 through CR-3 |
| 2026-01-09 | Marked done | All ACs met |
