# Story 29.5: Add Real-Time Revenue Notifications

Status: done

## Story

As a **vendor**,
I want to receive real-time notifications when bookings are confirmed and revenue is earned,
So that I can stay informed about my business activity without constantly checking the dashboard.

## Acceptance Criteria

1. **Given** I am logged in as a vendor with the dashboard open
   **When** a traveler confirms a booking for one of my experiences
   **Then** I see a toast notification with the booking details and amount

2. **Given** I have browser notifications enabled
   **When** a booking is confirmed (even if tab is in background)
   **Then** I receive a browser push notification

3. **Given** I am on the vendor dashboard
   **When** I view the notification bell
   **Then** I see recent booking notifications with unread count

4. **Given** notifications are available
   **When** I click on a notification
   **Then** I am navigated to the relevant booking or revenue dashboard

5. **Given** I want to manage notifications
   **When** I toggle notification settings
   **Then** I can enable/disable browser notifications

## Tasks / Subtasks

- [x] Create Story 29-5 story file
- [x] Extend realtimeService with vendor booking subscription
  - [x] Add subscribeToVendorBookings function
  - [x] Filter by vendor_id for booking confirmations
- [x] Create vendorNotificationService
  - [x] Request browser notification permission
  - [x] Show browser notifications
  - [x] Format notification content
- [x] Create useVendorNotifications hook
  - [x] Subscribe to vendor bookings on mount
  - [x] Show toast notifications for new bookings
  - [x] Trigger browser notifications
  - [x] Track recent notifications
- [x] Create VendorNotificationBell component
  - [x] Display bell icon with unread count badge
  - [x] Dropdown showing recent notifications
  - [x] Mark as read functionality
  - [x] Settings toggle for browser notifications
- [x] Integrate into VendorDashboard
  - [x] Add VendorNotificationBell to header
  - [x] Initialize notifications on dashboard load
- [x] Test and commit

## Dev Notes

### Real-time Subscription Pattern

Use existing realtimeService pattern to subscribe to bookings table filtered by vendor_id:

```typescript
export function subscribeToVendorBookings(
  vendorId: string,
  callback: VendorBookingCallback
): string {
  const channelName = `vendor-bookings-${vendorId}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `vendor_id=eq.${vendorId}`
      },
      callback
    )
    .subscribe()

  return subscriptionId
}
```

### Browser Notifications API

```typescript
// Request permission
const permission = await Notification.requestPermission()

// Show notification
if (permission === 'granted') {
  new Notification('New Booking!', {
    body: 'You have a new $150 booking for Volcano Sunrise Trek',
    icon: '/icons/icon-192x192.png',
    tag: 'booking-notification'
  })
}
```

### Toast Integration (Sonner)

Use existing toast pattern:
```typescript
import { toast } from 'sonner'

toast.success('New Booking Confirmed!', {
  description: `$150 for Volcano Sunrise Trek`,
  action: {
    label: 'View',
    onClick: () => navigateToBooking(bookingId)
  }
})
```

### Notification Data Structure

```typescript
interface VendorNotification {
  id: string
  type: 'booking_confirmed' | 'payout_sent' | 'review_received'
  title: string
  message: string
  amount?: number
  bookingId?: string
  experienceId?: string
  createdAt: Date
  read: boolean
}
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2b-epics.md#Epic-29-Story-29.5]
- [Source: src/lib/realtimeService.ts - Extend with vendor subscription]
- [Source: src/components/vendor/VendorDashboard.tsx - Add notification bell]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Extended realtimeService with subscribeToVendorBookings function for real-time booking notifications
- Created vendorNotificationService with browser Notification API support, permission management, and local storage preferences
- Built useVendorNotifications hook with demo simulation mode for testing (30-60 second intervals in dev mode)
- Created VendorNotificationBell component with Radix Popover, unread count badge, notification history, and settings panel
- Integrated notification bell into VendorDashboard header with full hook connection
- Added demo Zap button to manually trigger test notifications in dev mode

### File List

- src/lib/realtimeService.ts (extended with subscribeToVendorBookings)
- src/lib/vendorNotificationService.ts (new)
- src/hooks/useVendorNotifications.ts (new)
- src/components/vendor/VendorNotificationBell.tsx (new)
- src/components/vendor/VendorDashboard.tsx (integrated notification bell)

