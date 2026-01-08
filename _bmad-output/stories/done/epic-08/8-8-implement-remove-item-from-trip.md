# Story 8.8: Implement Remove Item from Trip

Status: ready-for-dev

## Story

As a traveler,
I want to remove experiences from my trip,
So that I can change my plans.

## Acceptance Criteria

**AC #1: Reveal remove action**
**Given** I am viewing a trip item
**When** I swipe left on the item (mobile) or hover to reveal delete (desktop)
**Then** red "Remove" action appears

**AC #2: Remove item with animation and undo**
**When** I tap "Remove"
**Then** item is removed from trip_items
**And** item animates out (fade + slide)
**And** trip total recalculates
**And** toast displays "Removed from trip" with "Undo" action (5 seconds)
**When** I tap "Undo"
**Then** item is restored to trip

**AC #3: No confirmation modal required**
**And** no confirmation modal for removal (non-destructive, can re-add)

## Tasks / Subtasks

### Task 1: Implement swipe-to-delete on mobile (AC: #1)
- [ ] Add swipe gesture detection to TripItemCard (left swipe)
- [ ] Reveal red "Remove" button on swipe
- [ ] Use framer-motion drag constraints for smooth swipe
- [ ] Add threshold: swipe must exceed 60px to trigger
- [ ] Reset card position if swipe is released before threshold

### Task 2: Add hover delete button on desktop (AC: #1)
- [ ] Show trash icon button on card hover (desktop only)
- [ ] Position button in top-right or trailing edge of card
- [ ] Style with red/destructive color on hover
- [ ] Ensure button has 44x44px touch target
- [ ] Hide button when not hovering

### Task 3: Implement remove function (AC: #2)
- [ ] Create removeItem function in useTripManagement
- [ ] Remove item from trip.items array by ID
- [ ] Persist updated trip via useKV
- [ ] Store removed item temporarily for undo functionality
- [ ] Clear undo buffer after 5 seconds

### Task 4: Add removal animation (AC: #2)
- [ ] Animate item fade out (opacity 0) over 200ms
- [ ] Slide item left/right during fade
- [ ] Collapse item height to 0 after fade completes
- [ ] Update trip total with highlight animation
- [ ] Remove item from DOM after animation completes

### Task 5: Implement undo functionality with toast (AC: #2)
- [ ] Display toast: "Removed from trip" with "Undo" button
- [ ] Set toast duration to 5 seconds
- [ ] Store removed item in temporary undo buffer
- [ ] On "Undo" click: restore item to original position
- [ ] Animate item back in (reverse of removal animation)
- [ ] Clear undo buffer when toast closes

## Dev Notes

### Technical Guidance
- Swipe detection: use framer-motion `drag` with constraints or react-swipeable
- Undo mechanism: store removed item in React state temporarily
- Animation: Framer Motion's AnimatePresence for exit animations
- Toast: shadcn/ui Toast with action button
- No confirmation modal: follows mobile UX best practices for non-destructive actions

### Swipe Implementation
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(event, info) => {
    if (info.offset.x < -60) {
      showRemoveButton();
    }
  }}
>
  <TripItemCard />
</motion.div>
```

### Undo Buffer Pattern
```typescript
const [undoBuffer, setUndoBuffer] = useState<{item: TripItem, position: number} | null>(null);

const removeItem = (itemId: string) => {
  const item = trip.items.find(i => i.id === itemId);
  const position = trip.items.findIndex(i => i.id === itemId);

  setUndoBuffer({ item, position });
  updateTrip({ items: trip.items.filter(i => i.id !== itemId) });

  toast.info("Removed from trip", {
    action: { label: "Undo", onClick: () => undoRemove() },
    duration: 5000
  });

  setTimeout(() => setUndoBuffer(null), 5000);
};
```

### Animation Configuration
```typescript
const removeAnimation = {
  exit: {
    opacity: 0,
    x: -100,
    height: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};
```

### Visual Specifications
- Swipe reveal: red background, white trash icon, "Remove" text
- Remove button (desktop): 32px icon button, red on hover
- Toast position: bottom center on mobile, bottom right on desktop
- Animation timing: 200ms fade, 150ms collapse

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.8]
- [Source: prd/pulau-prd.md#Trip Canvas - Item Management]
- [Related: Story 8.10 - Real-Time Price Calculation]
- [Figma: Swipe-to-Delete Interaction]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
