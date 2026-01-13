### Story 23.1: Build Slot Creation Interface

As a **vendor**,
I want to create availability slots for my experiences,
So that travelers can see when my experience is available.

**Acceptance Criteria:**

**Given** I am editing one of my experiences
**When** I navigate to the "Availability" tab
**Then** I see a calendar view of the current month
**And** I can click a date to add time slots
**And** for each slot I can set:

- Start time
- Duration (auto-calculated end time)
- Capacity (number of guests)
- Price override (optional, defaults to experience base price)
  **And** I can create recurring slots (e.g., "Every Monday at 9 AM")

---
