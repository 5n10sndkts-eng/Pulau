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
