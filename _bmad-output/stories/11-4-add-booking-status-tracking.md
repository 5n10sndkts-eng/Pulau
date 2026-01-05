# Story 11.4: Add Booking Status Tracking

Status: ready-for-dev

## Story

As a traveler,
I want to see the status of my bookings,
So that I know if they're confirmed or need attention.

## Acceptance Criteria

### AC 1: Status Badge Display
**Given** bookings have various statuses
**When** I view booking cards or details
**Then** status badges display with appropriate colors
**And** the status is clearly visible and readable

### AC 2: Confirmed Status Styling
**Given** a booking has status 'confirmed'
**When** the status badge is displayed
**Then** it shows "Confirmed" with green badge (#27AE60)
**And** the badge is styled with proper contrast

### AC 3: Pending Status Styling
**Given** a booking has status 'pending'
**When** the status badge is displayed
**Then** it shows "Pending" with yellow badge (#F4D03F)
**And** the badge conveys need for attention

### AC 4: Cancelled Status Styling
**Given** a booking has status 'cancelled'
**When** the status badge is displayed
**Then** it shows "Cancelled" with gray badge
**And** the badge appearance is subdued

### AC 5: Completed Status Styling
**Given** a booking has status 'completed'
**When** the status badge is displayed
**Then** it shows "Completed" with teal badge (#0D7377)
**And** the badge indicates successful completion

### AC 6: Status Database Storage
**Given** booking statuses need to be stored
**When** bookings are created or updated
**Then** status is stored in bookings.status enum
**And** the enum includes: 'confirmed', 'pending', 'cancelled', 'completed'

### AC 7: Automatic Status Updates
**Given** bookings transition through lifecycle
**When** certain events occur
**Then** status updates based on:
- 'confirmed' after successful payment
- 'completed' after trip.end_date passes
- 'cancelled' if user cancels
**And** updates happen automatically

### AC 8: Status History Logging
**Given** booking statuses change over time
**When** a status update occurs
**Then** status changes log to booking_status_history table
**And** history includes: old_status, new_status, changed_at, reason

## Tasks / Subtasks

### Task 1: Create StatusBadge Component (AC: #1, #2, #3, #4, #5)
- [ ] Create StatusBadge component in components/booking/StatusBadge.tsx
- [ ] Implement color mapping for each status type
- [ ] Style badge with rounded corners, padding, and proper typography
- [ ] Add icon support for each status (optional)
- [ ] Make component reusable across booking cards and details

### Task 2: Update Database Schema (AC: #6, #8)
- [ ] Create or verify bookings.status enum with values: confirmed, pending, cancelled, completed
- [ ] Add status column to bookings table if not exists
- [ ] Create booking_status_history table with columns: id, booking_id, old_status, new_status, changed_at, reason
- [ ] Add indexes on status for filtering queries
- [ ] Create migration script for schema changes

### Task 3: Implement Status Update Logic (AC: #7)
- [ ] Create updateBookingStatus function in services/booking.service.ts
- [ ] Add automatic status update to 'confirmed' after payment success
- [ ] Implement scheduler/cron to set 'completed' after trip.end_date passes
- [ ] Add status update to 'cancelled' in cancellation flow
- [ ] Ensure all status updates are transactional

### Task 4: Build Status History Logging (AC: #8)
- [ ] Create logStatusChange function to insert into booking_status_history
- [ ] Call logStatusChange whenever updateBookingStatus is invoked
- [ ] Include reason parameter (e.g., "Payment completed", "Trip ended", "User cancelled")
- [ ] Add timestamp and user context to logs
- [ ] Create query function to retrieve status history for a booking

### Task 5: Integrate StatusBadge in UI (AC: #1)
- [ ] Add StatusBadge to BookingCard component in booking history
- [ ] Add StatusBadge to BookingDetailScreen header
- [ ] Ensure badge renders correctly on both light and dark themes
- [ ] Test badge appearance on various screen sizes
- [ ] Add accessibility labels for screen readers

### Task 6: Create Automated Status Updater (AC: #7)
- [ ] Create edge function or cron job to check for completed trips daily
- [ ] Query bookings with status 'confirmed' and trip.end_date < today
- [ ] Batch update statuses to 'completed'
- [ ] Log all automated updates to status history
- [ ] Handle errors and retry failed updates

### Task 7: Add Status Filtering and Queries
- [ ] Update booking queries to include status field
- [ ] Add status-based filtering in booking history tabs
- [ ] Create indexes for efficient status queries
- [ ] Test query performance with large datasets
- [ ] Consider caching frequently accessed status data

## Dev Notes

### Status Badge Component Example
```typescript
interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG = {
  confirmed: { color: '#27AE60', label: 'Confirmed', icon: 'check-circle' },
  pending: { color: '#F4D03F', label: 'Pending', icon: 'clock' },
  cancelled: { color: '#95A5A6', label: 'Cancelled', icon: 'x-circle' },
  completed: { color: '#0D7377', label: 'Completed', icon: 'check-circle' }
};
```

### Database Schema
```sql
-- bookings.status enum
CREATE TYPE booking_status AS ENUM ('confirmed', 'pending', 'cancelled', 'completed');

ALTER TABLE bookings ADD COLUMN status booking_status DEFAULT 'pending';

-- booking_status_history table
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  old_status booking_status,
  new_status booking_status,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);
```

### Automated Status Update
- Use Supabase Edge Functions or pg_cron for scheduled jobs
- Run daily at 00:00 UTC to check for completed trips
- Consider time zones when marking trips as completed
- Send notifications when status changes (optional)

### Testing Considerations
- Test all status transitions (pending → confirmed → completed)
- Test cancellation flow (confirmed → cancelled)
- Verify status history logs are created correctly
- Test automated completion for trips ending today
- Check badge appearance on different backgrounds
- Validate enum constraints in database

## References

- [Source: epics.md#Epic 11 - Story 11.4]
- [Source: prd/pulau-prd.md#Booking Management]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 11.6 - Implement Booking Cancellation Flow]
- [Related: Story 9.3 - Process Payment and Create Booking]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
