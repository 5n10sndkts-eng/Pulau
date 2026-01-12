### Story 8.7: Add Guest Count Adjustment per Item

As a traveler,
I want to adjust guest count for each experience in my trip,
So that pricing reflects my actual group size.

**Acceptance Criteria:**

**Given** I am viewing a trip item in the builder
**When** I tap the guest count
**Then** a stepper control appears (- 1 +)
**And** minimum is 1 guest, maximum is experience.group_size_max
**When** I adjust guest count
**Then** item price updates: experience.price × new_guest_count
**And** trip total updates immediately
**And** trip_items.guest_count persists to storage
**And** guest count displays as "2 guests" format
