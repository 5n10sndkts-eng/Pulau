### Story 11.3: Implement "Book Again" Functionality

As a traveler who enjoyed a past trip,
I want to quickly rebook the same experiences,
So that I can plan a return visit easily.

**Acceptance Criteria:**

**Given** I am viewing a past/completed booking
**When** I tap "Book Again" button
**Then** a new trip is created copying all items from the original booking
**And** new trip has: name = "[Original name] (Copy)", dates = null, status = 'planning'
**And** all trip_items are copied with: same experiences, same guest counts
**And** scheduled_dates are cleared (items become unscheduled)
**And** I am navigated to the trip builder with the new trip
**And** toast displays "Trip copied! Set your new dates."
**And** original booking remains unchanged
