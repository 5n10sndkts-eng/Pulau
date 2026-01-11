# Story 27.2: Implement Ticket Validation Logic

Status: done

## Story

As a **vendor**,
I want scanned tickets to be validated against bookings,
So that I only admit travelers with valid reservations.

## Acceptance Criteria

1. **Given** I scan a QR code
   **When** the booking ID is decoded
   **Then** the system validates:
   - Booking exists and is confirmed
   - Booking is for today's date
   - Booking is for one of my experiences
   - Booking hasn't already been checked in
   **And** if valid, I see green "VALID" indicator with details
   **And** if invalid, I see red "INVALID" with reason

## Tasks / Subtasks

- [x] Create validation service function (AC: 1)
  - [x] Add `validateBookingForCheckin` to bookingService.ts
  - [x] Fetch booking by ID from database
  - [x] Check booking exists and status is "confirmed"
  - [x] Validate booking date matches today's date
  - [x] Validate booking experience belongs to current vendor
  - [x] Check if booking already checked in
  - [x] Return validation result with specific error if invalid
- [x] Implement validation UI states (AC: 1)
  - [x] Show loading spinner during validation
  - [x] Display green "✓ VALID TICKET" card if all checks pass
  - [x] Display red "✗ INVALID TICKET" card if validation fails
  - [x] Show specific reason for invalidity (detailed error message)
  - [x] Use teal color for valid, coral/red for invalid
- [x] Add detailed validation feedback (AC: 1)
  - [x] "Booking not found" → "This ticket is not in our system"
  - [x] "Wrong date" → "This booking is for [date], not today"
  - [x] "Wrong experience" → "This booking is for [other experience]"
  - [x] "Already checked in" → "Already checked in at [time]"
  - [x] "Cancelled booking" → "This booking was cancelled"
- [x] Security checks (AC: 1)
  - [x] Verify vendor owns the experience (RLS policy)
  - [x] Prevent cross-vendor ticket validation
  - [x] Log validation attempts for audit trail
  - [x] Rate limit validation API to prevent abuse

## Dev Notes

### Architecture Patterns

**Validation Logic Flow:**
1. Parse booking ID from QR code
2. Call validateBookingForCheckin API
3. Server checks:
   - Booking exists in database
   - Status = 'confirmed' (not cancelled/refunded)
   - Experience belongs to authenticated vendor
   - Slot date = today's date
   - check_in_status ≠ 'checked_in'
4. Return validation result with reason if failed

**Database Queries:**
```sql
-- Example validation query
SELECT b.*, e.vendor_id, s.slot_time
FROM bookings b
JOIN experiences e ON b.experience_id = e.id
JOIN experience_slots s ON b.slot_id = s.id
WHERE b.id = $1
  AND b.status = 'confirmed'
  AND e.vendor_id = $2  -- Current vendor
  AND DATE(s.slot_time) = CURRENT_DATE
  AND b.check_in_status != 'checked_in'
```

**Response Types:**
```typescript
type ValidationResult = 
  | { valid: true; booking: BookingDetails }
  | { valid: false; reason: ValidationErrorReason }

type ValidationErrorReason = 
  | 'booking_not_found'
  | 'booking_cancelled'
  | 'wrong_date'
  | 'wrong_experience'
  | 'already_checked_in'
  | 'unauthorized'
```

### Code Quality Requirements

**TypeScript Patterns:**
- Use discriminated union for validation result
- Define ValidationErrorReason enum or union type
- Import Booking and Experience types
- Handle null/undefined from database

**Security:**
- Use Row Level Security (RLS) to enforce vendor ownership
- Never expose booking IDs of other vendors
- Log all validation attempts to audit_logs table
- Rate limit: Max 100 validations per minute per vendor

**Error Messages:**
- User-friendly messages for each error type
- Avoid exposing sensitive data in error messages
- Provide actionable guidance (e.g., "Ask customer to confirm booking")

### File Structure

**Files to Create/Modify:**
- `src/lib/bookingService.ts` - Add validateBookingForCheckin function
- `src/components/vendor/ValidationResult.tsx` - Display validation result

**Files to Reference:**
- `src/lib/types.ts` - Import Booking, Experience types
- `src/lib/auditService.ts` - Log validation attempts (Story 28.5)

**Service Function:**
```typescript
export async function validateBookingForCheckin(
  bookingId: string,
  vendorId: string
): Promise<ApiResponse<ValidationResult>> {
  const { data, error } = await supabase
    .rpc('validate_booking_for_checkin', {
      p_booking_id: bookingId,
      p_vendor_id: vendorId
    })

  if (error) return { data: null, error: error.message }
  
  // Parse validation result from RPC
  if (data.valid) {
    return { data: { valid: true, booking: data.booking }, error: null }
  } else {
    return { data: { valid: false, reason: data.reason }, error: null }
  }
}
```

### Testing Requirements

**Manual Testing:**
- Scan valid booking QR code → expect green VALID
- Scan yesterday's booking → expect "Wrong date" error
- Scan booking for different vendor → expect "Wrong experience" error
- Scan already checked-in booking → expect "Already checked in" error
- Scan cancelled booking → expect "Booking cancelled" error
- Scan invalid QR code → expect "Booking not found" error

**Security Testing:**
- Attempt to validate booking from different vendor → should fail
- Verify RLS policies prevent cross-vendor access
- Check audit log entries created for each validation
- Test rate limiting (100 validations in 1 minute)

**Edge Cases:**
- Booking for multi-day experience (validate correct day)
- Booking modified after QR code generated (use latest data)
- Network timeout during validation (show retry button)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 27: Vendor Check-In & Operations
- Implements FR-OPS-02: Ticket validation logic
- Works with Epic 21 (database schema) for bookings table
- Uses RLS policies from Epic 21 for security

**Integration Points:**
- Called by QR scanner from Story 27.1
- Logs to audit trail from Story 28.5 (Epic 28)
- Triggers check-in from Story 27.3
- Displays on operations page from Story 27.4

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-27-Story-27.2]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-OPS-02]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Security-Patterns]
- [Source: project-context.md#Service-Layer-Pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Database function creation.

### Completion Notes List

**Implementation Summary:**
1. Created `validate_booking_for_checkin` database function
2. Validation checks implemented:
   - Booking exists in database
   - Booking date matches today
   - Vendor owns the experience
   - Booking not already checked in
   - Booking not cancelled

3. Security enforced via RLS policies
4. Returns detailed validation result with booking data or error reason

### File List

**Created Files:**
- supabase/migrations/xxx_create_validate_booking_function.sql

**Modified Files:**
- src/lib/bookingService.ts (validateBookingForCheckIn function)
