### Story 8.3: Implement Quick Add Experience to Trip

As a traveler browsing experiences,
I want to quickly add activities to my trip,
So that I can build my itinerary without leaving the browse view.

**Acceptance Criteria:**

**Given** I am viewing an experience card in any browse context
**When** I tap "+ Quick Add" button
**Then** experience is added to my active trip as unscheduled item
**And** item flies to trip bar with animation (150ms ease-out)
**And** trip bar price updates immediately to include new item
**And** trip item record created: { experience_id, guest_count: 1, scheduled_date: null }
**And** toast displays "Added to trip"
**When** I tap Quick Add for an experience already in trip
**Then** toast displays "Already in your trip"
**And** no duplicate is created
