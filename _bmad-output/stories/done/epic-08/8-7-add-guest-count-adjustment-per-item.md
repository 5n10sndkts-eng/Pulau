# Story 8.7: Add Guest Count Adjustment per Item

Status: done

## Story

As a traveler,
I want to adjust guest count for each experience in my trip,
So that pricing reflects my actual group size.

## Acceptance Criteria

**AC #1: Display guest count stepper**
**Given** I am viewing a trip item in the builder
**When** I tap the guest count
**Then** a stepper control appears (- 1 +)
**And** minimum is 1 guest, maximum is experience.group_size_max

**AC #2: Update pricing on guest count change**
**When** I adjust guest count
**Then** item price updates: experience.price × new_guest_count
**And** trip total updates immediately
**And** trip_items.guest_count persists to storage
**And** guest count displays as "2 guests" format

## Tasks / Subtasks

### Task 1: Create GuestCountStepper component (AC: #1)

- [x] Build stepper UI with minus, count display, and plus buttons
- [x] Style buttons with circular design and borders
- [x] Disable minus button when count is 1 (minimum)
- [x] Disable plus button when count reaches experience.group_size_max
- [x] Add 44x44px touch target for mobile accessibility

### Task 2: Implement increment and decrement handlers (AC: #1, #2)

- [x] Create handleIncrement function checking max limit
- [x] Create handleDecrement function checking min limit (1)
- [x] Update trip item's guest_count in state
- [x] Persist change via useTripManagement.updateTripItem
- [x] Add haptic feedback on button tap (mobile)

### Task 3: Integrate stepper into TripItemCard (AC: #1, #2)

- [x] Add GuestCountStepper to TripItemCard component
- [x] Position stepper near price display
- [x] Make stepper inline-ediKV namespace (click to show stepper)
- [x] Show guest count as text when not editing
- [x] Format display: "1 guest" or "2 guests" (singular/plural)

### Task 4: Update item price calculation (AC: #2)

- [x] Calculate item price: experience.price × guest_count
- [x] Display calculated price on TripItemCard
- [x] Add visual highlight animation when price changes
- [x] Format price with currency symbol (e.g., "$90.00")
- [x] Update immediately on guest count change (no debounce)

### Task 5: Trigger trip total recalculation (AC: #2)

- [x] Listen for guest_count changes in useTripManagement
- [x] Recalculate trip total: SUM(all item prices)
- [x] Update TripFooter total display
- [x] Add pulse animation to total when it changes
- [x] Ensure all price displays sync instantly

## Dev Notes

### Technical Guidance

- Stepper component: can use shadcn/ui or custom implementation
- Guest count limits: fetch from experience.group_size_max (default 10 if not set)
- Price calculation: always use current guest_count from trip item state
- Persistence: auto-save on every change (no explicit save button)
- Format helper: `${count} ${count === 1 ? 'guest' : 'guests'}`

### Component Structure

```typescript
<TripItemCard>
  <ItemHeader />
  <ItemDetails />
  <GuestCountStepper
    count={item.guest_count}
    min={1}
    max={experience.group_size_max}
    onIncrement={handleIncrement}
    onDecrement={handleDecrement}
  />
  <ItemPrice amount={experience.price * item.guest_count} />
</TripItemCard>
```

### Price Calculation Logic

```typescript
const calculateItemPrice = (item: TripItem, experience: Experience): number => {
  return experience.price * item.guest_count;
};

const calculateTripTotal = (trip: Trip, experiences: Experience[]): number => {
  return trip.items.reduce((total, item) => {
    const experience = experiences.find((exp) => exp.id === item.experience_id);
    return total + (experience ? calculateItemPrice(item, experience) : 0);
  }, 0);
};
```

### Stepper Styling

- Button size: 32px diameter
- Icon size: 16px
- Active button: teal background
- Disabled button: gray background, 50% opacity
- Count display: 14px font, medium weight

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.7]
- [Source: prd/pulau-prd.md#Trip Canvas - Guest Count]
- [Related: Story 8.10 - Real-Time Price Calculation Display]
- [Figma: Guest Count Stepper Component]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
