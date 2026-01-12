### Story 24.5: Create Booking Confirmation Edge Function

As a **platform operator**,
I want a `create-booking` Edge Function,
So that bookings are atomically created with inventory decrements.

**Acceptance Criteria:**

**Given** payment is successful
**When** `create-booking` Edge Function is called
**Then** it executes in a database transaction:
  - Acquires row-level lock on affected slots (SELECT FOR UPDATE)
  - Verifies availability hasn't changed
  - Creates booking records with status = 'confirmed'
  - Decrements `available_count` for each slot
  - If any slot is unavailable, entire transaction rolls back
**And** returns confirmation numbers
**And** creates audit log for each booking

---
