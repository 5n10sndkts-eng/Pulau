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

- [x] Vendors can scan QR codes on tickets and extract booking IDs
- [x] Today's bookings load from actual database (not mock data)
- [x] Check-ins persist to database with audit trail
- [x] No-shows persist to database with audit trail
- [x] Validation prevents duplicate check-ins
- [x] Real-time updates reflect check-in status changes
- [x] E2E test covers full check-in flow

## Tasks

### QR Scanner Implementation

- [x] **DEF-006**: Install QR decode library: `npm install jsqr`
- [x] Implement `detectQRCode()` in `src/components/vendor/QRScanner.tsx`
- [x] Extract booking ID from QR code data format
- [x] Add error handling for invalid QR codes
- [x] Test with actual QR code generated from booking confirmation

### Real Data Loading

- [x] **DEF-007**: Replace mock data in `VendorOperationsPage.tsx:29-49`
- [x] Create Supabase query for today's bookings filtered by vendor
- [x] Integrate TanStack Query for data fetching
- [x] Add real-time subscription for booking updates
- [x] Implement experience filter dropdown

### Ticket Validation RPC

- [x] **DEF-008**: Create `validate_booking_for_checkin` RPC function
- [x] Write migration in `supabase/migrations/`
- [x] Implement validation checks:
  - Booking exists
  - Booking date matches today
  - Vendor owns the experience
  - Booking status is 'confirmed'
  - Not already checked in
- [x] Regenerate types: `npm run db:types`

### Check-In Persistence

- [x] **DEF-010**: Implement `bookingService.checkInBooking(bookingId)`
- [x] Update booking status to 'checked-in'
- [x] Record check-in timestamp
- [x] Create audit log entry
- [x] Update local state after successful persistence
- [x] Handle errors gracefully

### No-Show Persistence

- [x] **DEF-011**: Implement `bookingService.markNoShow(bookingId)`
- [x] Update booking status to 'no-show'
- [x] Record timestamp
- [x] Create audit log entry
- [x] Update local state after successful persistence

### Offline Queue (Optional - DEF-009)

- [x] Create `src/lib/offlineQueue.ts` with IndexedDB
- [x] Queue check-ins when offline
- [x] Sync queued actions on network restoration
- [x] Show pending sync indicator

### Testing

- [x] Create E2E test: `tests/e2e/vendor-check-in.spec.ts`
- [x] Test QR scan → validation → check-in flow
- [x] Test no-show marking
- [x] Test error cases (invalid QR, already checked in)

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
```

## Definition of Done

- [x] All task checkboxes marked [x]
- [x] QR scanning functional with real decode
- [x] Today's bookings load from database
- [x] Check-in/no-show persist with audit trail
- [x] E2E test passing
- [x] Dev Agent Record completed

---

**Related Defects**: DEF-006, DEF-007, DEF-008, DEF-009, DEF-010, DEF-011  
**Blocked By**: Story 25-6 (type errors must be fixed first)  
**Blocks**: Epic 27 completion, vendor production readiness
