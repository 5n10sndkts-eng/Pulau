### Story 4.3: Add Optional Trip Dates Screen

As a user completing onboarding,
I want to optionally set my trip dates,
So that the app can filter experiences by availability.

**Acceptance Criteria:**

**Given** I am on onboarding Screen 3
**When** the screen loads
**Then** I see two date pickers: "Arrival Date" and "Departure Date"
**And** date pickers default to empty (no dates selected)
**And** I see "Skip for now - Just browsing" link at bottom
**When** I select an arrival date
**Then** departure date picker minimum is set to arrival date + 1 day
**When** I select valid dates
**Then** dates are saved to user_preferences table (trip_start_date, trip_end_date)
**When** I tap "Continue" OR "Skip for now"
**Then** onboarding flow completes
**And** user is redirected to Home screen (/home)
**And** onboarding_completed flag is set to true in user record
**And** if skipped, trip_start_date and trip_end_date remain null
