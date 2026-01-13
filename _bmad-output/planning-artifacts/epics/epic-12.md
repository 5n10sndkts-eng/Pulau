## Epic 12: Explore & Discovery Features

**Goal:** Users discover content through Explore screen with curated sections: Trending in Bali, Hidden Gems, Limited Availability alerts, Destination Guides, and Stories from Travelers.

### Story 12.1: Build Explore Screen Layout

As a traveler looking for inspiration,
I want a discovery-focused explore screen,
So that I can find interesting experiences beyond categories.

**Acceptance Criteria:**

**Given** I tap "Explore" in bottom navigation (Compass icon)
**When** the Explore screen loads
**Then** I see vertically scrolling sections:

- Search bar at top (sticky)
- "Trending in Bali" horizontal carousel
- "Hidden Gems" horizontal carousel
- "Limited Availability" horizontal carousel
- "Destination Guides" grid (2 columns)
- "Stories from Travelers" vertical list
  **And** each section has "See All" link
  **And** pull-to-refresh triggers content refresh
  **And** skeleton loading states while data loads

### Story 12.2: Create Trending Experiences Section

As a traveler,
I want to see what's popular,
So that I can discover highly-booked experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Trending in Bali" section loads
**Then** I see horizontal carousel of 6-10 experience cards
**And** trending calculated by: booking_count in last 30 days, minimum 10 bookings
**And** cards display: image, title, "🔥 X booked this week" badge, price
**And** cards are slightly larger than category browse cards
**When** I swipe horizontally
**Then** carousel scrolls smoothly with snap-to-card behavior
**When** I tap a trending card
**Then** I navigate to experience detail page

### Story 12.3: Create Hidden Gems Section

As a traveler seeking unique experiences,
I want to discover lesser-known gems,
So that I can have authentic local experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Hidden Gems" section loads
**Then** I see horizontal carousel of experiences
**And** hidden gems identified by: rating >= 4.5 AND booking_count < 50 AND review_count >= 5
**And** cards display: image, title, "💎 Local Secret" badge, rating, price
**And** badge uses Golden Sand color (#F4D03F)
**When** I tap "See All"
**Then** I navigate to filtered browse showing all hidden gems

### Story 12.4: Create Limited Availability Alerts

As a traveler,
I want to see experiences with limited spots,
So that I can book before they sell out.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Limited Availability" section loads
**Then** I see experiences with low remaining slots
**And** limited = experience_availability.slots_available <= 5 for next 7 days
**And** cards display: image, title, "Only X spots left!" badge (red/coral), date, price
**And** urgency styling: coral border, pulsing badge animation
**When** availability updates (spots fill)
**Then** section content refreshes on next load
**And** fully booked experiences move to "Sold Out" state

### Story 12.5: Create Destination Guides Section

As a traveler planning a trip,
I want to read curated destination guides,
So that I can learn about different areas of Bali.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Destination Guides" section loads
**Then** I see 2-column grid of guide cards:

- Ubud (Culture & Rice Terraces)
- Seminyak (Beach & Nightlife)
- Uluwatu (Surf & Cliffs)
- Nusa Islands (Island Hopping)
  **And** each card has: cover image, destination name, tagline
  **When** I tap a guide card
  **Then** guide detail page opens with:
- Hero image
- Overview text
- "Top Experiences" list (filtered by destination)
- Map of area
- "Best For" tags

### Story 12.6: Create Traveler Stories Section

As a traveler seeking social proof,
I want to read stories from other travelers,
So that I can learn from their experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Stories from Travelers" section loads
**Then** I see vertical list of story cards
**And** stories sourced from reviews with photos and 200+ character text
**And** card displays: traveler photo, name, country, story excerpt, experience thumbnail
**And** cards expandable to show full story
**When** I tap "Read More" on a story
**Then** full review displays with all photos
**And** link to the experience being reviewed

---
