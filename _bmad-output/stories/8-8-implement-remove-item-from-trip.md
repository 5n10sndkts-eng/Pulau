### Story 8.8: Implement Remove Item from Trip

As a traveler,
I want to remove experiences from my trip,
So that I can change my plans.

**Acceptance Criteria:**

**Given** I am viewing a trip item
**When** I swipe left on the item (mobile) or hover to reveal delete (desktop)
**Then** red "Remove" action appears
**When** I tap "Remove"
**Then** item is removed from trip_items
**And** item animates out (fade + slide)
**And** trip total recalculates
**And** toast displays "Removed from trip" with "Undo" action (5 seconds)
**When** I tap "Undo"
**Then** item is restored to trip
**And** no confirmation modal for removal (non-destructive, can re-add)
