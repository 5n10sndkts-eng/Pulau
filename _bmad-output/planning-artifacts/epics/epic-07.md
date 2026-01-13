# Epic 7: Wishlist & Saved Experiences

**Goal:** Users save favorite experiences to wishlist with heart icon toggle, view all saved items, and quickly add saved experiences to active trip plans.

**Phase:** Phase 1 (MVP)
**Dependencies:** Epic 1 (Foundation), Epic 6 (Discovery)
**Storage:** **Spark KV Store** (`pulau_users_{id}.wishlist`)

### Story 7.1: Implement Heart Icon Save Toggle

As a traveler browsing experiences, I want to tap a heart icon to save an experience, so that I can quickly bookmark activities I'm interested in.

**Acceptance Criteria:**

- **Given** viewing an experience card **When** I tap heart icon **Then** it animates with a "pop" effect and fills with coral
- **And** experience ID is saved to the user's record in **Spark useKV**
- **And** toast notification displays "Saved to wishlist"
- **When** I tap again **Then** it is removed from wishlist

### Story 7.2: Create Saved/Wishlist Screen

As a traveler, I want to view all my saved experiences in one place, so that I can easily revisit and compare options.

**Acceptance Criteria:**

- **Given** I tap the "Saved" tab **When** screen loads **Then** I see all my saved experiences sorted by date DESC
- **And** cards have heart icons and "Add to Trip" buttons
- **When** wishlist is empty **Then** it shows an empty state with a "Start exploring" button

### Story 7.3: Quick Add from Wishlist to Trip

As a traveler viewing my wishlist, I want to quickly add saved experiences to my current trip, so that trip planning is fast and seamless.

**Acceptance Criteria:**

- **Given** wishlist screen **When** I tap "Add to Trip" **Then** it is added to the active trip items
- **And** "fly" animation goes toward the trip bar
- **And** toast displays "Added to trip"
- **When** already in trip **Then** button shows "Already in Trip" (disabled)
