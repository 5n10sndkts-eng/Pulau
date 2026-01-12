### Story 8.4: Create Detailed Trip Builder Screen

As a traveler,
I want a full-screen trip builder to organize my itinerary,
So that I can see all details and make adjustments.

**Acceptance Criteria:**

**Given** I tap "View Full Trip" or navigate to trip builder
**When** the trip builder screen loads
**Then** I see header with: back button, trip name (editable inline), share button
**And** date picker shows: arrival date, departure date (with calendar modal)
**And** trip items are grouped by scheduled date
**And** "Unscheduled" section shows items without dates
**And** sticky footer shows: item count, total price, "Continue to Booking" button
**And** total price calculates: SUM(experience.price × guest_count) for all items
