### Story 8.2: Build Trip Canvas Home View

As a traveler,
I want to see my trip overview on the home screen,
So that I can quickly understand my planned activities.

**Acceptance Criteria:**

**Given** I am on the home screen with an active trip
**When** the trip canvas section loads
**Then** I see trip header: trip name (editable), date range (or "Dates not set")
**And** trip summary bar shows: item count, total days, total price
**And** below header I see trip items organized by day
**And** each day section shows: day number, date, scheduled items
**And** each item card displays: time, experience title, duration, price, guest count
**And** "View Full Trip" button expands to detailed trip builder
**When** trip has no items
**Then** empty state shows: suitcase illustration, "Your trip canvas is empty", "Start Exploring" button
