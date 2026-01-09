# Story 23.2: Implement Instant Book vs Request Policy

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **vendor**,
I want to choose between "Instant Book" and "Request to Book" policies,
So that I can control how reservations are confirmed.

## Acceptance Criteria

1. **Given** I am managing my experience settings
   **When** I configure booking policy
   **Then** I can select:
     - "Instant Book" - Bookings are confirmed immediately upon payment
     - "Request to Book" - I must approve each booking request within 24 hours
   **And** the policy is saved to `experiences.instant_book_enabled`
   **And** "Instant Book" is only available if my vendor status is BANK_LINKED or ACTIVE

2. **Given** an experience has "Request to Book" policy
   **When** a traveler requests a booking
   **Then** the slot is temporarily held for 24 hours
   **And** I receive a notification to approve/decline
   **And** payment is only captured upon my approval

3. **Given** my vendor status is below BANK_LINKED
   **When** I try to enable "Instant Book"
   **Then** I see a message explaining I need to complete payment setup first
   **And** the toggle is disabled

## Tasks / Subtasks

- [ ] Task 1: Add booking policy toggle to experience settings (AC: #1, #3)
  - [ ] 1.1: Create BookingPolicyToggle component
  - [ ] 1.2: Display current policy setting
  - [ ] 1.3: Check vendor onboarding state for eligibility
  - [ ] 1.4: Show disabled state with explanation for ineligible vendors

- [ ] Task 2: Update experience data model (AC: #1)
  - [ ] 2.1: Ensure `instant_book_enabled` column exists in experiences table
  - [ ] 2.2: Update experienceService to handle policy updates
  - [ ] 2.3: Add TypeScript types for booking policy

- [ ] Task 3: Implement slot hold mechanism for Request to Book (AC: #2)
  - [ ] 3.1: Add `held_until` column or use existing is_blocked with metadata
  - [ ] 3.2: Create function to temporarily hold slot capacity
  - [ ] 3.3: Create function to release held capacity after 24h expiry
  - [ ] 3.4: Create function to confirm held booking on vendor approval

- [ ] Task 4: Display booking policy on experience detail page (AC: #1)
  - [ ] 4.1: Show "Instant Confirmation" badge for instant book experiences
  - [ ] 4.2: Show "Request to Book" indicator for approval-required experiences

## Dev Notes

### Architecture Patterns & Constraints

**Vendor State Gating:**
```typescript
const canEnableInstantBook = (vendorState: VendorOnboardingStateValue): boolean => {
  return ['bank_linked', 'active'].includes(vendorState)
}
```

**Request to Book Flow:**
1. Traveler selects slot → System holds capacity (decrement available_count)
2. Payment intent created but NOT captured (authorize only)
3. Vendor has 24h to approve/decline
4. Approval → Capture payment, confirm booking
5. Decline/Expire → Release hold, cancel payment intent

**Database Considerations:**
- May need a `booking_requests` table for pending approvals
- Or use `bookings` table with status = 'pending_approval'
- Store `held_until` timestamp for auto-expiry

**Note on Phase 2 Scope:**
The Request to Book flow requires payment hold/capture mechanics from Epic 24.
For MVP, focus on the policy toggle UI and Instant Book path. Request to Book approval flow can be stubbed or deferred to after Epic 24 checkout is complete.

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 23.2]
- Story 22.4: Vendor onboarding state machine
- Story 23.5: slotService module
- Epic 24: Payment/checkout (dependency for capture flow)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)
