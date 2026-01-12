### Story 23.4: Manual Slot Blocking/Unblocking

As a **vendor**,
I want to manually block or unblock availability slots,
So that I can accommodate walk-in customers or close dates.

**Acceptance Criteria:**

**Given** I am viewing my availability calendar
**When** I tap/click on an existing slot
**Then** I can toggle "Block this slot" on/off
**And** blocked slots show as "Unavailable" to travelers
**And** I can add a reason for blocking (internal note)
**And** blocking a slot does NOT cancel existing confirmed bookings

**Given** I have a walk-in customer
**When** I add them via "Manual Walk-in" button
**Then** `available_count` decreases by the guest count
**And** a booking record is created with source = "walk_in"
**And** real-time updates propagate to all connected clients

---
