# Sprint Change Proposal - Phase 2a Quality Remediation

**Date**: January 12, 2026  
**Project**: Pulau  
**Sprint**: Phase 2a Post-Implementation Review  
**Status**: Awaiting Approval  
**Change Scope**: MODERATE - Requires backlog reorganization and focused implementation sprint

---

## 1. Issue Summary

### Problem Statement

Phase 2a implementation (Epics 25-28: Core Transactional Features) was marked "done" but contains **21 identified defects** preventing production deployment. Critical issues include:

- **4 P0 defects**: Build-breaking TypeScript compilation errors
- **8 P1 defects**: Critical features implemented as non-functional stubs
- **6 P2 defects**: Implementation gaps affecting user experience
- **3 P3 defects**: Documentation and compliance requirements incomplete

### Discovery Context

Issues discovered during adversarial code review executed on January 10, 2026, following completion of all Epic 25-28 stories. Review revealed systematic pattern: stories marked "done" with task checkboxes unchecked and minimal implementation depth.

### Evidence

- **Defect Backlog**: `_bmad-output/defects/phase-2a-defect-backlog.md`
- **Build Failures**: TypeScript compilation fails in `auditService.ts`, `RealtimeSlotDisplay.tsx`, `slotService.ts`, `realtimeService.test.ts`
- **Stub Implementations**:
  - `supabase/functions/process-refund/index.ts` - Returns `{ success: true }` without Stripe call
  - `src/components/vendor/QRScanner.tsx` - Empty `detectQRCode()` function
  - `src/components/vendor/VendorOperationsPage.tsx` - Uses hardcoded mock data
- **Missing Components**: `validate_booking_for_checkin` RPC, offline queue implementation, admin search interface

---

## 2. Impact Analysis

### Epic Impact

| Epic                             | Original Status | Actual Status   | Critical Issues                                 |
| -------------------------------- | --------------- | --------------- | ----------------------------------------------- |
| **Epic 25**: Real-Time Inventory | ✅ done         | ⚠️ needs-rework | P0 type errors, missing RPC function            |
| **Epic 26**: Offline PWA         | ✅ done         | ⚠️ needs-rework | P2 implementation gaps, SW registration unclear |
| **Epic 27**: Vendor Operations   | ✅ done         | ⚠️ needs-rework | P1 critical stubs (QR, check-in, data loading)  |
| **Epic 28**: Refunds & Audit     | ✅ done         | ⚠️ needs-rework | P1 refund stub, P0 audit service errors         |

**Impact on Future Epics**:

- **Epic 33** (UX 2.0): Ready for dev, should wait for P0/P1 fixes to avoid building on unstable foundation
- **Epic 30.1** (Email System): Blocked on external dependency (Resend setup), can proceed in parallel

### Story Impact

**Stories Requiring Rework** (18 total):

- Epic 25: Stories 25-1 through 25-5 (5 stories)
- Epic 26: Stories 26-1 through 26-5 (5 stories)
- Epic 27: Stories 27-1 through 27-5 (5 stories)
- Epic 28: Stories 28-1 through 28-6, excluding 28-4 (5 stories - 28-4 appears complete)

**New Stories Required** (3 total):

1. **Story 25-6**: Fix Phase 2a Type Errors (P0)
2. **Story 27-6**: Implement Vendor Critical Features (P1)
3. **Story 28-7**: Implement Refund Processing (P1)

### Artifact Conflicts

#### PRD (No Changes Required)

- ✅ Product vision remains valid
- ✅ MVP scope appropriate
- ⚠️ **Recommendation**: Add quality gates section to prevent future premature "done" declarations

#### Architecture (No Changes Required)

- ✅ System design sound
- ✅ Technology choices appropriate
- ✅ Implementation follows architectural patterns correctly (just incomplete)

#### UI/UX Specifications (No Changes Required)

- ✅ User experience design validated
- ✅ Components match specifications
- ⚠️ Backend integration missing for several UI components

#### Process Artifacts (Changes Required)

**Sprint Status YAML**:

- Update Epic 25-28 status from `done` → `needs-rework`
- Add new stories 25-6, 27-6, 28-7 with `ready-for-dev` status

**Story Template**:

- Add "Quality Gates" section with implementation and documentation checklists
- Enforce task completion before status change to "done"
- Require Dev Agent Record completion

**CI/CD Pipeline**:

- Add pre-merge type checking (`npm run type-check`)
- Add pre-merge test execution
- Consider adding build step to PR checks

---

## 3. Recommended Approach

### Selected Path: **Direct Adjustment** (Option 1)

**Rationale**:

1. **No architectural issues** - Design is sound, only implementation depth insufficient
2. **Clear fix paths** - All 21 defects have specific, actionable solutions
3. **Preserves momentum** - Team context retained, no rollback waste
4. **Timeline achievable** - Estimated 2-3 dev days for P0+P1 fixes
5. **Risk minimized** - Fixes are straightforward technical implementations

**Alternatives Considered**:

- ❌ **Option 2: Rollback** - Rejected: Stories have correct structure, rollback adds no value
- ❌ **Option 3: MVP Reduction** - Rejected: MVP scope is appropriate, just needs proper execution

### Implementation Strategy

**Phase 1: Immediate Fixes (P0) - 4-6 hours**

- Fix all TypeScript compilation errors
- Create missing RPC functions
- Verify clean build

**Phase 2: Critical Features (P1) - 1.5-2 days**

- Implement actual refund processing with Stripe
- Implement QR scanner with decode logic
- Replace mock data with real Supabase queries
- Implement check-in/no-show persistence
- Create ticket validation RPC

**Phase 3: Implementation Gaps (P2) - 1 day**

- Complete missing components
- Implement network sync
- Build admin search interface
- Verify PWA installation prompts

**Phase 4: Documentation (P3) - 2-3 hours**

- Complete Dev Agent Records
- Mark task checkboxes
- Create compliance documentation

### Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation                                            |
| ----------------------------- | ---------- | ------ | ----------------------------------------------------- |
| Hidden complexity in stubs    | Medium     | Medium | Time-box implementation, escalate if >1 day per story |
| Additional defects discovered | High       | Low    | Adversarial review after each fix phase               |
| Team velocity impact          | Low        | Low    | Dedicated fix sprint, no new feature work             |
| Timeline pressure             | Medium     | Medium | Prioritize P0/P1, defer P2/P3 if needed               |

---

## 4. Detailed Change Proposals

### PROPOSAL GROUP A: Sprint Status Updates

**File**: `_bmad-output/sprint-status.yaml`

**Change A1 - Update Epic Status (Lines ~286-297)**:

```yaml
OLD:
  epic-25: done
  epic-26: done
  epic-27: done
  epic-28: done

NEW:
  epic-25: needs-rework # P0: Type errors + RPC missing
  epic-26: needs-rework # P2: Implementation gaps
  epic-27: needs-rework # P1: Critical stubs (QR, persistence, data)
  epic-28: needs-rework # P1: Refund stub + P0 audit errors
```

**Change A2 - Add New Stories (Insert after line ~356)**:

```yaml
# Phase 2a Quality Remediation Sprint
25-6-fix-type-errors: ready-for-dev
27-6-implement-critical-features: ready-for-dev
28-7-implement-refund-processing: ready-for-dev
```

---

### PROPOSAL GROUP B: New Story Files

**Story B1**: `_bmad-output/stories/25-6-fix-type-errors.md`

````markdown
# Story 25-6: Fix Phase 2a Type Errors

**Epic**: 25 - Real-Time Inventory & Availability  
**Priority**: P0 - Build Breaking  
**Status**: ready-for-dev  
**Effort**: 4-6 hours

## Context

TypeScript compilation currently fails across multiple files in Epic 25 implementation, blocking production builds. Issues stem from incorrect property names, improper destructuring, and missing RPC functions.

## User Story

As a **developer**, I need **all TypeScript compilation errors resolved** so that **the application builds successfully and can be deployed to production**.

## Acceptance Criteria

- [ ] All TypeScript files compile without errors
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] All existing tests continue to pass
- [ ] No runtime regressions introduced

## Tasks

- [ ] **DEF-001**: Fix `src/lib/auditService.ts:44`
  - Change `user_id` → `actor_id`
  - Add required `actor_type` field (derive from context or default to 'user')
  - Verify auditService types align with `audit_logs` table schema
- [ ] **DEF-002**: Fix `src/components/RealtimeSlotDisplay.tsx:108-113`
  - Properly destructure `{ data, error }` from useQuery result
  - Handle loading state correctly
  - Verify component renders without type errors
- [ ] **DEF-003**: Create `decrement_slot_inventory` RPC function
  - Write database migration in `supabase/migrations/`
  - Implement atomic inventory decrement logic
  - Add RPC function signature to TypeScript types
  - Run migration on local database
  - Regenerate Supabase types: `npm run db:types`
- [ ] **DEF-004**: Fix `src/lib/realtimeService.test.ts:44`
  - Update mock to return valid status: `'ok' | 'error' | 'timed out'`
  - Verify test compiles and runs
- [ ] Run full type check: `npm run type-check`
- [ ] Run build verification: `npm run build`
- [ ] Run test suite: `npm run test`

## Technical Notes

### RPC Function Schema

```sql
CREATE OR REPLACE FUNCTION decrement_slot_inventory(
  slot_id_param UUID,
  quantity_param INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE experience_slots
  SET current_capacity = current_capacity - quantity_param
  WHERE id = slot_id_param
    AND current_capacity >= quantity_param
  RETURNING jsonb_build_object(
    'success', true,
    'new_capacity', current_capacity
  ) INTO result;

  IF result IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient capacity');
  END IF;

  RETURN result;
END;
$$;
```
````

## Definition of Done

- [ ] All task checkboxes marked [x]
- [ ] TypeScript compilation clean (zero errors)
- [ ] Build succeeds locally and in CI
- [ ] All tests passing
- [ ] Dev Agent Record completed

## Dev Agent Record

**Agent Model Used**: _[To be filled during implementation]_  
**Debug Log References**: _[To be filled during implementation]_  
**Completion Notes**: _[To be filled during implementation]_  
**Files Modified**:

- `src/lib/auditService.ts`
- `src/components/RealtimeSlotDisplay.tsx`
- `src/lib/slotService.ts`
- `src/lib/realtimeService.test.ts`
- `supabase/migrations/[timestamp]_create_decrement_inventory_rpc.sql`

---

**Related Defects**: DEF-001, DEF-002, DEF-003, DEF-004  
**Blocked By**: None  
**Blocks**: Epic 25 completion, production deployment

````

---

**Story B2**: `_bmad-output/stories/27-6-implement-critical-features.md`

```markdown
# Story 27-6: Implement Vendor Critical Features

**Epic**: 27 - Vendor Check-In & Operations
**Priority**: P1 - Critical Missing Functionality
**Status**: ready-for-dev
**Effort**: 1.5-2 days

## Context

Vendor operations features (QR scanning, today's bookings, check-in persistence) were implemented as stubs with no actual functionality. Vendors cannot use the application to manage their operations.

## User Story

As a **vendor**, I need **functional check-in tools** so that **I can scan tickets, view today's bookings, and record check-ins/no-shows**.

## Acceptance Criteria

- [ ] Vendors can scan QR codes on tickets and extract booking IDs
- [ ] Today's bookings load from actual database (not mock data)
- [ ] Check-ins persist to database with audit trail
- [ ] No-shows persist to database with audit trail
- [ ] Validation prevents duplicate check-ins
- [ ] Real-time updates reflect check-in status changes
- [ ] E2E test covers full check-in flow

## Tasks

### QR Scanner Implementation
- [ ] **DEF-006**: Install QR decode library: `npm install jsqr`
- [ ] Implement `detectQRCode()` in `src/components/vendor/QRScanner.tsx`
- [ ] Extract booking ID from QR code data format
- [ ] Add error handling for invalid QR codes
- [ ] Test with actual QR code generated from booking confirmation

### Real Data Loading
- [ ] **DEF-007**: Replace mock data in `VendorOperationsPage.tsx:29-49`
- [ ] Create Supabase query for today's bookings filtered by vendor
- [ ] Integrate TanStack Query for data fetching
- [ ] Add real-time subscription for booking updates
- [ ] Implement experience filter dropdown

### Ticket Validation RPC
- [ ] **DEF-008**: Create `validate_booking_for_checkin` RPC function
- [ ] Write migration in `supabase/migrations/`
- [ ] Implement validation checks:
  - Booking exists
  - Booking date matches today
  - Vendor owns the experience
  - Booking status is 'confirmed'
  - Not already checked in
- [ ] Regenerate types: `npm run db:types`

### Check-In Persistence
- [ ] **DEF-010**: Implement `bookingService.checkInBooking(bookingId)`
- [ ] Update booking status to 'checked-in'
- [ ] Record check-in timestamp
- [ ] Create audit log entry
- [ ] Update local state after successful persistence
- [ ] Handle errors gracefully

### No-Show Persistence
- [ ] **DEF-011**: Implement `bookingService.markNoShow(bookingId)`
- [ ] Update booking status to 'no-show'
- [ ] Record timestamp
- [ ] Create audit log entry
- [ ] Update local state after successful persistence

### Offline Queue (Optional - DEF-009)
- [ ] Create `src/lib/offlineQueue.ts` with IndexedDB
- [ ] Queue check-ins when offline
- [ ] Sync queued actions on network restoration
- [ ] Show pending sync indicator

### Testing
- [ ] Create E2E test: `tests/e2e/vendor-check-in.spec.ts`
- [ ] Test QR scan → validation → check-in flow
- [ ] Test no-show marking
- [ ] Test error cases (invalid QR, already checked in)

## Technical Notes

### QR Code Format
Booking confirmation QR should encode: `pulau://booking/{bookingId}`

### RPC Function Schema
```sql
CREATE OR REPLACE FUNCTION validate_booking_for_checkin(
  booking_id_param UUID,
  vendor_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  SELECT b.*, e.vendor_id
  INTO booking_record
  FROM bookings b
  JOIN experiences e ON b.experience_id = e.id
  WHERE b.id = booking_id_param;

  IF booking_record IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Booking not found');
  END IF;

  IF booking_record.vendor_id != vendor_id_param THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Unauthorized');
  END IF;

  IF booking_record.status = 'checked-in' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Already checked in');
  END IF;

  IF booking_record.status != 'confirmed' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Booking not confirmed');
  END IF;

  RETURN jsonb_build_object('valid', true, 'booking', row_to_json(booking_record));
END;
$$;
````

## Definition of Done

- [ ] All task checkboxes marked [x]
- [ ] QR scanning functional with real decode
- [ ] Today's bookings load from database
- [ ] Check-in/no-show persist with audit trail
- [ ] E2E test passing
- [ ] Dev Agent Record completed

## Dev Agent Record

**Agent Model Used**: _[To be filled during implementation]_  
**Debug Log References**: _[To be filled during implementation]_  
**Completion Notes**: _[To be filled during implementation]_  
**Files Modified**:

- `src/components/vendor/QRScanner.tsx`
- `src/components/vendor/VendorOperationsPage.tsx`
- `src/lib/bookingService.ts`
- `supabase/migrations/[timestamp]_create_validate_checkin_rpc.sql`
- `tests/e2e/vendor-check-in.spec.ts`

---

**Related Defects**: DEF-006, DEF-007, DEF-008, DEF-009, DEF-010, DEF-011  
**Blocked By**: Story 25-6 (type errors must be fixed first)  
**Blocks**: Epic 27 completion, vendor production readiness

````

---

**Story B3**: `_bmad-output/stories/28-7-implement-refund-processing.md`

```markdown
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
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
    }

    if (booking.status === 'refunded') {
      return new Response(JSON.stringify({ success: true, message: 'Already refunded' }), { status: 200 });
    }

    // 2. Process Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment.stripe_payment_intent_id,
      reason: 'requested_by_customer',
      metadata: { booking_id: bookingId, reason },
    }, {
      idempotencyKey: `refund_${bookingId}_${Date.now()}`,
    });

    // 3. Update database
    await supabase.from('payments').update({
      status: 'refunded',
      refund_id: refund.id,
      refunded_at: new Date().toISOString(),
    }).eq('id', booking.payment.id);

    await supabase.from('bookings').update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refunded_by: adminUserId,
    }).eq('id', bookingId);

    // 4. Audit log
    await supabase.from('audit_logs').insert({
      action: 'booking.refund',
      resource_type: 'booking',
      resource_id: bookingId,
      actor_id: adminUserId,
      actor_type: 'admin',
      metadata: { refund_id: refund.id, amount: refund.amount, reason },
    });

    return new Response(JSON.stringify({ success: true, refund }), { status: 200 });

  } catch (error) {
    console.error('Refund error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
````

## Definition of Done

- [ ] All task checkboxes marked [x]
- [ ] Refunds process successfully in Stripe test mode
- [ ] Database records update correctly
- [ ] Audit trail captures refund actions
- [ ] Idempotency prevents duplicates
- [ ] E2E tests passing
- [ ] Dev Agent Record completed

## Dev Agent Record

**Agent Model Used**: _[To be filled during implementation]_  
**Debug Log References**: _[To be filled during implementation]_  
**Completion Notes**: _[To be filled during implementation]_  
**Files Modified**:

- `supabase/functions/process-refund/index.ts`
- `tests/e2e/admin-refund.spec.ts`

---

**Related Defects**: DEF-005  
**Blocked By**: Story 25-6 (audit service type errors must be fixed)  
**Blocks**: Epic 28 completion, admin operations production readiness

````

---

### PROPOSAL GROUP C: Process Improvements

**Create New File**: `_bmad-output/story-template-quality-gates.md`

```markdown
# Story Template Enhancement - Quality Gates

## Purpose
Add quality gate checklist to story template to prevent premature "done" marking.

## New Section to Add

Insert this section at the bottom of the story template, before Dev Agent Record:

---

## Quality Gates

**Complete ALL items BEFORE marking story as 'done'**

### Implementation Checklist
- [ ] All task checkboxes marked with [x]
- [ ] Code compiles without TypeScript errors
- [ ] All tests passing (unit + integration + E2E where applicable)
- [ ] No P0/P1 defects identified in code review
- [ ] Code follows project conventions and style guide

### Documentation Checklist
- [ ] Dev Agent Record completed with:
  - Agent model used
  - Debug log references
  - Completion notes with summary
  - Complete file list
- [ ] All Acceptance Criteria verified and documented as met
- [ ] Known issues or limitations documented in story notes

### Verification Checklist
- [ ] Feature tested in development environment
- [ ] Edge cases handled appropriately
- [ ] Error states implemented and tested
- [ ] Performance acceptable (no obvious regressions)

### Definition of Done
Story can ONLY move to 'done' status when:
1. ✅ All quality gate checkboxes completed
2. ✅ Peer review completed (or pair programming session logged)
3. ✅ Stakeholder acceptance obtained (if user-facing feature)
4. ✅ Deployment successful (if applicable to current sprint)

---

## Rationale
Phase 2a implementation revealed systematic issue: 20 stories marked "done" with unchecked tasks and incomplete implementations. Quality gates enforce thorough completion before status changes.

## Implementation Plan
1. Update base story template file
2. Backfill quality gates section in existing "ready-for-dev" stories
3. Communicate new standard to development team
4. Consider automated checks in CI/CD to enforce gates
````

---

### PROPOSAL GROUP D: CI/CD Enhancements

**Recommendation**: Add Pre-Merge Quality Checks

**File**: `.github/workflows/pr-quality-check.yml` (create new)

```yaml
name: PR Quality Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript Type Check
        run: npm run type-check

      - name: Lint Check
        run: npm run lint

      - name: Unit Tests
        run: npm run test:unit

      - name: Build Check
        run: npm run build

      - name: Comment PR with Results
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const status = '${{ job.status }}';
            const message = status === 'success' 
              ? '✅ All quality checks passed!'
              : '❌ Quality checks failed. Please review the logs.';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: message
            });
```

**Rationale**: Automated checks prevent type errors and test failures from merging into main branch.

---

## 5. Implementation Handoff

### Change Scope Classification

**MODERATE** - Requires backlog reorganization and focused remediation sprint

### Handoff Recipients

**Primary**: Development Team (Dev Agent)
**Secondary**: Scrum Master (for backlog updates)
**Oversight**: Product Manager (for process improvements)

### Responsibilities

#### Development Team

- [ ] Execute Story 25-6 (Fix type errors) - **PRIORITY 1**
- [ ] Execute Story 27-6 (Vendor critical features) - **PRIORITY 2**
- [ ] Execute Story 28-7 (Refund processing) - **PRIORITY 3**
- [ ] Address P2 defects (DEF-013 through DEF-018) as time permits
- [ ] Complete Dev Agent Records for all stories
- [ ] Run adversarial code review after each fix phase

#### Scrum Master

- [ ] Update sprint-status.yaml with Epic status changes
- [ ] Add new stories (25-6, 27-6, 28-7) to backlog
- [ ] Communicate timeline impact to stakeholders
- [ ] Monitor progress and escalate blockers

#### Product Manager

- [ ] Update story template with quality gates section
- [ ] Document lessons learned in retrospective
- [ ] Consider process improvements (stricter DoD enforcement)
- [ ] Review Epic 33 (UX 2.0) start timing after P0/P1 complete

### Success Criteria

**Sprint Complete When**:

1. ✅ All P0 defects resolved (stories 25-6)
2. ✅ All P1 defects resolved (stories 27-6, 28-7)
3. ✅ Clean build: `npm run build` succeeds
4. ✅ Clean types: `npm run type-check` passes
5. ✅ All tests passing: `npm run test`
6. ✅ Production deployment successful
7. ✅ Quality gates added to story template
8. ✅ Sprint status reflects accurate state

**Optional (P2/P3)**:

- ⭕ P2 implementation gaps completed
- ⭕ Documentation cleanup (task checkboxes, Dev Agent Records)
- ⭕ CI/CD quality checks implemented

### Timeline Estimate

| Phase       | Duration     | Deliverables                     |
| ----------- | ------------ | -------------------------------- |
| P0 Fixes    | 4-6 hours    | Story 25-6 complete, clean build |
| P1 Critical | 1.5-2 days   | Stories 27-6, 28-7 complete      |
| P2 Gaps     | 1 day        | Remaining implementation work    |
| P3 Docs     | 2-3 hours    | Documentation updates            |
| **Total**   | **3-4 days** | Production-ready Phase 2a        |

### Risk Mitigation

- **Daily standups** to track progress and surface blockers early
- **Time-boxing** each story (escalate if exceeds estimate by 50%)
- **Incremental deployment** after each fix phase to verify stability
- **Rollback plan** prepared if critical issues discovered during fixes

---

## 6. Approval and Next Steps

### Approval Request

**Approver**: Moe (Product Owner)  
**Approval Status**: ⏳ Pending  
**Date Submitted**: January 12, 2026

**Questions for Review**:

1. Do you approve the recommended approach (Direct Adjustment)?
2. Do you approve the priority sequence (P0 → P1 → P2 → P3)?
3. Should Epic 33 (UX 2.0) wait for P0/P1 completion, or proceed in parallel?
4. Are the new story estimates (25-6: 4-6h, 27-6: 1.5-2d, 28-7: 1d) reasonable?

### Upon Approval

**Immediate Actions**:

1. Update sprint-status.yaml with epic status changes
2. Create story files (25-6, 27-6, 28-7)
3. Assign Story 25-6 to dev team (start immediately)
4. Schedule daily progress check-ins
5. Prepare production deployment verification checklist

**Communication Plan**:

- Notify stakeholders of timeline adjustment (3-4 day focused sprint)
- Update project board with remediation sprint
- Document lessons learned for retrospective

---

## Appendices

### Appendix A: Complete Defect Reference

See: `_bmad-output/defects/phase-2a-defect-backlog.md`

**Summary by Priority**:

- **P0** (4): DEF-001, DEF-002, DEF-003, DEF-004
- **P1** (8): DEF-005, DEF-006, DEF-007, DEF-008, DEF-009, DEF-010, DEF-011, DEF-012
- **P2** (6): DEF-013, DEF-014, DEF-015, DEF-016, DEF-017, DEF-018
- **P3** (3): DEF-019, DEF-020, DEF-021

### Appendix B: Story Template Quality Gates

See PROPOSAL GROUP C above for complete quality gates section to add to story template.

### Appendix C: Related Documentation

- **Retrospective**: `_bmad-output/implementation-artifacts/retrospectives/epic-25-28-final-retro-20260110.md`
- **Traceability**: `_bmad-output/traceability/epic-25-28-traceability.md`
- **Implementation Summary**: `_bmad-output/implementation-artifacts/epic-25-28-progress-summary.md`

---

**Document Status**: Draft  
**Next Review**: Upon Moe's approval decision  
**Implementation Start**: Immediately upon approval
