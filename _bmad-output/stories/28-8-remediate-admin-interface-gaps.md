# Story 28-8: Remediate Admin Interface Implementation Gaps

**Epic**: 28 - Admin Refunds & Audit Trail
**Priority**: P1 (High)
**Status**: Ready for Dev
**Estimate**: 3 Points

## 📝 Context

Validation of Phase 2a (Jan 12, 2026) identified significant verification gaps in the Admin Interface. While the UI components for Booking Search, Refund Processing, and Audit Logs exist, their implementation depth is unverified, and they completely lack automated test coverage. This story addresses the remediation of these interfaces and the addition of necessary tests to ensure operational reliability.

## ✅ Acceptance Criteria

### AC-28.8-1: Verified Booking Search Functionality (P1)

- **Given** an admin user on the Booking Search page
- **When** they search by Booking ID, Customer Email, or Date Range
- **Then** the results table updates with matching records from the database
- **And** pagination works correctly for large result sets
- **And** empty states are handled gracefully

### AC-28.8-2: Robust Refund UI Integration (P0)

- **Given** an admin selects a booking for refund
- **When** they submit the refund form (full or partial)
- **Then** the UI correctly calls the `process-refund` Edge Function
- **And** displays a success message upon completion
- **And** handles API errors (e.g., Stripe failure) with clear error messages
- **And** the booking status updates in the UI without a full page reload

### AC-28.8-3: Audit Log Display & Filtering (P2)

- **Given** an admin views the Audit Log
- **When** they filter by Entity Type (e.g., 'booking', 'refund') or User
- **Then** the log entries are filtered correctly
- **And** the immutable details of each log entry are viewable

### AC-28.8-4: Automated Regression Tests (P1)

- **Requirement**: Component or Integration tests must verify admin workflows.
- **Scope**:
  - Search query construction and result rendering.
  - Refund modal interaction and API mocking.
  - Audit log table rendering.

## 🛠️ Technical Tasks

- [x] **Audit & Fix `AdminBookingSearch.tsx`**: Ensure search filters are correctly applied to the Supabase query.
- [x] **Audit & Fix `RefundProcessing.tsx`**: Verify payload structure sent to `process-refund` matches Edge Function expectations.
- [x] **Implement Tests**: Create `src/components/admin/__tests__/AdminBookingSearch.test.tsx`.
- [x] **Implement Tests**: Create `src/components/admin/__tests__/RefundProcessing.test.tsx`.
- [x] **Implement Tests**: Create `src/components/admin/__tests__/AuditLogDisplay.test.tsx`.
- [x] **Manual QA**: Verify end-to-end refund flow with Stripe test mode.

## 🔗 References

- Validation Report: `_bmad-output/planning-artifacts/story-validation-framework-2026-01-12.md`
- Traceability Matrix: `_bmad-output/traceability/epic-25-28-traceability.md`
