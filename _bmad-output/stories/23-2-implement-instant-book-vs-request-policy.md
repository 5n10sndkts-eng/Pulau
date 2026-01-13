### Story 23.2: Implement Instant Book vs Request Policy

As a **vendor**,
I want to choose between "Instant Book" and "Request to Book" policies,
So that I can control how reservations are confirmed.

**Acceptance Criteria:**

**Given** I am managing my experience settings
**When** I configure booking policy
**Then** I can select:

- "Instant Book" - Bookings are confirmed immediately upon payment
- "Request to Book" - I must approve each booking request within 24 hours
  **And** the policy is saved to `experiences.instant_book_enabled`
  **And** "Instant Book" is only available if my vendor status is BANK_LINKED or ACTIVE

**Given** an experience has "Request to Book" policy
**When** a traveler requests a booking
**Then** the slot is temporarily held for 24 hours
**And** I receive a notification to approve/decline
**And** payment is only captured upon my approval

---
