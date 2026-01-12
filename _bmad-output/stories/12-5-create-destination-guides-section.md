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
