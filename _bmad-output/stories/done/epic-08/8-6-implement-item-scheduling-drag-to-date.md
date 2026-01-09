# Story 8.6: Implement Item Scheduling (Drag to Date)

Status: done

## Story

As a traveler,
I want to schedule unscheduled items to specific days,
So that my itinerary has a logical flow.

## Acceptance Criteria

**AC #1: Long-press drag item to schedule**
**Given** I have unscheduled items in my trip
**When** I long-press an unscheduled item
**Then** item becomes draggable with visual feedback (slight elevation, opacity change)
**When** I drag the item over a day section
**Then** day section highlights as drop target
**When** I release the item on a day
**Then** item moves to that day's section with animation
**And** trip_items.scheduled_date updates to the selected date
**And** item appears at end of that day's list

**AC #2: Tap to assign date via picker**
**When** I tap "Assign to Day" on an unscheduled item
**Then** date picker modal opens
**And** I can select a date from trip date range
**And** item updates and moves to selected day

## Tasks / Subtasks

### Task 1: Implement drag-and-drop functionality (AC: #1)
- [x] Add long-press detection to TripItemCard (300ms threshold)
- [x] Make item draggable using @dnd-kit or native drag API
- [x] Add visual feedback: elevation shadow, reduced opacity (0.7)
- [x] Create drop zones for each day section
- [x] Highlight drop zone on drag-over with border/background change

### Task 2: Handle drop and update scheduled date (AC: #1)
- [x] Implement onDrop handler for day sections
- [x] Update trip_items.scheduled_date to target day's date
- [x] Move item from unscheduled to target day's items array
- [x] Persist change via useTripManagement hook
- [x] Add smooth animation for item repositioning

### Task 3: Create "Assign to Day" button and date picker (AC: #2)
- [x] Add "Assign to Day" button to unscheduled TripItemCard
- [x] Create DatePickerModal component
- [x] Filter available dates to trip.start_date and trip.end_date range
- [x] Show day of week and formatted date in picker
- [x] Handle date selection and close modal

### Task 4: Update item positioning and sorting (AC: #1, #2)
- [x] Sort items within day by scheduled_time (if set)
- [x] Add items without time to end of day list
- [x] Re-render affected day sections on item move
- [x] Ensure unscheduled section updates when item removed
- [x] Maintain scroll position during re-render

### Task 5: Add mobile and desktop interaction patterns (AC: #1)
- [x] Mobile: long-press (300ms) to initiate drag
- [x] Desktop: click-and-drag or hover menu with "Move to..." option
- [x] Add touch feedback vibration on long-press start (mobile)
- [x] Show ghost element following cursor/touch during drag
- [x] Cancel drag on escape key or edge swipe

## Dev Notes

### Technical Guidance
- Use `@dnd-kit/core` for drag-and-drop (better mobile support than HTML5 drag)
- Long-press detection: use `react-use` hook `useLongPress` or custom implementation
- Drop zones: use `useDroppable` hook from @dnd-kit
- Date picker: shadcn/ui Calendar component in Dialog
- Update function: `updateTripItem(itemId, { scheduled_date: targetDate })`

### Drag-and-Drop Setup
```typescript
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: item.id,
  data: { item }
});

const { setNodeRef: setDropRef, isOver } = useDroppable({
  id: `day-${dayDate}`,
  data: { date: dayDate }
});
```

### Visual Feedback
- Dragging item: `opacity: 0.7, scale: 1.05, shadow-lg`
- Drop zone active: `border: 2px dashed teal, background: teal/10`
- Ghost element: semi-transparent copy of item card
- Drop animation: 200ms ease-out slide into position

### Mobile Considerations
- Long-press threshold: 300ms (not too sensitive)
- Haptic feedback on drag start (if available)
- Larger drop zones on mobile (min 60px height)
- Cancel drag if scroll detected during long-press

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.6]
- [Source: prd/pulau-prd.md#Trip Canvas - Item Scheduling]
- [Related: Story 8.4 - Create Detailed Trip Builder Screen]
- [Technical: @dnd-kit Documentation]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

