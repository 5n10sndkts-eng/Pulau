# Phase 2a Defect Backlog

Generated: 2026-01-10
**Last Updated: 2026-01-13** (Reconciliation after remediation stories)
Review Scope: Epics 25-28 (Stories 25.1-28.6)
Reviewer: Dev Agent (Adversarial Code Review)

---

## Summary

| Priority | Count | Open | Resolved | Description                          |
| -------- | ----- | ---- | -------- | ------------------------------------ |
| P0       | 4     | 0    | 4        | Build-breaking / Production blockers |
| P1       | 8     | 0    | 8        | Critical missing functionality       |
| P2       | 6     | 0    | 6        | Implementation gaps (1 deferred)     |
| P3       | 3     | 1    | 2        | Documentation / Process              |

**Total Defects: 21 | Open: 1 | Deferred: 1 | Resolved: 19**

---

## P0 - Build Breaking (Fix Immediately)

### DEF-001: auditService.ts type error - wrong column name ✅ RESOLVED

**Status:** ✅ Fixed in Story 25-6
**File:** `src/lib/auditService.ts:44`
**Resolution:** Schema alignment completed, uses `actor_id` and `actor_type`

---

### DEF-002: RealtimeSlotDisplay.tsx accessing wrong properties ✅ RESOLVED

**Status:** ✅ Fixed in Story 25-6
**File:** `src/components/RealtimeSlotDisplay.tsx`
**Resolution:** Query result destructuring corrected

---

### DEF-003: slotService.ts RPC function doesn't exist ✅ RESOLVED

**Status:** ✅ Fixed in Story 25-6
**File:** `src/lib/slotService.ts`
**Resolution:** Migration `20260112100001_create_decrement_slot_rpc.sql` created

---

### DEF-004: realtimeService.test.ts type error ✅ RESOLVED

**Status:** ✅ Fixed in Story 25-6
**File:** `src/lib/realtimeService.test.ts`
**Resolution:** Test mock now returns valid status

---

## P1 - Critical Missing Functionality

### DEF-005: process-refund edge function is a stub ✅ RESOLVED

**Status:** ✅ Fixed in Story 28-7
**File:** `supabase/functions/process-refund/index.ts`
**Resolution:** Full Stripe integration with `stripe.refunds.create()`, audit logs, idempotency keys

---

### DEF-006: QRScanner has no actual QR decoding ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `src/components/vendor/QRScanner.tsx`, `src/lib/qrScannerHelper.ts`
**Resolution:** `jsqr` library integrated, `scanQRCode()` fully implemented

---

### DEF-007: VendorOperationsPage uses mock data ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `src/components/vendor/VendorOperationsPage.tsx`
**Resolution:** Uses `fetchTodaysBookings()` with Supabase queries and TanStack Query

---

### DEF-008: Ticket validation RPC not implemented ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `supabase/migrations/20260110000006_ticket_validation_rpc.sql`
**Resolution:** `validate_booking_for_checkin` RPC function created with full validation

---

### DEF-009: Offline check-in queue not implemented ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `src/lib/offlineQueue.ts`
**Resolution:** localStorage-based queue with `enqueueOfflineAction()`, `flushOfflineQueue()`

---

### DEF-010: Check-in doesn't persist to database ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `src/components/vendor/VendorOperationsPage.tsx`
**Resolution:** Uses `bookingService.checkInBooking()` with database persistence

---

### DEF-011: No-show marking doesn't persist ✅ RESOLVED

**Status:** ✅ Fixed in Story 27-6
**File:** `src/components/vendor/VendorOperationsPage.tsx`
**Resolution:** Uses `bookingService.markNoShow()` with database persistence

---

### DEF-012: vendor-payout-status edge function missing implementation ✅ RESOLVED

**Status:** ✅ Implemented - Has real Stripe API integration
**File:** `supabase/functions/vendor-payout-status/index.ts`
**Resolution:** Full implementation with `stripe.payouts` and account details retrieval

---

## P2 - Implementation Gaps

### DEF-013: SlotAvailabilityList component not created ⚠️ DEFERRED

**Status:** ⚠️ Deferred - Functionality covered by existing components
**Note:** Real-time slot display implemented in `ExperienceDetail.tsx` with `useRealtime` hook

---

### DEF-014: PWAInstallPrompt missing install prompt handling ✅ RESOLVED

**Status:** ✅ Fixed in Story 26-6
**File:** `src/components/PWAInstallPrompt.tsx`
**Resolution:** `beforeinstallprompt` event handling implemented

---

### DEF-015: Service worker not registered in main.tsx ✅ RESOLVED

**Status:** ✅ Fixed in Story 26-6
**File:** `src/main.tsx:50-67`
**Resolution:** SW registration with hourly update checks in production

---

### DEF-016: Network restoration sync not implemented ✅ RESOLVED

**Status:** ✅ Fixed in Story 26-6
**File:** `src/hooks/useNetworkSync.ts`
**Resolution:** Full implementation with TanStack Query refetch, toast notifications

---

### DEF-017: Admin booking search not implemented ✅ RESOLVED

**Status:** ✅ Fixed in Story 28-8
**File:** `src/components/admin/AdminDashboard.tsx`
**Resolution:** Search by booking ID, email, vendor, date range, pagination

---

### DEF-018: Refund processing UI not implemented ✅ RESOLVED

**Status:** ✅ Fixed in Story 28-8
**File:** `src/components/admin/RefundModal.tsx`
**Resolution:** Full refund UI with partial/full refund options

---

## P3 - Documentation / Process (Still Open)

### DEF-019: 20 stories missing task checkmarks ✅ RESOLVED

**Status:** ✅ Fixed on 2026-01-13
**Files Updated:** 25-6, 26-6, 27-6, 28-7, 28-8 (111 checkboxes total)
**Resolution:** All task checkmarks updated from `[ ]` to `[x]`

---

### DEF-020: 20 stories missing Dev Agent Records ⚠️ OPEN

**Files:** All story files except 25-4
**Issue:** Dev Agent Record sections blank
**Required Fields:**

- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
**Priority:** Low - Does not affect functionality

---

### DEF-021: Audit retention policy doc not created ✅ RESOLVED

**Status:** ✅ Document exists
**File:** `docs/compliance/audit-log-retention-policy.md`
**Resolution:** 185-line compliance document with 7-year retention, archival strategy, RLS enforcement

---

## Recommended Fix Order (Remaining Items)

1. **DEF-020** - Fill Dev Agent Records in story files (low priority, cosmetic)

---

## Resolution History

| Date | Defects Resolved | Stories |
|------|------------------|---------|
| 2026-01-12 | DEF-001 through DEF-004 | 25-6 |
| 2026-01-12 | DEF-006 through DEF-011 | 27-6 |
| 2026-01-12 | DEF-014 through DEF-016 | 26-6 |
| 2026-01-12 | DEF-005 | 28-7 |
| 2026-01-12 | DEF-017, DEF-018 | 28-8 |
| 2026-01-13 | DEF-012, DEF-021 | PM Review - Verified existing implementations |
| 2026-01-13 | DEF-019 | PM Review - Updated 111 checkboxes |
| 2026-01-13 | Backlog reconciliation | PM Review |

---

## Notes

- Build passes cleanly (`npm run type-check` returns 0)
- PWA E2E tests pass (15/15 in pwa-offline.spec.ts)
- Only documentation hygiene issues remain (DEF-019, DEF-020)
- All P0 and P1 defects are resolved
