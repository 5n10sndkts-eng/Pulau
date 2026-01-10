# Story 25.3: Implement Atomic Inventory Decrement

Status: ready-for-dev

## Story

As a **platform operator**,
I want inventory decrements to be atomic,
So that concurrent bookings never cause overbooking.

## Acceptance Criteria

1. **Given** multiple users attempt to book the last available slot simultaneously
   **When** the booking transactions execute
   **Then** only ONE booking succeeds (the first to acquire the lock)
   **And** other attempts receive "Slot no longer available" error
   **And** the database uses SERIALIZABLE isolation or SELECT FOR UPDATE
   **And** stress test with 10 concurrent requests shows 0 overbookings

## Tasks / Subtasks

- [ ] Implement atomic inventory decrement in slotService (AC: 1)
  - [ ] Use PostgreSQL row-level locking with SELECT FOR UPDATE
  - [ ] Wrap decrement in database transaction
  - [ ] Check available_count > 0 before decrement
  - [ ] Return error if slot unavailable or already sold out
- [ ] Update create-booking edge function to use atomic decrement (AC: 1)
  - [ ] Call slotService.decrementInventory() before creating booking
  - [ ] Handle "slot unavailable" error from service
  - [ ] Roll back booking creation if decrement fails
  - [ ] Return clear error message to client
- [ ] Add concurrency stress test (AC: 1)
  - [ ] Create test script to simulate 10 concurrent booking requests
  - [ ] Target same slot with 1 available spot
  - [ ] Verify exactly 1 booking succeeds, 9 fail with error
  - [ ] Use Playwright or Vitest with concurrent test execution
  - [ ] Document test in README or test documentation
- [ ] Add error handling in checkout UI (AC: 1)
  - [ ] Display toast error when "Slot no longer available" returned
  - [ ] Suggest alternative time slots if available
  - [ ] Update UI to show slot as sold out
  - [ ] Implement graceful retry mechanism

## Dev Notes

### Architecture Patterns

**Database Concurrency Control:**
- PostgreSQL row-level locking prevents race conditions
- Use `SELECT FOR UPDATE` to lock row during transaction
- Alternative: Use SERIALIZABLE isolation level (higher overhead)
- NFR-CON-01 requirement: Handle 10 concurrent booking attempts with zero overbookings

**SQL Pattern:**
```sql
BEGIN;
SELECT available_count FROM experience_slots 
WHERE id = $1 FOR UPDATE;

UPDATE experience_slots 
SET available_count = available_count - 1
WHERE id = $1 AND available_count > 0
RETURNING available_count;
COMMIT;
```

**Service Layer Pattern:**
- Implement in `src/lib/slotService.ts` (created in Epic 23, Story 23.5)
- Function: `decrementInventory(slotId: string): Promise<ApiResponse<number>>`
- Return updated available_count or error if sold out
- Use Supabase transaction API or direct PostgreSQL client

### Code Quality Requirements

**TypeScript Patterns:**
- Use ApiResponse discriminated union pattern:
  ```typescript
  type ApiResponse<T> = 
    | { data: T; error: null }
    | { data: null; error: string }
  ```
- No `any` types - use strict slot and booking types
- Handle null/undefined from database queries

**Error Handling:**
- Return specific error messages: "Slot no longer available", "Slot not found", "Database error"
- Don't throw errors - return error in ApiResponse
- Log errors server-side for debugging
- Client displays user-friendly error with toast

**Transaction Management:**
- Use Supabase RPC for transactions or PostgreSQL client
- Ensure transaction rollback on any error
- Test transaction isolation with concurrent requests
- Verify no partial updates (booking created without inventory decrement)

### File Structure

**Files to Modify:**
- `src/lib/slotService.ts` - Add decrementInventory function
- `supabase/functions/create-booking/index.ts` - Call decrementInventory
- `src/components/checkout/PaymentScreen.tsx` - Handle sold out errors

**Database Schema:**
- Table: `experience_slots` (from Epic 21, Story 21.1)
- Columns: `id`, `experience_id`, `slot_time`, `capacity`, `available_count`
- Index on `id` for fast locking

### Testing Requirements

**Stress Test:**
- Use Vitest or Playwright to run concurrent requests
- Test script: `tests/concurrency/inventory-decrement.test.ts`
- Simulate 10 users booking same slot simultaneously
- Assert: 1 success, 9 failures, 0 overbookings
- Run test in CI/CD pipeline

**Manual Testing:**
- Open checkout in 2 browser windows for same slot with 1 spot left
- Complete payment in Window A
- Verify Window B shows "Slot no longer available" error
- Check database: available_count = 0, exactly 1 booking created

**Edge Cases:**
- Booking attempt when available_count = 0 (sold out)
- Network timeout during transaction (should rollback)
- Simultaneous bookings for different slots (should not interfere)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 25: Real-Time Inventory & Availability
- Implements NFR-CON-01: Atomic transactions for zero overbookings
- Works with Epic 24 (Traveler Payment & Checkout) for booking flow
- Depends on Epic 21 (experience_slots table) and Epic 23 (slotService module)

**Integration Points:**
- Integrates with Story 24.1 (checkout edge function)
- Works with Story 25.1 (realtime subscriptions) to update UI
- Coordinates with Story 24.2 (checkout review screen) for error display

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-25-Story-25.3]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-CON-01]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Concurrency-Patterns]
- [Source: project-context.md#Service-Layer-Pattern]
- [PostgreSQL Locking: https://www.postgresql.org/docs/current/explicit-locking.html]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
