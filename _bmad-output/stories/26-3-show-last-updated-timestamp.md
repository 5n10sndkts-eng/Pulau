### Story 26.3: Show Last Updated Timestamp

As a **traveler**,
I want to see when my ticket data was last updated,
So that I know if the information is current.

**Acceptance Criteria:**

**Given** I am viewing a cached ticket offline
**When** the ticket displays
**Then** I see "Last updated: [timestamp]" (e.g., "Last updated: 2 hours ago")
**And** if data is older than 24 hours, I see a warning
**And** a "Refresh" button is available (grayed out when offline)

---
