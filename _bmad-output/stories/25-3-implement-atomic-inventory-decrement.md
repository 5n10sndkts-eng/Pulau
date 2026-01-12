### Story 25.3: Implement Atomic Inventory Decrement

As a **platform operator**,
I want inventory decrements to be atomic,
So that concurrent bookings never cause overbooking.

**Acceptance Criteria:**

**Given** multiple users attempt to book the last available slot simultaneously
**When** the booking transactions execute
**Then** only ONE booking succeeds (the first to acquire the lock)
**And** other attempts receive "Slot no longer available" error
**And** the database uses SERIALIZABLE isolation or SELECT FOR UPDATE
**And** stress test with 10 concurrent requests shows 0 overbookings

---
