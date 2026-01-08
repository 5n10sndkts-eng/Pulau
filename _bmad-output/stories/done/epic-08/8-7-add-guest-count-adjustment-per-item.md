# Story 8.7: Add Guest Count Adjustment per Item

Status: ready-for-dev

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
- [ ] Build stepper UI with minus, count display, and plus buttons
- [ ] Style buttons with circular design and borders
- [ ] Disable minus button when count is 1 (minimum)
- [ ] Disable plus button when count reaches experience.group_size_max
- [ ] Add 44x44px touch target for mobile accessibility

### Task 2: Implement increment and decrement handlers (AC: #1, #2)
- [ ] Create handleIncrement function checking max limit
- [ ] Create handleDecrement function checking min limit (1)
- [ ] Update trip item's guest_count in state
- [ ] Persist change via useTripManagement.updateTripItem
- [ ] Add haptic feedback on button tap (mobile)

### Task 3: Integrate stepper into TripItemCard (AC: #1, #2)
- [ ] Add GuestCountStepper to TripItemCard component
- [ ] Position stepper near price display
- [ ] Make stepper inline-ediKV namespace (click to show stepper)
- [ ] Show guest count as text when not editing
- [ ] Format display: "1 guest" or "2 guests" (singular/plural)

### Task 4: Update item price calculation (AC: #2)
- [ ] Calculate item price: experience.price × guest_count
- [ ] Display calculated price on TripItemCard
- [ ] Add visual highlight animation when price changes
- [ ] Format price with currency symbol (e.g., "$90.00")
- [ ] Update immediately on guest count change (no debounce)

### Task 5: Trigger trip total recalculation (AC: #2)
- [ ] Listen for guest_count changes in useTripManagement
- [ ] Recalculate trip total: SUM(all item prices)
- [ ] Update TripFooter total display
- [ ] Add pulse animation to total when it changes
- [ ] Ensure all price displays sync instantly

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
    const experience = experiences.find(exp => exp.id === item.experience_id);
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

### Debug Log References

### Completion Notes List

### File List
