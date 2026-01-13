## Epic 25: Real-Time Inventory & Availability

Travelers see live availability updates; bookings automatically decrement inventory with zero overbookings.

### Story 25.1: Implement Supabase Realtime Subscriptions

As a **traveler**,
I want to see availability update in real-time,
So that I know the current booking status without refreshing.

**Acceptance Criteria:**

**Given** I am viewing an experience detail page
**When** another user books a slot I'm viewing
**Then** the availability count updates within 500ms
**And** if a slot becomes sold out, the UI updates immediately
**And** I see a subtle animation indicating the change
**And** subscription is automatically cleaned up when I leave the page

---

### Story 25.2: Create Real-Time Service Module

As a **developer**,
I want a `realtimeService.ts` module,
So that Supabase Realtime subscriptions are managed consistently.

**Acceptance Criteria:**

**Given** the realtimeService module exists
**When** used throughout the application
**Then** it provides functions for:

- `subscribeToSlotAvailability(experienceId, callback)` - Watch slot changes
- `subscribeToBookingStatus(bookingId, callback)` - Watch booking updates
- `unsubscribe(subscriptionId)` - Clean up subscription
- `unsubscribeAll()` - Clean up all subscriptions
  **And** subscriptions use Supabase Realtime channels
  **And** reconnection is handled automatically
  **And** TypeScript types for callback payloads are provided

---

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

### Story 25.4: Add Instant Confirmation Filter

As a **traveler**,
I want to filter experiences by "Instant Confirmation",
So that I can find experiences that confirm immediately.

**Acceptance Criteria:**

**Given** I am browsing experiences
**When** I enable the "Instant Confirmation" filter
**Then** only experiences with `instant_book_enabled = true` are shown
**And** each result shows an "Instant" badge
**And** the filter is available on search results and category browse screens

---

### Story 25.5: Display Real-Time Slot Availability

As a **traveler**,
I want to see how many spots are left for each time slot,
So that I can make informed booking decisions.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I view available time slots
**Then** each slot shows:

- Time (e.g., "10:00 AM")
- Available count (e.g., "5 spots left")
- Price (or "From $X")
- Visual indicator for low availability (< 3 spots)
  **And** sold out slots are shown but disabled
  **And** availability updates in real-time via subscription

---
