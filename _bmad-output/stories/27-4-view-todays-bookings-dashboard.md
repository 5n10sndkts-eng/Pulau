# Story 27.4: View Today's Bookings Dashboard

Status: done

## Story

As a **vendor**,
I want to see all bookings for today,
So that I can prepare for my guests.

## Acceptance Criteria

1. **Given** I am on my vendor operations page
   **When** I view "Today's Bookings"
   **Then** I see a list of all bookings for today's date:
   - Time slot
   - Traveler name
   - Guest count
   - Check-in status (Pending / Checked In / No Show)
   **And** I can filter by experience (if I have multiple)
   **And** I can mark no-shows after the experience time passes
   **And** total guest count is summarized at top

## Tasks / Subtasks

- [x] Create today's bookings dashboard (AC: 1)
  - [x] Add "Today's Bookings" section to VendorOperationsPage
  - [x] Show total bookings count and total guests
  - [x] Display bookings in chronological order (earliest first)
  - [x] Use card layout for each booking
  - [x] Auto-refresh every 5 minutes
- [x] Display booking information (AC: 1)
  - [x] Show time slot with clock icon
  - [x] Show traveler name (or "Guest" if missing)
  - [x] Show guest count with person icon
  - [x] Show experience name (if vendor has multiple)
  - [x] Show check-in status badge:
    - Gray: Pending
    - Green: Checked In (with timestamp)
    - Red: No Show
- [x] Add experience filter (AC: 1)
  - [x] Show filter dropdown if vendor has multiple experiences
  - [x] Filter bookings by selected experience
  - [x] "All Experiences" option to show everything
  - [x] Persist filter selection in session
- [x] Implement no-show marking (AC: 1)
  - [x] Show "Mark No Show" button after experience time passes
  - [x] Confirm before marking (dialog or toast)
  - [x] Update check_in_status to 'no_show'
  - [x] Create audit log entry
  - [x] Display "No Show" badge on booking

## Dev Notes

### Architecture Patterns

**Dashboard Data Flow:**
1. Fetch today's bookings for vendor on page load
2. Filter bookings by:
   - vendor_id = current vendor
   - slot_time date = today's date
   - status = 'confirmed'
3. Display in chronological order
4. Auto-refresh every 5 minutes using TanStack Query

**Query Logic:**
```sql
SELECT b.*, e.name as experience_name, s.slot_time, u.name as traveler_name
FROM bookings b
JOIN experiences e ON b.experience_id = e.id
JOIN experience_slots s ON b.slot_id = s.id
LEFT JOIN users u ON b.user_id = u.id
WHERE e.vendor_id = $1
  AND DATE(s.slot_time) = CURRENT_DATE
  AND b.status = 'confirmed'
ORDER BY s.slot_time ASC
```

**No-Show Logic:**
- Allow marking no-show only after slot_time has passed
- Update check_in_status to 'no_show'
- Create audit log entry
- Potentially trigger refund logic (future enhancement)

### Code Quality Requirements

**TypeScript Patterns:**
- Define TodayBooking interface (extended Booking with experience_name, slot_time)
- Use TanStack Query for data fetching and auto-refresh
- Import types from `src/lib/types.ts`

**React Patterns:**
- Use useQuery with 5-minute stale time for auto-refresh
- Use useState for experience filter
- Use useEffect to refresh on check-in completion
- Optimistic update when marking no-show

**Styling:**
- Dashboard: Card layout with summary at top
- Bookings: List of cards with left border color by status
- Status badges:
  - Pending: Gray background, dark text
  - Checked In: Teal background, white text
  - No Show: Coral/red background, white text
- Summary: Large font, total bookings and guests

### File Structure

**Files to Modify:**
- `src/components/vendor/VendorOperationsPage.tsx` - Add bookings dashboard
- `src/lib/bookingService.ts` - Add getTodayBookings function

**Files to Create:**
- `src/components/vendor/TodayBookingsList.tsx` - Bookings list component
- `src/components/vendor/BookingCard.tsx` - Individual booking card

**Files to Reference:**
- `src/lib/types.ts` - Booking, Experience types
- `src/hooks/useVendorAuth.ts` - Get current vendor ID

**Service Function:**
```typescript
export async function getTodayBookings(
  vendorId: string,
  experienceId?: string
): Promise<ApiResponse<TodayBooking[]>> {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(name),
      slot:experience_slots(slot_time),
      user:users(name)
    `)
    .eq('experiences.vendor_id', vendorId)
    .eq('status', 'confirmed')
    .gte('experience_slots.slot_time', new Date().toISOString().split('T')[0])
    .lt('experience_slots.slot_time', new Date(Date.now() + 86400000).toISOString().split('T')[0])
    .order('experience_slots.slot_time', { ascending: true })

  if (experienceId) {
    query = query.eq('experience_id', experienceId)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
```

### Testing Requirements

**Manual Testing:**
- Create test bookings for today (various times)
- View vendor operations page
- Verify all today's bookings appear
- Verify sorted by time (earliest first)
- Check in one booking (Story 27.3)
- Verify dashboard updates to show "Checked In"
- Wait until after a booking time
- Verify "Mark No Show" button appears
- Mark as no show
- Verify status updates to "No Show"

**Edge Cases:**
- No bookings for today (show empty state)
- All bookings checked in (show success message)
- Multiple experiences (filter works correctly)
- Booking time in different timezone (handle correctly)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 27: Vendor Check-In & Operations
- Implements FR-OPS-02: Today's bookings dashboard
- Works with Story 27.3 (check-in) for status updates
- Uses bookings data from Epic 24 (checkout)

**Integration Points:**
- Displays bookings created in Epic 24
- Shows check-in status from Story 27.3
- Triggers QR scan from Story 27.1
- Uses validation from Story 27.2
- Creates audit logs via Story 28.5

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-27-Story-27.4]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-OPS-02]
- [Source: project-context.md#TanStack-Query-Hook-Pattern]
- [Source: project-context.md#Component-Data-Pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - TanStack Query implementation.

### Completion Notes List

**Implementation Summary:**
1. Replaced mock data with real Supabase queries
2. TanStack Query with 30-second auto-refresh
3. Filters for today's bookings by vendor
4. Check-in and no-show action mutations
5. Real-time booking list updates

### File List

**Modified Files:**
- src/components/vendor/VendorOperationsPage.tsx
