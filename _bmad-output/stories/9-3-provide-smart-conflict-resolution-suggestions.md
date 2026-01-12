### Story 9.3: Provide Smart Conflict Resolution Suggestions

As a traveler with a scheduling conflict,
I want suggestions to resolve the overlap,
So that I can quickly fix my itinerary.

**Acceptance Criteria:**

**Given** a conflict warning banner is displayed
**When** I tap the warning banner
**Then** a bottom sheet opens with resolution options:
  - "Move [Item A] to [suggested time]" (next available slot)
  - "Move [Item B] to [suggested time]"
  - "Move [Item A] to another day"
  - "Remove [Item A] from trip"
**And** suggestions are calculated based on item durations and available gaps
**When** I select a suggestion
**Then** the action is applied immediately
**And** conflict detection re-runs
**And** toast confirms "Conflict resolved"
