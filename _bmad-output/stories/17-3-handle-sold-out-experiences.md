### Story 17.3: Handle Sold Out Experiences

As a traveler,
I want to know when experiences are unavailable,
So that I can find alternatives.

**Acceptance Criteria:**

**Given** an experience has no available slots (slots_available = 0 for all dates)
**When** experience card displays
**Then** "Currently Unavailable" badge overlay on image
**And** card is slightly desaturated (80% opacity)
**And** "Quick Add" button disabled
**When** I tap the card to view details
**Then** detail page shows availability calendar (all red)
**And** "Join Waitlist" button appears
**And** "Similar Experiences" section shows alternatives in same category
**When** I join waitlist
**Then** my email saved to waitlist table (experience_id, user_id, created_at)
**And** toast: "You'll be notified when spots open"
