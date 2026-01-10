# Story 27.3: Record Check-In Status

Status: ready-for-dev

## Story

As a **vendor**,
I want to mark travelers as checked in,
So that I have a record of attendance.

## Acceptance Criteria

1. **Given** I have validated a ticket
   **When** I tap "Check In" button
   **Then** the booking status updates to "checked_in"
   **And** check-in timestamp is recorded
   **And** an audit log entry is created
   **And** I cannot check in the same booking twice
   **And** check-in works offline (syncs when online)

## Tasks / Subtasks

- [ ] Add check-in button to validation UI (AC: 1)
  - [ ] Show "Check In" button on valid ticket card
  - [ ] Disable button if already checked in
  - [ ] Show loading state during check-in
  - [ ] Show success confirmation after check-in
- [ ] Implement check-in service function (AC: 1)
  - [ ] Add `checkInBooking` to bookingService.ts
  - [ ] Update booking.check_in_status to 'checked_in'
  - [ ] Record check_in_at timestamp (current time)
  - [ ] Record check_in_by vendor ID
  - [ ] Create audit log entry via auditService
  - [ ] Return updated booking data
- [ ] Prevent duplicate check-ins (AC: 1)
  - [ ] Check current check_in_status before updating
  - [ ] Return error if already checked in
  - [ ] Show "Already Checked In" message to vendor
  - [ ] Display original check-in time
- [ ] Add offline support (AC: 1)
  - [ ] Queue check-in action if offline
  - [ ] Store in IndexedDB pending queue
  - [ ] Sync to server when network restored
  - [ ] Show "Pending Sync" indicator for offline check-ins
  - [ ] Retry failed syncs (max 3 attempts)

## Dev Notes

### Architecture Patterns

**Check-In Flow:**
1. Vendor clicks "Check In" button
2. Call checkInBooking API with booking ID
3. Server updates bookings table:
   - check_in_status = 'checked_in'
   - check_in_at = NOW()
   - check_in_by = current_vendor_id
4. Create audit log entry
5. Return success with updated booking
6. Show success toast to vendor

**Offline Queue:**
- Use IndexedDB to store pending check-ins when offline
- Structure: `{ bookingId, timestamp, vendorId, synced: false }`
- Background sync attempts when network restored
- Remove from queue after successful sync

**Database Schema:**
- Table: `bookings`
- Columns:
  - `check_in_status` ENUM ('pending', 'checked_in', 'no_show')
  - `check_in_at` TIMESTAMPTZ (nullable)
  - `check_in_by` UUID (foreign key to vendors, nullable)

### Code Quality Requirements

**TypeScript Patterns:**
- Define CheckInResult type:
  ```typescript
  type CheckInResult = 
    | { success: true; booking: Booking }
    | { success: false; error: CheckInError }

  type CheckInError = 
    | 'already_checked_in'
    | 'booking_not_found'
    | 'invalid_status'
    | 'network_error'
  ```
- Use ApiResponse pattern for service function
- Handle offline state with useOnlineStatus hook

**Error Handling:**
- Already checked in → Show existing check-in time, don't allow re-check-in
- Booking cancelled → Cannot check in cancelled bookings
- Network error → Queue for offline sync
- Optimistic update → Show immediate success, rollback on error

**Audit Trail:**
- Create audit log entry via auditService (Story 28.5)
- Event type: 'booking_checked_in'
- Metadata: vendor_id, timestamp, booking_id
- Immutable record for compliance

### File Structure

**Files to Modify:**
- `src/lib/bookingService.ts` - Add checkInBooking function
- `src/components/vendor/ValidationResult.tsx` - Add check-in button
- `src/lib/offlineQueue.ts` - Create offline queue manager (new file)

**Files to Reference:**
- `src/lib/auditService.ts` - Create audit log entries (Story 28.5)
- `src/hooks/useOnlineStatus.ts` - Detect offline state

**Service Function:**
```typescript
export async function checkInBooking(
  bookingId: string,
  vendorId: string
): Promise<ApiResponse<Booking>> {
  // Check if already checked in
  const { data: booking } = await supabase
    .from('bookings')
    .select('check_in_status, check_in_at')
    .eq('id', bookingId)
    .single()

  if (booking?.check_in_status === 'checked_in') {
    return {
      data: null,
      error: `Already checked in at ${formatTime(booking.check_in_at)}`
    }
  }

  // Update check-in status
  const { data, error } = await supabase
    .from('bookings')
    .update({
      check_in_status: 'checked_in',
      check_in_at: new Date().toISOString(),
      check_in_by: vendorId
    })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  // Create audit log
  await createAuditEntry({
    eventType: 'booking_checked_in',
    entityType: 'booking',
    entityId: bookingId,
    actorId: vendorId,
    metadata: { check_in_at: data.check_in_at }
  })

  return { data, error: null }
}
```

### Testing Requirements

**Manual Testing:**
- Validate ticket (Story 27.2)
- Click "Check In" button
- Verify success toast appears
- Verify button changes to "Already Checked In" (disabled)
- Scan same booking again
- Verify shows "Already Checked In at [time]"
- Check database: check_in_status = 'checked_in', timestamp set

**Offline Testing:**
- Go offline (airplane mode)
- Validate ticket
- Click "Check In"
- Verify "Pending Sync" indicator appears
- Go online
- Verify sync completes within 10 seconds
- Verify check-in recorded in database

**Edge Cases:**
- Network timeout during check-in (retry logic)
- Multiple vendors checking in different bookings (concurrent writes)
- Vendor closes app before sync completes (persist queue)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 27: Vendor Check-In & Operations
- Implements FR-OPS-02: Check-in functionality
- Works with Epic 21 (bookings table schema)
- Uses auditService from Epic 28 for compliance

**Integration Points:**
- Called after successful validation from Story 27.2
- Creates audit log via Story 28.5 (auditService)
- Displays on operations dashboard from Story 27.4
- Syncs offline with Story 26.4 (network restoration pattern)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-27-Story-27.3]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-OPS-02]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Audit-Trail]
- [Source: project-context.md#Service-Layer-Pattern]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
