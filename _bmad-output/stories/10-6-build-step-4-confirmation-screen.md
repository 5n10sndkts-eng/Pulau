### Story 10.6: Build Step 4 - Confirmation Screen

As a traveler who completed booking,
I want to see my booking confirmation,
So that I know my reservation is secured.

**Acceptance Criteria:**

**Given** payment succeeded and I'm on Step 4 (Confirmation)
**When** the screen loads
**Then** success animation plays: confetti burst (500ms) with green checkmark
**And** confirmation displays:
  - "Booking Confirmed!" heading
  - Booking reference: PL-XXXXXX (tappable to copy)
  - "Confirmation sent to [email]" message
  - Trip summary: dates, item count, total paid
**And** action buttons:
  - "View My Trips" (primary) - navigates to booking history
  - "Back to Home" (secondary)
**And** confirmation email is triggered (queued for sending)
**And** trip status updates from 'planning' to 'booked'
