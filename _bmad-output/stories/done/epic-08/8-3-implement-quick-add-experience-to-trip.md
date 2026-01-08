# Story 8.3: Implement Quick Add Experience to Trip

Status: ready-for-dev

## Story

As a traveler bobjectsing experiences,
I want to quickly add activities to my trip,
So that I can build my itinerary without leaving the bobjectse view.

## Acceptance Criteria

**AC #1: Quick add button adds experience to trip**
**Given** I am viewing an experience card in any bobjectse context
**When** I tap "+ Quick Add" button
**Then** experience is added to my active trip as unscheduled item
**And** item flies to trip bar with animation (150ms ease-out)
**And** trip bar price updates immediately to include new item
**And** trip item record created: { experience_id, guest_count: 1, scheduled_date: null }
**And** toast displays "Added to trip"

**AC #2: Prevent duplicate additions**
**When** I tap Quick Add for an experience already in trip
**Then** toast displays "Already in your trip"
**And** no duplicate is created

## Tasks / Subtasks

### Task 1: Add Quick Add button to experience cards (AC: #1, #2)
- [ ] Add "+ Quick Add" button to ExperienceCard component
- [ ] Position button prominently (bottom of card or floating)
- [ ] Style with primary teal color and icon (Plus icon)
- [ ] Implement onClick handler calling addToTrip function
- [ ] Add duplicate check to disable/hide button if already in trip

### Task 2: Implement addToTrip function (AC: #1)
- [ ] Create addToTrip function in useTripManagement hook
- [ ] Generate new trip item with default values (guest_count: 1, scheduled_date: null)
- [ ] Add item to trip.items array
- [ ] Update trip.updated_at timestamp
- [ ] Persist changes via useKV

### Task 3: Create fly-to-trip-bar animation (AC: #1)
- [ ] Implement Framer Motion animation from card to trip bar
- [ ] Configure 150ms ease-out timing
- [ ] Create duplicate card element for animation (original stays in place)
- [ ] Animate position (x, y) and scale (shrink to 0.2)
- [ ] Remove animation element after completion

### Task 4: Update trip bar price in real-time (AC: #1)
- [ ] Trigger trip total recalculation on item add
- [ ] Update trip bar component to reflect new price
- [ ] Add highlight animation on price change (pulse effect)
- [ ] Update item count badge in trip bar
- [ ] Ensure price formats with currency symbol

### Task 5: Add toast notifications and duplicate handling (AC: #1, #2)
- [ ] Display "Added to trip" toast on successful addition
- [ ] Check for duplicates: `trip.items.some(item => item.experience_id === experienceId)`
- [ ] Show "Already in your trip" toast if duplicate detected
- [ ] Add loading state during addition (disable button, show spinner)
- [ ] Handle errors with "Failed to add" toast and retry option

## Dev Notes

### Technical Guidance
- Quick Add button should appear on all experience cards (bobjectse, search, detail, wishlist)
- Use `useTripManagement` hook: `const { addItem, isInTrip } = useTripManagement()`
- Duplicate check: `const isDuplicate = isInTrip(experienceId)`
- Animation: use Framer Motion's `motion.div` with `layoutId` for smooth transitions
- Trip bar should be a persistent component in app layout

### Component Integration Points
```typescript
// In ExperienceCard component
const { addItem, isInTrip } = useTripManagement();
const isDuplicate = isInTrip(experience.id);

const handleQuickAdd = async () => {
  if (isDuplicate) {
    toast.info("Already in your trip");
    return;
  }
  await addItem(experience.id);
  toast.success("Added to trip");
  triggerFlyAnimation();
};
```

### Animation Configuration
```typescript
const flyToTripBarAnimation = {
  initial: { scale: 1, x: 0, y: 0 },
  animate: {
    x: tripBarX - cardX,
    y: tripBarY - cardY,
    scale: 0.2,
    opacity: 0.6,
    transition: { duration: 0.15, ease: "easeOut" }
  }
};
```

### Button States
- Default: "+ Quick Add" (visible, enabled)
- Loading: "Adding..." (disabled, spinner)
- Already added: "In Trip" (disabled, checkmark icon) or hidden
- Error: "+ Quick Add" (re-enabled with error indicator)

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.3]
- [Source: prd/pulau-prd.md#Trip Canvas Building]
- [Related: Story 7.3 - Quick Add from Wishlist to Trip]
- [Related: Story 8.1 - Create Trip Data Model]
- [Figma: Experience Card with Quick Add Button]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
