# Story 33.3: Quick Add Interaction Loop

Status: ready-for-dev

## Story

As a **Planner**,
I want to **add experiences to my trip with a single tap and receiving instant visual feedback**,
So that **I can build my itinerary efficiently without navigating back and forth between screens.**

## Acceptance Criteria

### AC 1: Quick Add Button Presence

**Given** I am viewing a list of experiences (Home Feed, Category, or Search)
**Then** every experience card should have a clear, thumb-accessible "+" button or "Add" icon
**And** it should be positioned to not interfere with the main "View Details" tap area

### AC 2: Instant State Change (Optimistic UI)

**Given** I tap the "Add" button
**Then** the button should immediately toggle to a "Added" state (e.g., Green Checkmark)
**And** the UI should not block or show a spinner while saving to the store

### AC 3: The "Ghost" Animation

**Given** I execute a Quick Add
**Then** a visual representation of the item (icon or small thumbnail) should animate/fly from the card's position to the Sticky Trip Bar
**And** the Sticky Trip Bar should "pulse" or flash when the animation lands

### AC 4: Undo / Quick Remove

**Given** an item is already added (Checkmark state)
**When** I tap the button again
**Then** it should toggle back to "Add" state
**And** the item should be removed from the Trip Bar effectively immediately

### AC 5: Interaction Responsiveness

**Given** I am scrolling quickly
**When** I tap multiple "Add" buttons in sequence
**Then** all actions should request to be processed without lag
**And** the trip total should update cumulatively

## Tasks / Subtasks

### Task 1: Enhance ExperienceCard Component (AC: #1, #2, #4)

- [ ] Modify `src/components/ExperienceCard.tsx`
- [ ] Add the `QuickAddButton` sub-component
- [ ] Implement toggle logic connecting to `useTrip` hook
- [ ] Add "Optimistic" local state for instant feedback

### Task 2: Implement "Fly-to-Cart" Animation (AC: #3)

- [ ] Create a `FlyingIcon` component using Framer Motion
- [ ] Implement coordinate calculation (`getBoundingClientRect`) to determine start (Card) and end (Trip Bar) positions
- [ ] Trigger this animation imperatively on add

### Task 3: Trip Context Updates (AC: #5)

- [ ] Ensure `addToTrip` and `removeFromTrip` functions in `TripContext` are performant
- [ ] Verify `TripContext` updates the `total` and `count` which drives the Sticky Bar

### Task 4: Haptics (Optional) (AC: #2)

- [ ] (Optional) Add `navigator.vibrate` call on add for tactile feedback

## Dev Notes

### Animation Strategy

For the "Fly to Cart" effect, you may need a global animation layer (Portal) so the flying element isn't clipped by scroll containers.

- On click: Get button coordinates.
- Mount `<MotionDiv>` at those coordinates in `body`.
- Animate to `{ bottom: 20, left: '50%' }` (Sticky Bar position).
- Unmount after animation complete.

```

```
