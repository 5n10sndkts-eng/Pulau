# Defect DEF-002: getBookingById Not Implemented for Production

Status: done
Priority: P1 - High
Completed: 2026-01-13
Identified: 2026-01-13
Sprint: Remediation

## Defect Description

The `getBookingById` function in `bookingService.ts` returns `null` and logs a warning in production mode. This breaks booking detail pages and ticket display for non-mock users.

## Root Cause

During Phase 2a implementation, the function was left incomplete with a TODO comment for Supabase integration.

## Impact

- Users cannot view booking details after page refresh
- Ticket pages fail to load booking information
- Check-in validation affected

## Acceptance Criteria

### AC 1: Fetch Booking from Supabase

**Given** a valid booking ID or reference
**When** `getBookingById(bookingId)` is called in production mode
**Then** it queries the `bookings` table with proper joins
**And** returns enriched booking data with experience details

### AC 2: Handle Both ID and Reference

**Given** a booking identifier (UUID or reference like "PULAU-XXXXX")
**When** the function is called
**Then** it attempts lookup by ID first, then by reference
**And** normalizes the booking ID format

### AC 3: Error Handling

**Given** a non-existent booking ID
**When** the function is called
**Then** it returns `null` without throwing
**And** logs the lookup failure for debugging

---

## Tasks

### Task 1: Implement Supabase Query (AC: #1, #2)

- [ ] Add Supabase query joining bookings → trips → trip_items
- [ ] Include experience details via trip_items.experience_id
- [ ] Handle both UUID and reference lookups
- [ ] Use `normalizeBookingId` helper

### Task 2: Enrich Booking Data (AC: #1)

- [ ] Map database columns to Booking interface
- [ ] Include vendor/provider details
- [ ] Include meeting point information
- [ ] Transform dates to expected format

### Task 3: Error Handling (AC: #3)

- [ ] Handle Supabase errors gracefully
- [ ] Log failures with context
- [ ] Return null for not-found cases

### Task 4: Testing

- [ ] Add unit tests for production path
- [ ] Test UUID vs reference lookup
- [ ] Test error scenarios

---

## Dev Notes

### Current Implementation (Line 252-264)
```typescript
// In a real app, this would fetch from Supabase
// For now, in non-mock mode, we'll return null or throw an error
console.warn(
  `[bookingService] getBookingById not implemented for non-mock mode (ID: ${bookingId})`,
);
return null;
```

### Target Implementation
```typescript
// Production mode - fetch from Supabase
const normalizedId = normalizeBookingId(bookingId);

const { data, error } = await supabase
  .from('bookings')
  .select(`
    *,
    trips (
      *,
      trip_items (
        *,
        experiences (
          id, title, provider:vendors(*), meeting_point
        )
      )
    )
  `)
  .or(`id.eq.${normalizedId},reference.eq.${normalizedId}`)
  .single();

if (error || !data) return null;
return transformToBooking(data);
```

## Related

- Epic 11: Booking Management & History
- Story 11-2: Build Booking Detail View
- [TicketPage.tsx](../../src/components/booking/TicketPage.tsx)
