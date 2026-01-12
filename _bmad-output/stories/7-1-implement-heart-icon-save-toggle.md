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
