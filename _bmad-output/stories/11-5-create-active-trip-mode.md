### Story 11.5: Create Active Trip Mode

As a traveler during my booked trip,
I want an enhanced home screen experience,
So that I can easily access today's activities.

**Acceptance Criteria:**

**Given** I have a confirmed booking AND today is within trip date range
**When** I open the app / view home screen
**Then** home screen transforms to "Active Trip Mode":

- Top banner: "Day X of your Bali adventure!"
- Countdown: "X days remaining"
- "Today's Schedule" section prominently displayed
- Today's items with times, meeting points, quick directions
  **And** each item has "View Details" expanding to full info
  **And** "View Full Itinerary" button shows complete trip
  **And** weather widget for Bali (if API available)
  **When** trip ends (after end_date)
  **Then** home screen returns to normal planning mode
  **And** past trip moves to "Past" tab
