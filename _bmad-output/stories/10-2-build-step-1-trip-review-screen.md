### Story 10.2: Build Step 1 - Trip Review Screen

As a traveler in checkout,
I want to review my complete trip before providing details,
So that I can confirm my selections.

**Acceptance Criteria:**

**Given** I am on checkout Step 1 (Review)
**When** the screen loads
**Then** I see all trip items displayed:
  - Experience image thumbnail
  - Experience title
  - Scheduled date and time (or "Unscheduled")
  - Guest count with edit button
  - Item price (price × guests)
**And** price summary at bottom: Subtotal, Service Fee (10%), Total
**And** "Edit Trip" link returns to trip builder
**And** "Continue" button advances to Step 2
**When** I tap edit on guest count
**Then** inline stepper allows adjustment
**And** prices update immediately
