### Story 8.5: Build Calendar View Toggle

As a traveler,
I want to switch between calendar and list views of my trip,
So that I can visualize my itinerary in my preferred format.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I see the view toggle (Calendar | List)
**Then** default view is List (timeline)
**When** I tap "Calendar"
**Then** view switches to monthly calendar grid
**And** days with activities show colored dots (one dot per item)
**And** tapping a day shows that day's items in a bottom sheet
**And** current day is highlighted
**When** I tap "List"
**Then** view switches to vertical timeline
**And** items grouped by day with connecting timeline lines
**And** smooth transition animation between views (200ms)
