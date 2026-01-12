### Story 19.2: Implement Destination Selector

As a traveler,
I want to select my destination,
So that I see relevant experiences.

**Acceptance Criteria:**

**Given** multiple destinations exist
**When** I open the app
**Then** if only one active destination, auto-select it
**When** multiple destinations are active
**Then** destination selector displays in header or splash
**And** selector shows: destination cards with image, name, tagline
**When** I select a destination
**Then** user_preferences.destination_id updates
**And** all experience queries filter by destination_id
**And** home screen shows destination-specific content
**And** destination name shows in header (e.g., "Explore Bali")
