## Epic 23: Vendor Availability Management

Vendors can create, manage, and control time-based availability slots for their experiences.

### Story 23.1: Build Slot Creation Interface

As a **vendor**,
I want to create availability slots for my experiences,
So that travelers can see when my experience is available.

**Acceptance Criteria:**

**Given** I am editing one of my experiences
**When** I navigate to the "Availability" tab
**Then** I see a calendar view of the current month
**And** I can click a date to add time slots
**And** for each slot I can set:
  - Start time
  - Duration (auto-calculated end time)
  - Capacity (number of guests)
  - Price override (optional, defaults to experience base price)
**And** I can create recurring slots (e.g., "Every Monday at 9 AM")

---

### Story 23.2: Implement Instant Book vs Request Policy

As a **vendor**,
I want to choose between "Instant Book" and "Request to Book" policies,
So that I can control how reservations are confirmed.

**Acceptance Criteria:**

**Given** I am managing my experience settings
**When** I configure booking policy
**Then** I can select:
  - "Instant Book" - Bookings are confirmed immediately upon payment
  - "Request to Book" - I must approve each booking request within 24 hours
**And** the policy is saved to `experiences.instant_book_enabled`
**And** "Instant Book" is only available if my vendor status is BANK_LINKED or ACTIVE

**Given** an experience has "Request to Book" policy
**When** a traveler requests a booking
**Then** the slot is temporarily held for 24 hours
**And** I receive a notification to approve/decline
**And** payment is only captured upon my approval

---

### Story 23.3: Configure Cut-off Time Settings

As a **vendor**,
I want to set how far in advance bookings must be made,
So that I have adequate preparation time.

**Acceptance Criteria:**

**Given** I am configuring my experience
**When** I set the "Cut-off Time"
**Then** I can specify hours before start time (e.g., 2 hours, 24 hours)
**And** this is stored in `experiences.cutoff_hours`
**And** slots within the cut-off window show as "Unavailable" to travelers
**And** the default cut-off is 2 hours if not specified

---

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

### Story 23.5: Create Slot Service Module

As a **developer**,
I want a `slotService.ts` module,
So that slot CRUD operations are centralized and type-safe.

**Acceptance Criteria:**

**Given** the slotService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `createSlot(experienceId, slotData)` - Create new slot
  - `updateSlot(slotId, updates)` - Update slot details
  - `blockSlot(slotId, reason?)` - Mark slot as blocked
  - `unblockSlot(slotId)` - Remove block
  - `getAvailableSlots(experienceId, dateRange)` - Query available slots
  - `decrementAvailability(slotId, count)` - Atomic decrement with locking
**And** all mutations create appropriate audit log entries
**And** TypeScript types match the database schema

---
