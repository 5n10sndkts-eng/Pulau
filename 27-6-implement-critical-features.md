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
```

## Definition of Done

- [ ] All task checkboxes marked [x]
- [ ] QR scanning functional with real decode
- [ ] Today's bookings load from database
- [ ] Check-in/no-show persist with audit trail
- [ ] E2E test passing
- [ ] Dev Agent Record completed

---

**Related Defects**: DEF-006, DEF-007, DEF-008, DEF-009, DEF-010, DEF-011  
**Blocked By**: Story 25-6 (type errors must be fixed first)  
**Blocks**: Epic 27 completion, vendor production readiness
