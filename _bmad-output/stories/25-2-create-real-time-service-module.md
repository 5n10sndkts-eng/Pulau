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
