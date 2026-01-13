# Phase 2a Defect Backlog

Generated: 2026-01-10
Review Scope: Epics 25-28 (Stories 25.1-28.6)
Reviewer: Dev Agent (Adversarial Code Review)

---

## Summary

| Priority | Count | Description                          |
| -------- | ----- | ------------------------------------ |
| P0       | 4     | Build-breaking / Production blockers |
| P1       | 8     | Critical missing functionality       |
| P2       | 6     | Implementation gaps                  |
| P3       | 3     | Documentation / Process              |

**Total Defects: 21**

---

## P0 - Build Breaking (Fix Immediately)

### DEF-001: auditService.ts type error - wrong column name

**File:** `src/lib/auditService.ts:44`
**Error:** `TS2769: 'user_id' does not exist in type`
**Root Cause:** Schema uses `actor_id` and requires `actor_type`, code uses `user_id`
**Fix:**

```typescript
// Change from:
user_id: input.userId || session?.session?.user?.id,

// To:
actor_id: input.userId || session?.session?.user?.id,
actor_type: 'user', // or derive from context
```

**Story:** 28-5
**AC Impact:** Service module won't compile

---

### DEF-002: RealtimeSlotDisplay.tsx accessing wrong properties

**File:** `src/components/RealtimeSlotDisplay.tsx:108-113`
**Error:** `TS2339: Property 'error'/'data' does not exist on type array`
**Root Cause:** Query result destructuring incorrect - treating array as object
**Fix:** Properly destructure `{ data, error }` from useQuery result
**Story:** 25-5
**AC Impact:** Component won't compile

---

### DEF-003: slotService.ts RPC function doesn't exist

**File:** `src/lib/slotService.ts:388`
**Error:** `TS2345: 'decrement_slot_inventory' not assignable to type 'never'`
**Root Cause:** RPC function not defined in database or types not regenerated
**Fix:** Create migration for `decrement_slot_inventory` function OR update types
**Story:** 25-3
**AC Impact:** Atomic inventory decrement broken

---

### DEF-004: realtimeService.test.ts type error

**File:** `src/lib/realtimeService.test.ts:44`
**Error:** `TS2345: 'undefined' not assignable to parameter type`
**Root Cause:** Test mock returning undefined where status expected
**Fix:** Return valid status in mock: `'ok' | 'error' | 'timed out'`
**Story:** 25-2
**AC Impact:** Tests won't compile

---

## P1 - Critical Missing Functionality

### DEF-005: process-refund edge function is a stub

**File:** `supabase/functions/process-refund/index.ts`
**Issue:** No actual Stripe integration - just returns `{ success: true }`
**Missing:**

- Stripe SDK import and initialization
- `stripe.refunds.create()` call
- Payment record update
- Booking status update
- Audit log creation
- Idempotency key handling
  **Story:** 28-3
  **AC Impact:** Refunds don't actually process

---

### DEF-006: QRScanner has no actual QR decoding

**File:** `src/components/vendor/QRScanner.tsx:117-123`
**Issue:** `detectQRCode()` is empty placeholder
**Missing:**

- QR detection library (jsQR or html5-qrcode)
- Actual decode logic
- Booking ID extraction from QR data
  **Story:** 27-1
  **AC Impact:** Vendors cannot scan tickets

---

### DEF-007: VendorOperationsPage uses mock data

**File:** `src/components/vendor/VendorOperationsPage.tsx:29-49`
**Issue:** Hardcoded `mockTodayBookings` array instead of real queries
**Missing:**

- Supabase query for today's bookings
- TanStack Query integration
- Real-time updates
- Experience filter
  **Story:** 27-4
  **AC Impact:** Vendors see fake data, not real bookings

---

### DEF-008: Ticket validation RPC not implemented

**File:** N/A - Missing
**Issue:** `validate_booking_for_checkin` RPC function referenced but not created
**Missing:**

- Database function for validation
- Booking existence check
- Date validation
- Vendor ownership check
- Check-in status check
  **Story:** 27-2
  **AC Impact:** Ticket validation always fails

---

### DEF-009: Offline check-in queue not implemented

**File:** N/A - Missing `src/lib/offlineQueue.ts`
**Issue:** Story 27-3 requires offline check-in with sync
**Missing:**

- IndexedDB queue for pending check-ins
- Sync on network restoration
- Pending sync indicator
  **Story:** 27-3
  **AC Impact:** Offline check-in doesn't work

---

### DEF-010: Check-in doesn't persist to database

**File:** `src/components/vendor/VendorOperationsPage.tsx:70-76`
**Issue:** `handleCheckIn` only updates local state, no Supabase call
**Missing:**

- `bookingService.checkInBooking()` call
- Database update
- Audit log creation
  **Story:** 27-3
  **AC Impact:** Check-ins not recorded

---

### DEF-011: No-show marking doesn't persist

**File:** `src/components/vendor/VendorOperationsPage.tsx:78-84`
**Issue:** `handleNoShow` only updates local state
**Missing:**

- Database update
- Audit log creation
  **Story:** 27-4
  **AC Impact:** No-shows not recorded

---

### DEF-012: vendor-payout-status edge function missing implementation

**File:** `supabase/functions/vendor-payout-status/index.ts` (verify exists)
**Issue:** Need to verify actual Stripe Connect integration
**Missing:** (To verify)

- Stripe payouts.list call
- Balance retrieval
- Caching logic
  **Story:** 27-5
  **AC Impact:** Vendors can't see payout status

---

## P2 - Implementation Gaps

### DEF-013: SlotAvailabilityList component not created

**File:** N/A - Missing `src/components/SlotAvailabilityList.tsx`
**Issue:** Story 25-5 specifies creating this component
**Story:** 25-5
**AC Impact:** Real-time slot display incomplete

---

### DEF-014: PWAInstallPrompt missing install prompt handling

**File:** Verify `src/components/PWAInstallPrompt.tsx`
**Issue:** Need to verify `beforeinstallprompt` event handling
**Story:** 26-5
**AC Impact:** PWA installation may not prompt correctly

---

### DEF-015: Service worker not registered in main.tsx

**File:** `src/main.tsx`
**Issue:** Need to verify SW registration code exists
**Story:** 26-1
**AC Impact:** Offline caching won't work

---

### DEF-016: Network restoration sync not implemented

**File:** N/A - Missing `src/hooks/useNetworkSync.ts`
**Issue:** Story 26-4 requires auto-sync on network restore
**Missing:**

- Online event listener
- Booking refresh
- Sync indicator toast
  **Story:** 26-4
  **AC Impact:** Offline-to-online sync broken

---

### DEF-017: Admin booking search not implemented

**File:** Verify `src/components/admin/AdminDashboard.tsx`
**Issue:** Need to verify search functionality
**Missing:** (To verify)

- Search by booking ID
- Search by email
- Search by vendor
- Date range filter
- Pagination
  **Story:** 28-1
  **AC Impact:** Admins can't find bookings

---

### DEF-018: Refund processing UI not implemented

**File:** Verify `src/components/admin/RefundModal.tsx`
**Issue:** Need to verify refund UI exists
**Story:** 28-2
**AC Impact:** Admins can't process refunds

---

## P3 - Documentation / Process

### DEF-019: 20 stories missing task checkmarks

**Files:** All story files except 25-4
**Issue:** Stories marked `done` but tasks show `[ ]` not `[x]`
**Stories Affected:** 25-1, 25-2, 25-3, 25-5, 26-1 through 26-5, 27-1 through 27-5, 28-1 through 28-6

---

### DEF-020: 20 stories missing Dev Agent Records

**Files:** All story files except 25-4
**Issue:** Dev Agent Record sections blank
**Required Fields:**

- Agent Model Used
- Debug Log References
- Completion Notes List
- File List

---

### DEF-021: Audit retention policy doc not created

**File:** N/A - Missing `docs/compliance/audit-log-retention-policy.md`
**Issue:** Story 28-6 requires compliance documentation
**Story:** 28-6
**AC Impact:** Compliance requirement not met

---

## Recommended Fix Order

1. **DEF-001 through DEF-004** - Get build passing
2. **DEF-005, DEF-006** - Critical stub implementations
3. **DEF-007 through DEF-011** - Vendor operations flow
4. **DEF-013 through DEF-018** - Remaining features
5. **DEF-019 through DEF-021** - Documentation cleanup

---

## Notes

- Some P1/P2 defects may be partially implemented - requires deeper file inspection
- Edge function implementations need Supabase local testing to verify
- Tests need to be run after type errors fixed to find runtime issues
