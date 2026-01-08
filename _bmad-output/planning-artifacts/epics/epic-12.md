# Epic 12: Explore & Discovery Features

**Goal:** Users discover content through Explore screen with curated sections: Trending in Bali, Hidden Gems, Limited Availability alerts, Destination Guides, and Stories from Travelers.

### Story 12.1: Build Explore Screen Layout
As a traveler looking for inspiration, I want a discovery-focused explore screen, so that I can find interesting experiences beyond categories.

**Acceptance Criteria:**
- **Given** "Explore" tab **When** screen loads **Then** I see scrolling carousels for Trending, Hidden Gems, and Limited Availability
- **And** 2-column grid for Destination Guides and a list of Traveler Stories
- **And** skeleton states show during loading

### Story 12.2: Create Trending Experiences Section
As a traveler, I want to see what's popular, so that I can discover highly-booked experiences.

**Acceptance Criteria:**
- **Given** Explore screen **When** Trending section loads **Then** I see an horizontal carousel of the 6-10 most booked experiences in the last 30 days
- **And** cards show a "🔥 X booked this week" badge

### Story 12.3: Create Hidden Gems Section
As a traveler seeking unique experiences, I want to discover lesser-known gems, so that I can have authentic local experiences.

**Acceptance Criteria:**
- **Given** Explore screen **When** Hidden Gems section loads **Then** I see carousel showing experiences with rating >= 4.5 and <50 bookings
- **And** cards display a "💎 Local Secret" badge in Golden Sand (#F4D03F)

### Story 12.4: Create Limited Availability Alerts
As a traveler, I want to see experiences with limited spots, so that I can book before they sell out.

**Acceptance Criteria:**
- **Given** Explore screen **When** Limited section loads **Then** experiences with <= 5 spots in the next 7 days appear
- **And** cards show "Only X spots left!" with urgency styling (pulsing badge)

### Story 12.5: Create Destination Guides Section
As a traveler planning a trip, I want to read curated destination guides, so that I can learn about different areas of Bali.

**Acceptance Criteria:**
- **Given** Explore screen **When** Destination Guides load **Then** I see a grid of cards (Ubud, Seminyak, Uluwatu, etc.)
- **When** tapped **Then** detailed guide page opens with overview, top experiences, and map

### Story 12.6: Create Traveler Stories Section
As a traveler seeking social proof, I want to read stories from other travelers, so that I can learn from their experiences.

**Acceptance Criteria:**
- **Given** Explore screen **When** Stories section loads **Then** I see story cards sourced from high-character reviews with photos
- **And** cards expandable to show the full story and link back to the experience
