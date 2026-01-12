## Epic 7: Wishlist & Saved Experiences

**Goal:** Users save favorite experiences to wishlist with heart icon toggle, view all saved items, and quickly add saved experiences to active trip plans.

### Story 7.1: Implement Heart Icon Save Toggle

As a traveler browsing experiences,
I want to tap a heart icon to save an experience,
So that I can quickly bookmark activities I'm interested in.

**Acceptance Criteria:**

**Given** I am viewing an experience card (in browse or detail view)
**When** I tap the heart icon
**Then** the heart animates with a "pop" effect (200ms bounce)
**And** heart fills with warm coral color (#FF6B6B)
**And** experience is saved to saved_experiences table (user_id, experience_id, saved_at)
**And** toast notification displays "Saved to wishlist"
**When** I tap the filled heart again
**Then** heart animates back to outline state
**And** record is removed from saved_experiences table
**And** toast displays "Removed from wishlist"
**And** saved state persists via Spark useKV for offline access

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

### Story 7.3: Quick Add from Wishlist to Trip

As a traveler viewing my wishlist,
I want to quickly add saved experiences to my current trip,
So that trip planning is fast and seamless.

**Acceptance Criteria:**

**Given** I am on the Saved/Wishlist screen
**When** I tap "Add to Trip" on a saved experience
**Then** experience is added to my current active trip (trip_items table)
**And** item "flies" animation toward trip bar (150ms ease-out)
**And** trip total price updates in real-time
**And** toast displays "Added to trip"
**And** experience remains in wishlist (not removed)
**When** the experience is already in my trip
**Then** button changes to "Already in Trip" (disabled state)
**And** no duplicate items can be added

---
