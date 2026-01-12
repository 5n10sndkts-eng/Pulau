### Story 15.1: Display Real-time Availability on Experience Pages

As a traveler,
I want to see current availability for experiences,
So that I can book dates that work.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** the availability section loads
**Then** I see a calendar showing next 60 days
**And** each date shows availability status:
  - Green: Available (slots > 50%)
  - Yellow: Limited (slots 1-50%)
  - Red: Sold Out (slots = 0)
  - Gray: Not Operating (no availability record)
**And** availability loads from experience_availability table
**When** I tap an available date
**Then** date selects and "Add to Trip" prefills with that date
**And** slots remaining displays: "X spots left"
