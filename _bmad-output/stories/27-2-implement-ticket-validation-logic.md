### Story 27.2: Implement Ticket Validation Logic

As a **vendor**,
I want scanned tickets to be validated against bookings,
So that I only admit travelers with valid reservations.

**Acceptance Criteria:**

**Given** I scan a QR code
**When** the booking ID is decoded
**Then** the system validates:
  - Booking exists and is confirmed
  - Booking is for today's date
  - Booking is for one of my experiences
  - Booking hasn't already been checked in
**And** if valid, I see green "VALID" indicator with details
**And** if invalid, I see red "INVALID" with reason

---
