# Story 21.5: Implement RLS Policies for New Tables

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **platform operator**,
I want all Phase 2 database tables to have proper RLS policies,
So that data access is secure and follows the principle of least privilege.

## Acceptance Criteria

1. **Given** the `experience_slots` table exists
   **When** RLS is enabled
   **Then** policies allow:
   - Public SELECT (travelers can view availability)
   - Vendor INSERT/UPDATE/DELETE (owners manage their slots)

2. **Given** the `payments` table exists
   **When** RLS is enabled
   **Then** policies allow:
   - User SELECT for their own bookings
   - Vendor SELECT for their received payments
   - NO INSERT/UPDATE/DELETE (service role only)

3. **Given** the `audit_logs` table exists
   **When** RLS is enabled
   **Then** policies allow:
   - INSERT for authenticated users (Edge Functions logging)
   - NO SELECT/UPDATE/DELETE (service role only for reads, immutable)

4. **Given** the `vendors` table has new Stripe columns
   **When** existing RLS policies are checked
   **Then** new columns inherit existing table-level policies

5. **Given** all Phase 2 tables
   **When** a security audit is performed
   **Then** all tables have RLS enabled and appropriate policies active

## Tasks / Subtasks

- [x] Task 1: Verify experience_slots RLS policies (AC: #1)
  - [x] 1.1: Confirmed `experience_slots_select_public` policy exists (SELECT using true)
  - [x] 1.2: Confirmed `experience_slots_insert_vendor_owner` policy exists
  - [x] 1.3: Confirmed `experience_slots_update_vendor_owner` policy exists
  - [x] 1.4: Confirmed `experience_slots_delete_vendor_owner` policy exists

- [x] Task 2: Verify payments RLS policies (AC: #2)
  - [x] 2.1: Confirmed `payments_select_user_own_bookings` policy exists
  - [x] 2.2: Confirmed `payments_select_vendor_experiences` policy exists
  - [x] 2.3: Confirmed NO INSERT/UPDATE/DELETE policies (service role only)

- [x] Task 3: Verify audit_logs RLS policies (AC: #3)
  - [x] 3.1: Confirmed `audit_logs_insert_authenticated` policy exists
  - [x] 3.2: Confirmed NO SELECT/UPDATE/DELETE policies (service role only for reads)
  - [x] 3.3: Confirmed immutability triggers block UPDATE/DELETE at database level

- [x] Task 4: Verify vendors table column inheritance (AC: #4)
  - [x] 4.1: Confirmed new Stripe columns inherit existing vendors RLS policies
  - [x] 4.2: No additional policies needed for new columns

- [x] Task 5: Security audit summary (AC: #5)
  - [x] 5.1: All 4 Phase 2 tables have RLS enabled
  - [x] 5.2: Total of 7 RLS policies across Phase 2 tables
  - [x] 5.3: No security gaps identified

## Dev Notes

### RLS Policy Summary

| Table | Policy Name | Command | Access Pattern |
|-------|-------------|---------|----------------|
| experience_slots | experience_slots_select_public | SELECT | Public (true) |
| experience_slots | experience_slots_insert_vendor_owner | INSERT | Vendor owner only |
| experience_slots | experience_slots_update_vendor_owner | UPDATE | Vendor owner only |
| experience_slots | experience_slots_delete_vendor_owner | DELETE | Vendor owner only |
| payments | payments_select_user_own_bookings | SELECT | User's own bookings |
| payments | payments_select_vendor_experiences | SELECT | Vendor's received payments |
| audit_logs | audit_logs_insert_authenticated | INSERT | Any authenticated user |

### Security Model

**experience_slots:**
- Public read access for travelers viewing availability
- Vendor write access restricted to their own experiences via join chain: `experience_slots → experiences → vendors → owner_id`

**payments:**
- User read access via join chain: `payments → bookings → trips → user_id`
- Vendor read access via join chain: `payments → bookings → trips → trip_items → experiences → vendors → owner_id`
- Write operations (INSERT/UPDATE/DELETE) restricted to service role only
- Ensures only Edge Functions can create/modify payment records

**audit_logs:**
- Insert-only for authenticated users (used by Edge Functions for logging)
- No read access for authenticated users (service role only)
- Immutability enforced at both RLS and trigger level
- DELETE blocked by `audit_logs_no_delete` trigger
- UPDATE blocked by `audit_logs_no_update` trigger

**vendors (new columns):**
- `stripe_account_id`, `stripe_onboarding_complete`, `instant_book_enabled`, `last_activity_at`
- All inherit existing vendors table RLS policies
- No additional column-level policies required

### Architecture Compliance

All RLS policies match the Phase 2 Architecture Document specifications:
- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#RLS Policies for New Tables]

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#RLS Policies for New Tables]
- Story 21.1: experience_slots policies implemented
- Story 21.2: payments policies implemented
- Story 21.3: audit_logs policies implemented
- Story 21.4: vendors columns inherit existing policies

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Verification query executed via Supabase MCP `execute_sql` tool
- All policies confirmed active via `pg_policies` system catalog

### Completion Notes List

1. **Already Implemented**: All RLS policies were created in Stories 21.1, 21.2, 21.3
2. **Verification Focus**: This story confirms all policies are active and correct
3. **No New Migrations**: No additional database changes required
4. **Security Audit**: All Phase 2 tables pass security requirements

### Verification Results

**Query: `pg_policies` for Phase 2 tables**
- experience_slots: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- payments: 2 policies (SELECT user, SELECT vendor)
- audit_logs: 1 policy (INSERT authenticated)
- Total: 7 RLS policies

### File List

- No new files created (verification-only story)

### Code Review Record

**Reviewed by:** Claude Opus 4.5 (code-review workflow)
**Review Date:** 2026-01-09
**Issues Found:** 0 High, 0 Medium, 0 Low
**Issues Fixed:** 0
**Issues Deferred:** 0

**Acceptance Criteria Verification:**

| AC# | Description | Status |
|-----|-------------|--------|
| 1 | experience_slots has correct RLS policies | ✅ PASS |
| 2 | payments has correct RLS policies | ✅ PASS |
| 3 | audit_logs has correct RLS policies | ✅ PASS |
| 4 | vendors new columns inherit policies | ✅ PASS |
| 5 | Security audit passes | ✅ PASS |

**Review Notes:**
- All 5 Acceptance Criteria verified as PASS
- All RLS policies match architecture specifications
- No security gaps identified
- Epic 21 complete
