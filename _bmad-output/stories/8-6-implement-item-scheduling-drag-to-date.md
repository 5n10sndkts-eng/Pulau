### Story 8.6: Implement Item Scheduling (Drag to Date)

As a traveler,
I want to schedule unscheduled items to specific days,
So that my itinerary has a logical flow.

**Acceptance Criteria:**

**Given** I have unscheduled items in my trip
**When** I long-press an unscheduled item
**Then** item becomes draggable with visual feedback (slight elevation, opacity change)
**When** I drag the item over a day section
**Then** day section highlights as drop target
**When** I release the item on a day
**Then** item moves to that day's section with animation
**And** trip_items.scheduled_date updates to the selected date
**And** item appears at end of that day's list
**When** I tap "Assign to Day" on an unscheduled item
**Then** date picker modal opens
**And** I can select a date from trip date range
**And** item updates and moves to selected day
