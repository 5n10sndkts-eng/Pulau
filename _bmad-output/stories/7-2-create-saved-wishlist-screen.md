### Story 7.2: Create Saved/Wishlist Screen

As a traveler,
I want to view all my saved experiences in one place,
So that I can easily revisit and compare options.

**Acceptance Criteria:**

**Given** I tap the "Saved" tab in bottom navigation (Heart icon)
**When** the Saved screen loads
**Then** I see all my saved experiences displayed as cards
**And** cards show: hero image, title, price, rating, saved date
**And** cards are sorted by saved_at DESC (most recent first)
**And** each card has heart icon (filled) and "Add to Trip" button
**And** list loads from saved_experiences table joined with experiences
**When** I have no saved experiences
**Then** empty state displays: heart illustration, "Your wishlist is empty", "Start exploring" CTA button
**And** CTA navigates to home screen
