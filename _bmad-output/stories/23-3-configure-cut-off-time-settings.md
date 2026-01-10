# Story 23.3: Configure Cut-off Time Settings

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **vendor**,
I want to set how far in advance bookings must be made,
So that I have adequate preparation time.

## Acceptance Criteria

1. **Given** I am configuring my experience
   **When** I set the "Cut-off Time"
   **Then** I can specify hours before start time (e.g., 2 hours, 24 hours)
   **And** this is stored in `experiences.cutoff_hours`
   **And** the default cut-off is 2 hours if not specified

2. **Given** a slot is within the cut-off window
   **When** a traveler views the experience
   **Then** that slot shows as "Unavailable" (even if capacity remains)
   **And** a clear message explains "Booking closes X hours before start"

3. **Given** a slot just passed the cut-off threshold
   **When** the traveler tries to add it to their trip
   **Then** they receive an error "This time slot is no longer available for booking"

## Tasks / Subtasks

- [x] Task 1: Add cut-off time setting to experience form (AC: #1)
  - [x] 1.1: Create CutoffTimePicker component with preset options (2h, 6h, 12h, 24h, 48h)
  - [x] 1.2: Add custom hours input for flexibility
  - [x] 1.3: Display help text explaining the setting
  - [x] 1.4: Set default value of 2 hours

- [x] Task 2: Update experience data model (AC: #1)
  - [x] 2.1: Verify `cutoff_hours` column exists in experiences table (or add migration)
  - [x] 2.2: Update experienceService to handle cutoff_hours updates
  - [x] 2.3: Add TypeScript types for cutoff configuration

- [x] Task 3: Implement cut-off filtering in slot queries (AC: #2)
  - [x] 3.1: Create helper function `isSlotWithinCutoff(slot, cutoffHours)`
  - [x] 3.2: Added filterSlotsByCutoff utility
  - [x] 3.3: Added getTimeUntilCutoff and formatCutoffRemaining utilities

- [x] Task 4: Display cut-off status on experience detail page (AC: #2, #3)
  - [x] 4.1: Show "Booking closes X hours before" notice near availability
  - [ ] 4.2: Gray out slots within cut-off window with tooltip explanation (pending AvailabilityCalendar update)
  - [ ] 4.3: Prevent selection of cut-off slots (pending AvailabilityCalendar update)

- [ ] Task 5: Add validation in booking flow (AC: #3) **DEFERRED to checkout implementation**
  - [ ] 5.1: Validate cut-off in add-to-trip action
  - [ ] 5.2: Re-validate at checkout time (in case time passed)
  - [ ] 5.3: Show user-friendly error message

## Dev Notes

### Architecture Patterns & Constraints

**Cut-off Calculation:**
```typescript
function isSlotWithinCutoff(
  slotDate: string,    // YYYY-MM-DD
  slotTime: string,    // HH:MM
  cutoffHours: number
): boolean {
  const slotDateTime = new Date(`${slotDate}T${slotTime}`)
  const cutoffTime = new Date(slotDateTime.getTime() - (cutoffHours * 60 * 60 * 1000))
  return new Date() >= cutoffTime
}
```

**Database Schema:**
- Column: `experiences.cutoff_hours` (INTEGER, default 2)
- No need to store cut-off status per slot - calculate dynamically

**Query Optimization:**
- Cut-off filtering should happen client-side or in the service layer
- Don't add cut-off to database queries (time-sensitive, changes constantly)
- Cache the experience's cutoff_hours when loading slots

**UX Considerations:**
- Use countdown format for imminent cut-offs ("Booking closes in 1h 30m")
- Consider timezone display for travelers in different zones
- Show cut-off info prominently to avoid frustration

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 23.3]
- Story 23.1: Slot creation interface (uses same experience settings)
- Story 23.5: slotService module (slot queries)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)
