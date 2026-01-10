# Story 25.2: Create Real-Time Service Module

Status: ready-for-dev

## Story

As a **developer**,
I want a `realtimeService.ts` module,
So that Supabase Realtime subscriptions are managed consistently.

## Acceptance Criteria

1. **Given** the realtimeService module exists
   **When** used throughout the application
   **Then** it provides functions for:
   - `subscribeToSlotAvailability(experienceId, callback)` - Watch slot changes
   - `subscribeToBookingStatus(bookingId, callback)` - Watch booking updates
   - `unsubscribe(subscriptionId)` - Clean up subscription
   - `unsubscribeAll()` - Clean up all subscriptions
   **And** subscriptions use Supabase Realtime channels
   **And** reconnection is handled automatically
   **And** TypeScript types for callback payloads are provided

## Tasks / Subtasks

- [ ] Create realtimeService.ts module (AC: 1)
  - [ ] Create file at `src/lib/realtimeService.ts`
  - [ ] Import Supabase client from existing supabaseClient module
  - [ ] Define TypeScript interfaces for subscription callbacks
  - [ ] Implement subscription tracking with Map<string, RealtimeChannel>
- [ ] Implement subscribeToSlotAvailability function (AC: 1)
  - [ ] Accept experienceId and callback parameters
  - [ ] Create Supabase channel for experience_slots table
  - [ ] Filter changes by experience_id
  - [ ] Return unique subscription ID
  - [ ] Add to subscription tracking map
- [ ] Implement subscribeToBookingStatus function (AC: 1)
  - [ ] Accept bookingId and callback parameters
  - [ ] Create Supabase channel for bookings table
  - [ ] Filter changes by booking ID
  - [ ] Return unique subscription ID
  - [ ] Add to subscription tracking map
- [ ] Implement unsubscribe and unsubscribeAll functions (AC: 1)
  - [ ] Remove channel from Supabase
  - [ ] Remove from subscription tracking map
  - [ ] Handle edge case of non-existent subscription ID gracefully
- [ ] Add comprehensive TypeScript types (AC: 1)
  - [ ] Define SlotAvailabilityPayload type
  - [ ] Define BookingStatusPayload type
  - [ ] Define SubscriptionCallback generic type
  - [ ] Export all types for use in components

## Dev Notes

### Architecture Patterns

**Service Layer Pattern:**
- Follows existing service layer pattern: `src/lib/*Service.ts`
- Centralizes Supabase Realtime logic to prevent code duplication
- Similar to `paymentService.ts`, `slotService.ts`, `auditService.ts`
- All Realtime channel management goes through this service

**Subscription Management:**
- Use JavaScript Map to track active subscriptions: `Map<subscriptionId, RealtimeChannel>`
- Generate unique subscription IDs using `crypto.randomUUID()` or incrementing counter
- Provide centralized cleanup to prevent memory leaks
- Auto-reconnection is handled by Supabase client (no custom logic needed)

**API Design:**
```typescript
// Example usage in components:
const subId = await subscribeToSlotAvailability(experienceId, (payload) => {
  setAvailableCount(payload.new.available_count)
})

// Cleanup on unmount:
useEffect(() => {
  return () => unsubscribe(subId)
}, [subId])
```

### Code Quality Requirements

**TypeScript Patterns:**
- Strict null checks enabled - handle null/undefined gracefully
- Use generic types for callback payloads: `SubscriptionCallback<T>`
- Import Supabase types: `RealtimeChannel`, `RealtimePostgresChangesPayload`
- No `any` types - use proper discriminated unions for payloads

**Error Handling:**
- Return `{ data: subscriptionId, error: null }` or `{ data: null, error: string }` pattern
- Handle Supabase channel creation failures
- Log errors to console for debugging but don't throw
- Gracefully handle unsubscribe of non-existent subscription

**Subscription Lifecycle:**
- Track all active subscriptions in module-level Map
- Provide cleanup function for React components
- Test subscription cleanup with React DevTools Profiler

### File Structure

**Files to Create:**
- `src/lib/realtimeService.ts` - New service module

**Files to Reference:**
- `src/lib/supabaseClient.ts` - Import Supabase client
- `src/lib/types.ts` - Import/export types (ExperienceSlot, Booking)
- Other service files for pattern reference: `src/lib/experienceService.ts`, `src/lib/bookingService.ts`

**TypeScript Types to Define:**
```typescript
export type SlotAvailabilityPayload = {
  experienceId: string
  slotId: string
  availableCount: number
  capacity: number
  slotTime: string
}

export type BookingStatusPayload = {
  bookingId: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'refunded'
  updatedAt: string
}

export type SubscriptionCallback<T> = (payload: T) => void

export type SubscriptionResponse = 
  | { data: string; error: null }  // subscriptionId
  | { data: null; error: string }
```

### Testing Requirements

**Manual Testing:**
- Call subscribeToSlotAvailability from console
- Verify callback fires when database changes
- Test unsubscribe and verify callback stops firing
- Test unsubscribeAll and verify all subscriptions cleared

**Edge Cases:**
- Unsubscribe with invalid subscription ID (should not throw)
- Multiple subscriptions to same experience (should work independently)
- Network disconnection (Supabase client handles reconnection)

### Project Structure Notes

**Alignment with Architecture:**
- Part of ARCH-SVC-03: Create `realtimeService.ts` for subscription management
- Follows service layer pattern defined in architecture
- Works with Epic 25: Real-Time Inventory & Availability

**Integration Points:**
- Used by Story 25.1 (Supabase Realtime Subscriptions)
- Used by Story 25.5 (Display Real-Time Slot Availability)
- May be used by future stories for other real-time features
- Integrates with existing Supabase client setup from Epic 20

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-25-Story-25.2]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Service-Layer-Extensions]
- [Source: project-context.md#Backend-Integration-Rules]
- [Source: project-context.md#Service-Layer-Pattern]
- [Supabase Realtime Documentation: https://supabase.com/docs/guides/realtime]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
