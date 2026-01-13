### Story 28.4: Display Immutable Audit Log

As an **admin**,
I want to view the complete audit history for a booking,
So that I can understand exactly what happened for dispute resolution.

**Acceptance Criteria:**

**Given** I am viewing a booking detail
**When** I click "View Audit Log"
**Then** I see a chronological list of all events:

- Event type (created, payment_received, confirmed, checked_in, refunded, etc.)
- Timestamp
- Actor (user, vendor, admin, system)
- Metadata (amounts, reasons, etc.)
  **And** events are displayed newest-first by default
  **And** I can filter by event type
  **And** Stripe event IDs are shown for payment events

---
