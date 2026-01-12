### Story 25.5: Display Real-Time Slot Availability

As a **traveler**,
I want to see how many spots are left for each time slot,
So that I can make informed booking decisions.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I view available time slots
**Then** each slot shows:
  - Time (e.g., "10:00 AM")
  - Available count (e.g., "5 spots left")
  - Price (or "From $X")
  - Visual indicator for low availability (< 3 spots)
**And** sold out slots are shown but disabled
**And** availability updates in real-time via subscription

---
