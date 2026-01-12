### Story 9.2: Display Conflict Warning Banners

As a traveler,
I want to see visual warnings when activities overlap,
So that I can fix scheduling issues.

**Acceptance Criteria:**

**Given** a scheduling conflict is detected from Story 9.1
**When** I view the trip builder
**Then** conflicting items show yellow warning banner
**And** banner displays: warning icon (⚠️), "Schedule conflict with [other item name]"
**And** banner background uses Golden Sand color (#F4D03F at 20% opacity)
**And** banner appears between the two conflicting item cards
**When** conflict is resolved (item moved or removed)
**Then** warning banner disappears with fade animation
