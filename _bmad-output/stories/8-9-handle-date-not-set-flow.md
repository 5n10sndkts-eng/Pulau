### Story 8.9: Handle Date Not Set Flow

As a traveler who hasn't set trip dates,
I want to browse and add items without dates,
So that I can plan before committing to dates.

**Acceptance Criteria:**

**Given** my trip has no dates set (start_date and end_date are null)
**When** I add items to trip
**Then** all items go to "Unscheduled" section
**And** trip builder shows "Set your dates" prompt at top
**When** I tap "Continue to Booking" without dates
**Then** modal prompts: "When are you traveling?"
**And** date picker with "Set Dates" and "Skip for now" buttons
**When** I set dates
**Then** unscheduled items remain unscheduled (not auto-assigned)
**And** I can now drag items to specific days
