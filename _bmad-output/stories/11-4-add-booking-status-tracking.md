### Story 11.4: Add Booking Status Tracking

As a traveler,
I want to see the status of my bookings,
So that I know if they're confirmed or need attention.

**Acceptance Criteria:**

**Given** bookings have various statuses
**When** I view booking cards or details
**Then** status badges display with appropriate colors:

- "Confirmed" - green badge (#27AE60)
- "Pending" - yellow badge (#F4D03F)
- "Cancelled" - gray badge
- "Completed" - teal badge (#0D7377)
  **And** status stored in bookings.status enum
  **And** status updates based on:
- 'confirmed' after successful payment
- 'completed' after trip.end_date passes
- 'cancelled' if user cancels
  **And** status changes log to booking_status_history table
