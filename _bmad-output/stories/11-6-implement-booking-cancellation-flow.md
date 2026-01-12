### Story 11.6: Implement Booking Cancellation Flow

As a traveler who needs to cancel,
I want to cancel my booking according to policy,
So that I can get a refund if eligible.

**Acceptance Criteria:**

**Given** I am viewing a confirmed booking detail
**When** I tap "Cancel Booking"
**Then** modal displays cancellation policy for each experience
**And** refund calculation shows:
  - Full refund if > 24 hours before each experience
  - Partial/no refund if within 24 hours
  - Total refund amount
**When** I confirm cancellation
**Then** booking status updates to 'cancelled'
**And** refund is initiated via payment gateway
**And** cancellation confirmation email sent
**And** toast displays "Booking cancelled. Refund processing."
**And** cancelled booking remains visible in history (grayed out)

---
