### Story 6.9: Add Meeting Point Information

As a traveler,
I want to know where to meet for the experience,
So that I can plan my arrival.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Where You'll Meet" section
**Then** I see:

- Embedded static map image showing meeting location (via Google Maps Static API or Mapbox)
- Meeting point name (from experiences.meeting_point_name)
- Full address (from experiences.meeting_point_address)
- Copy icon button next to address (copies to clipboard on tap)
- "Get Directions" link (opens default maps app with coordinates)
- Additional instructions (from experiences.meeting_instructions) if provided
  **And** map marker shows at experiences.meeting_point_lat, meeting_point_lng
  **When** I tap "Get Directions"
  **Then** deep link opens to: Google Maps on Android, Apple Maps on iOS with destination pre-filled
