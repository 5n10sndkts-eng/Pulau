# Story 15.2: Enable Vendor Calendar Quick Updates

Status: done

## Story

As a vendor,
I want to quickly update availability from my phone,
So that I can manage cancellations on the go.

## Acceptance Criteria

### AC1: Quick Edit Modal Display
**Given** I am a vendor viewing my experience availability
**When** I tap a date on the calendar
**Then** quick edit modal opens with:
  - Date displayed
  - Slots Available (number input)
  - Status toggle: Available / Blocked
  - "Save" and "Cancel" buttons

### AC2: Immediate Updates and Confirmation
**When** I save changes
**Then** experience_availability record updates immediately
**And** change reflects on customer-facing pages within 1 second
**And** toast confirms "Availability updated"

### AC3: Booking Conflict Warning
**And** if I block a date with existing bookings, warning shows with affected bookings

## Tasks / Subtasks

### Task 1: Build Quick Edit Modal Component (AC: #1)
- [x] Create QuickEditAvailabilityModal with slide-up sheet animation
- [x] Display selected date prominently in modal header
- [x] Add number input for "Slots Available" with +/- stepper controls
- [x] Implement Available/Blocked status toggle switch
- [x] Add "Save" (primary) and "Cancel" (secondary) action buttons

### Task 2: Implement Save Logic with Real-time Updates (AC: #2)
- [x] On Save, update experience_availability record via Spark KV store mutation
- [x] Invalidate Spark useKV cache for this experience's availability
- [x] Trigger real-time update to customer-facing pages (SSE or polling)
- [x] Show success toast: "Availability updated for [date]"
- [x] Close modal after successful save

### Task 3: Add Booking Conflict Detection (AC: #3)
- [x] Before saving, query bookings KV namespace for existing bookings on selected date
- [x] If blocking date with bookings, show warning modal with booking count
- [x] Display list of affected booking IDs and customer names
- [x] Require confirmation: "Block anyway" or "Cancel"
- [x] Log conflict warnings for vendor records

### Task 4: Optimize for Mobile Interaction (AC: #1)
- [x] Ensure modal occupies bottom 50% of screen on mobile
- [x] Add drag handle for swipe-to-dismiss gesture
- [x] Make number input touch-friendly with large +/- buttons
- [x] Implement haptic feedback on toggle and save actions
- [x] Test on devices with notches (safe area insets)

### Task 5: Validate Input and Handle Errors (AC: #2, #3)
- [x] Validate slots_available >= 0 (no negative numbers)
- [x] Show error if slots_available < current bookings for that date
- [x] Handle network failures with retry option
- [x] Display error toast if update fails: "Update failed. Try again."
- [x] Prevent duplicate saves (disable Save button during request)

## Dev Notes

### Technical Implementation
- Component location: `src/components/vendor/QuickEditAvailabilityModal.tsx`
- Use Radix UI Dialog primitive for accessible modal
- Implement optimistic UI updates (update local state before server confirms)
- Database mutation pattern:
```typescript
await db.experience_availability
  .updateOne({ experience_id, date }, {
    slots_available,
    is_blocked
  })
  .execute();
```

### Booking Conflict Query
```typescript
const conflictingBookings = await db.bookings
  .where('experience_id', '=', experienceId)
  .where('booking_date', '=', selectedDate)
  .where('status', 'in', ['confirmed', 'pending'])
  .execute();
```

### Real-time Update Strategy
- Option 1: Server-Sent Events (SSE) to push updates to connected clients
- Option 2: Short polling interval (5s) for customer-facing availability
- Option 3: WebSocket connection for instant sync
- Invalidate cache key: `availability:${experienceId}`

### Design System
- Modal: Use `Sheet` component with `position="bottom"` on mobile
- Number input: Custom component with `ChevronUp`/`ChevronDown` icons
- Toggle: Radix Switch with teal color when enabled
- Buttons: Primary button (teal), Secondary button (gray outline)

### Validation Rules
- `slots_available` must be integer >= 0
- If `is_blocked = true`, set `slots_available = 0`
- Cannot block date if `conflictingBookings.length > slots_available`

### Accessibility
- Focus trap within modal (cannot tab outside)
- Escape key closes modal
- ARIA labels for number input: "Available slots"
- Announce save success to screen readers

## References

- [Source: planning-artifacts/epics/epic-15.md#Epic 15, Story 15.2]
- [Related: Story 15.1 - Display Availability Calendar]
- [Database Schema: experience_availability, bookings KV namespaces]
- [UI Components: Radix Dialog, Radix Switch]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

