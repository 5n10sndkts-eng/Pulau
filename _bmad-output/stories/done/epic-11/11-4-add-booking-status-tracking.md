# Story 11.4: Add Booking Status Tracking

Status: done

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
**Then** status changes log to booking_status_history KV namespace
**And** history includes: old_status, new_status, changed_at, reason

## Tasks / Subtasks

### Task 1: Create StatusBadge Component (AC: #1, #2, #3, #4, #5)

- [x] Create StatusBadge component in `src/components/booking/StatusBadge.tsx`
- [x] Implement color mapping for each status type using Tailwind CSS classes
- [x] Style badge with rounded corners, padding, and proper typography
- [x] Add Lucide React icon support for each status (CheckCircle, Clock, XCircle)
- [x] Make component reusable across booking cards and details
- [x] Add TypeScript interface for StatusBadgeProps with strict status typing

### Task 2: Update Booking Type Definitions (AC: #6, #8)

- [x] Update `BookingStatus` type in `src/lib/types.ts` with union: 'confirmed' | 'pending' | 'cancelled' | 'completed'
- [x] Add `status` field to `Booking` interface with `BookingStatus` type
- [x] Create `BookingStatusHistory` interface with: booking_id, old_status, new_status, changed_at, reason
- [x] Add status field to KV store booking records with default value 'pending'
- [x] Update all booking-related TypeScript types to include status

### Task 3: Implement Status Update Logic (AC: #7)

- [x] Create `updateBookingStatus` function in `src/lib/booking-service.ts`
- [x] Implement KV store update to change booking status
- [x] Add automatic status update to 'confirmed' after payment success hook
- [x] Create client-side utility to mark trips as 'completed' based on end_date
- [x] Add status update to 'cancelled' in cancellation flow
- [x] Ensure all status updates maintain data consistency in KV store

### Task 4: Build Status History Logging (AC: #8)

- [x] Create `logStatusChange` function to store status history in KV store
- [x] Use KV key pattern: `booking_status_history:{bookingId}:{timestamp}`
- [x] Call `logStatusChange` whenever `updateBookingStatus` is invoked
- [x] Include reason parameter (e.g., "Payment completed", "Trip ended", "User cancelled")
- [x] Add timestamp and user context (from useUser hook) to logs
- [x] Create query function to retrieve status history array for a booking

### Task 5: Integrate StatusBadge in UI (AC: #1)

- [x] Add StatusBadge to BookingCard component in `src/components/TripsDashboard.tsx`
- [x] Add StatusBadge to booking detail view header
- [x] Ensure badge renders correctly with Tailwind dark mode classes
- [x] Test badge appearance on mobile and desktop viewports
- [x] Add aria-label attributes for screen readers
- [x] Verify badge colors meet WCAG contrast requirements

### Task 6: Create Automated Status Updater (AC: #7)

- [x] Create React hook `useBookingStatusUpdater` to check for completed trips
- [x] Query bookings from KV store with status 'confirmed' and trip.end_date < today
- [x] Batch update statuses to 'completed' using KV store writes
- [x] Log all automated updates to status history
- [x] Run check on component mount and periodically (e.g., every 5 minutes)
- [x] Handle errors gracefully with toast notifications

### Task 7: Add Status Filtering and Queries

- [x] Update `getBookings` function to filter by status from KV store
- [x] Add status-based filtering tabs in booking history component
- [x] Implement client-side filtering for quick status changes
- [x] Optimize KV store queries by using status-based key prefixes
- [x] Add loading states during status filter changes

## Dev Notes

### Status Badge Component Example

```typescript
// src/components/booking/StatusBadge.tsx
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { BookingStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<BookingStatus, {
  label: string;
  bgClass: string;
  textClass: string;
  icon: typeof CheckCircle;
}> = {
  confirmed: {
    label: 'Confirmed',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-200',
    icon: CheckCircle
  },
  pending: {
    label: 'Pending',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    icon: Clock
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-600 dark:text-gray-400',
    icon: XCircle
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-teal-100 dark:bg-teal-900/30',
    textClass: 'text-teal-800 dark:text-teal-200',
    icon: CheckCircle
  }
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgClass} ${config.textClass} ${className}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
```

### KV Store Schema Patterns

```typescript
// Booking record with status
interface Booking {
  id: string;
  userId: string;
  experienceId: string;
  status: BookingStatus; // 'confirmed' | 'pending' | 'cancelled' | 'completed'
  createdAt: string;
  updatedAt: string;
  // ... other fields
}

// Status history entry
interface BookingStatusHistory {
  bookingId: string;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  reason: string;
  changedAt: string;
  changedBy: string; // user ID
}

// KV storage keys
// bookings:{userId}:{bookingId} → Booking
// booking_status_history:{bookingId}:{timestamp} → BookingStatusHistory
```

### Automated Status Update

```typescript
// src/hooks/useBookingStatusUpdater.ts
import { useEffect } from 'react';
import { useKV } from '@github-spark/app';
import { toast } from 'sonner';

export function useBookingStatusUpdater() {
  const kv = useKV();

  useEffect(() => {
    const checkCompletedTrips = async () => {
      try {
        // Get all confirmed bookings
        const bookings = await kv.get<Booking[]>('bookings:*:*');
        const today = new Date().toISOString().split('T')[0];

        // Find trips that should be marked completed
        const toComplete =
          bookings?.filter(
            (b) => b.status === 'confirmed' && b.endDate < today,
          ) ?? [];

        // Batch update statuses
        for (const booking of toComplete) {
          await updateBookingStatus(booking.id, 'completed', 'Trip ended');
        }

        if (toComplete.length > 0) {
          toast.success(`Marked ${toComplete.length} trip(s) as completed`);
        }
      } catch (error) {
        console.error('Failed to update booking statuses:', error);
      }
    };

    // Run on mount and every 5 minutes
    checkCompletedTrips();
    const interval = setInterval(checkCompletedTrips, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [kv]);
}
```

### Testing Considerations

- Test all status transitions (pending → confirmed → completed)
- Test cancellation flow (confirmed → cancelled)
- Verify status history entries are created in KV store
- Test automated completion for trips with past end dates
- Check badge appearance on light and dark backgrounds
- Verify TypeScript type safety for status values
- Test status filtering performance with many bookings
- Validate WCAG contrast ratios for badge colors

## References

- [Source: planning-artifacts/epics/epic-11.md#Epic 11 - Story 11.4]
- [Source: planning-artifacts/prd/pulau-prd.md#Booking Management]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 11.6 - Implement Booking Cancellation Flow]
- [Related: Story 9.3 - Process Payment and Create Booking]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**

1. ✅ Database schema references → KV store patterns
2. ✅ KV code examples → TypeScript/KV interfaces
3. ✅ Supabase Edge Functions → Client-side React hooks
4. ✅ File paths updated to `src/` directory structure
5. ✅ Added Lucide React icons (CheckCircle, Clock, XCircle)
6. ✅ Added Tailwind CSS class examples with dark mode
7. ✅ Updated PRD reference path
8. ✅ Replaced Spark KV store KV namespaces → KV key patterns
9. ✅ Removed PostgreKV-specific features (pg_cron, KV migrations)
10. ✅ Added TypeScript type safety throughout

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web + KV store architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md` and `_bmad-output/architecture-decision-records.md`.
