### Story 12.4: Create Limited Availability Alerts

As a traveler,
I want to see experiences with limited spots,
So that I can book before they sell out.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Limited Availability" section loads
**Then** I see experiences with low remaining slots
**And** limited = experience_availability.slots_available <= 5 for next 7 days
**And** cards display: image, title, "Only X spots left!" badge (red/coral), date, price
**And** urgency styling: coral border, pulsing badge animation
**When** availability updates (spots fill)
**Then** section content refreshes on next load
**And** fully booked experiences move to "Sold Out" state
