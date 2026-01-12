### Story 26.2: Build Offline Ticket Display

As a **traveler**,
I want to view my ticket when offline,
So that I can gain entry to my experience.

**Acceptance Criteria:**

**Given** I have a cached ticket
**When** I am offline and open my ticket page
**Then** I see:
  - QR code (prominently displayed)
  - Experience name and date/time
  - Guest count
  - Meeting point information
  - "Offline Mode" indicator
  - "Last Updated" timestamp
**And** the page loads in < 1.5 seconds (TTI)
**And** I can access the ticket from my bookings list

---
