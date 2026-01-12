### Story 18.3: Implement Quick Add Category Modal

As a traveler,
I want quick access to categories from anywhere,
So that I can add experiences without extra navigation.

**Acceptance Criteria:**

**Given** I tap the Quick Add tab (center plus icon)
**When** the modal opens
**Then** bottom sheet slides up with category grid:
  - 6 category cards (same as home screen)
  - "Quick Add to Trip" header
  - Drag handle at top
  - Tap outside or swipe down to dismiss
**When** I tap a category
**Then** modal dismisses
**And** I navigate to that category's browse screen
**And** browse screen has "Back to Trip" in header (returns to trip builder)
