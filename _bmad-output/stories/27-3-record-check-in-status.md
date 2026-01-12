### Story 27.3: Record Check-In Status

As a **vendor**,
I want to mark travelers as checked in,
So that I have a record of attendance.

**Acceptance Criteria:**

**Given** I have validated a ticket
**When** I tap "Check In" button
**Then** the booking status updates to "checked_in"
**And** check-in timestamp is recorded
**And** an audit log entry is created
**And** I cannot check in the same booking twice
**And** check-in works offline (syncs when online)

---
