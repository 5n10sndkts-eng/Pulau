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
