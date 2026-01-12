### Story 23.3: Configure Cut-off Time Settings

As a **vendor**,
I want to set how far in advance bookings must be made,
So that I have adequate preparation time.

**Acceptance Criteria:**

**Given** I am configuring my experience
**When** I set the "Cut-off Time"
**Then** I can specify hours before start time (e.g., 2 hours, 24 hours)
**And** this is stored in `experiences.cutoff_hours`
**And** slots within the cut-off window show as "Unavailable" to travelers
**And** the default cut-off is 2 hours if not specified

---
