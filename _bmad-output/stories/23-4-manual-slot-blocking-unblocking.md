# Story 23.4: Manual Slot Blocking/Unblocking

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **vendor**,
I want to manually block or unblock availability slots,
So that I can accommodate walk-in customers or close dates.

## Acceptance Criteria

1. **Given** I am viewing my availability calendar
   **When** I tap/click on an existing slot
   **Then** I can toggle "Block this slot" on/off
   **And** blocked slots show as "Unavailable" to travelers
   **And** I can add a reason for blocking (internal note)
   **And** blocking a slot does NOT cancel existing confirmed bookings

2. **Given** I have a walk-in customer
   **When** I add them via "Manual Walk-in" button
   **Then** `available_count` decreases by the guest count
   **And** a booking record is created with source = "walk_in"
   **And** real-time updates propagate to all connected clients

3. **Given** I want to unblock a previously blocked slot
   **When** I tap the blocked slot and toggle off
   **Then** the slot becomes available again
   **And** an audit log entry records the unblock action

## Tasks / Subtasks

- [ ] Task 1: Add block/unblock toggle to slot detail view (AC: #1, #3)
  - [ ] 1.1: Create SlotDetailModal component (shows when tapping existing slot)
  - [ ] 1.2: Display current slot status (available, blocked, sold out)
  - [ ] 1.3: Add block toggle switch with reason input
  - [ ] 1.4: Integrate with slotService.blockSlot() and slotService.unblockSlot()
  - [ ] 1.5: Show existing bookings on this slot (cannot be cancelled by blocking)

- [ ] Task 2: Visual indicators for blocked slots (AC: #1)
  - [ ] 2.1: Style blocked slots distinctly on calendar (e.g., strikethrough, gray)
  - [ ] 2.2: Show block reason tooltip on hover/tap
  - [ ] 2.3: Differentiate blocked vs sold out vs within cut-off

- [ ] Task 3: Implement manual walk-in feature (AC: #2)
  - [ ] 3.1: Add "Add Walk-in" button to slot detail modal
  - [ ] 3.2: Create WalkInGuestForm (guest count, optional contact info)
  - [ ] 3.3: Decrement availability using slotService.decrementAvailability()
  - [ ] 3.4: Create booking record with source = 'walk_in'
  - [ ] 3.5: Handle case when slot capacity is insufficient

- [ ] Task 4: Ensure blocking doesn't affect existing bookings (AC: #1)
  - [ ] 4.1: Display warning when blocking a slot with bookings
  - [ ] 4.2: Show list of existing bookings that will remain valid
  - [ ] 4.3: Confirm action before proceeding

## Dev Notes

### Architecture Patterns & Constraints

**slotService Integration:**
```typescript
// Block a slot
await slotService.blockSlot(slotId, 'Personal day - closed')

// Unblock a slot
await slotService.unblockSlot(slotId)

// Walk-in decrement
await slotService.decrementAvailability(slotId, guestCount)
```

**Walk-in Booking Record:**
```typescript
// Create booking with walk_in source
const walkInBooking = {
  experience_id: slot.experience_id,
  slot_id: slot.id,
  user_id: null,  // No user account for walk-ins
  guest_count: guestCount,
  source: 'walk_in',
  status: 'confirmed',
  total_amount: 0,  // Or cash amount if tracked
  traveler_name: contactInfo?.name || 'Walk-in Guest',
  traveler_email: contactInfo?.email || null,
}
```

**Blocking vs Existing Bookings:**
- `is_blocked = true` only prevents NEW bookings
- Existing confirmed bookings remain valid
- UI should clearly show "X confirmed bookings will not be affected"

**Real-time Updates:**
- After any mutation, trigger real-time broadcast (Phase 2 Epic 25)
- For now, ensure data refresh on save

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 23.4]
- Story 23.5: slotService module (blockSlot, unblockSlot, decrementAvailability)
- Story 23.1: Availability calendar (parent component)
- Epic 25: Real-time inventory updates (future integration)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)
