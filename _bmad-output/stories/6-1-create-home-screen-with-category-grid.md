### Story 6.1: Create Home Screen with Category Grid

As a traveler,
I want to see experience categories on the home screen,
So that I can browse activities that interest me.

**Acceptance Criteria:**

**Given** I am logged in and on the home screen
**When** the screen loads
**Then** I see 6 category cards in a 2x3 grid (single column on mobile <640px):
  - Water Adventures (icon: Waves, background: ocean image)
  - Land Explorations (icon: Bicycle, background: rice terrace image)
  - Culture & Experiences (icon: Buildings, background: temple image)
  - Food & Nightlife (icon: ForkKnife, background: food image)
  - Getting Around (icon: Van, background: scooter image)
  - Destinations & Stays (icon: Bed, background: villa image)
**And** each card has icon, background image with gradient overlay, category name, and tagline
**When** I tap a category card
**Then** I navigate to the category browse screen for that category
**And** smooth slide transition animation plays (300ms ease-in-out)
**And** categories load from categories table (id, name, slug, icon, tagline, background_image_url)
