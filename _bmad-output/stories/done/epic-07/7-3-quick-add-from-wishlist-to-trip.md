# Story 7.3: Quick Add from Wishlist to Trip

Status: ready-for-dev

## Story

As a traveler viewing my wishlist,
I want to quickly add saved experiences to my current trip,
So that trip planning is fast and seamless.

## Acceptance Criteria

**AC #1: Add to trip from wishlist**
**Given** I am on the Saved/Wishlist screen
**When** I tap "Add to Trip" on a saved experience
**Then** experience is added to my current active trip (trip_items KV namespace)
**And** item "flies" animation toward trip bar (150ms ease-out)
**And** trip total price updates in real-time
**And** toast displays "Added to trip"
**And** experience remains in wishlist (not removed)

**AC #2: Prevent duplicate additions**
**When** the experience is already in my trip
**Then** button changes to "Already in Trip" (disabled state)
**And** no duplicate items can be added

## Tasks / Subtasks

### Task 1: Implement "Add to Trip" button in SavedExperienceCard (AC: #1, #2)
- [ ] Add "Add to Trip" button to SavedExperienceCard component
- [ ] Style button with primary teal color and full width
- [ ] Add onClick handler that calls addToTrip function
- [ ] Implement duplicate check to show "Already in Trip" state
- [ ] Disable button styling when experience already in trip

### Task 2: Create addToTrip function with trip integration (AC: #1)
- [ ] Implement addToTrip function in useTripManagement hook
- [ ] Add new trip_item record: { experience_id, guest_count: 1, scheduled_date: null }
- [ ] Update trip items array in useKV persistence
- [ ] Handle null safety for trip data (use default trip if none exists)
- [ ] Add error handling for failed additions

### Task 3: Implement fly-to-trip animation (AC: #1)
- [ ] Create Framer Motion animation for experience card to trip bar
- [ ] Configure animation: 150ms ease-out timing
- [ ] Calculate trajectory from card position to trip bar/footer
- [ ] Add scaling effect (shrink as it flies)
- [ ] Ensure animation doesn't block UI interaction

### Task 4: Update trip total price in real-time (AC: #1)
- [ ] Trigger price recalculation when item added
- [ ] Update trip bar/footer to show new total
- [ ] Add visual highlight animation on price change
- [ ] Format price with currency symbol (e.g., "$125.00")
- [ ] Update item count badge in trip bar

### Task 5: Add toast notifications and button state management (AC: #1, #2)
- [ ] Display "Added to trip" toast on successful addition
- [ ] Update button state to "Already in Trip" after addition
- [ ] Ensure button state syncs across all instances of same experience
- [ ] Add loading state during addition process
- [ ] Handle edge case when trip is at capacity (if limit exists)

## Dev Notes

### Technical Guidance
- Use shared `useTripManagement` hook for trip operations
- Trip data structure: `const [trip, setTrip] = useKV<Trip>('current_trip', defaultTrip)`
- Null safety pattern: `const safeTrip = trip || defaultTrip`
- Button state should check: `const isInTrip = trip?.items.some(item => item.experience_id === experience.id)`
- Fly animation library: Framer Motion's `motion.div` with `animate` prop

### Data Structure
```typescript
interface TripItem {
  id: string;
  trip_id: string;
  experience_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  guest_count: number;
  notes: string | null;
  created_at: string;
}
```

### Animation Configuration
```typescript
const flyAnimation = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    x: targetX,
    y: targetY,
    scale: 0.3,
    opacity: 0.8,
    transition: { duration: 0.15, ease: "easeOut" }
  }
}
```

### Button States
- Default: "Add to Trip" (primary teal, enabled)
- Loading: "Adding..." (disabled, spinner icon)
- Already added: "Already in Trip" (gray, disabled, checkmark icon)
- Error: "Try Again" (secondary, enabled)

## References

- [Source: planning-artifacts/epics/epic-07.md#Epic 7, Story 7.3]
- [Source: prd/pulau-prd.md#Wishlist & Trip Canvas Integration]
- [Related: Story 7.2 - Create Saved/Wishlist Screen]
- [Related: Story 8.3 - Implement Quick Add Experience to Trip]
- [Figma: Add to Trip Button States]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
