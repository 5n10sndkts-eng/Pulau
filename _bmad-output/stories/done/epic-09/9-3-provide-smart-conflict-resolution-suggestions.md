# Story 9.3: Provide Smart Conflict Resolution Suggestions

Status: done

## Story

As a traveler with a scheduling conflict,
I want suggestions to resolve the overlap,
So that I can quickly fix my itinerary.

## Acceptance Criteria

**AC #1: Open resolution bottom sheet on banner tap**
**Given** a conflict warning banner is displayed
**When** I tap the warning banner
**Then** a bottom sheet opens with resolution options:
  - "Move [Item A] to [suggested time]" (next available slot)
  - "Move [Item B] to [suggested time]"
  - "Move [Item A] to another day"
  - "Remove [Item A] from trip"
**And** suggestions are calculated based on item durations and available gaps

**AC #2: Apply resolution and re-run detection**
**When** I select a suggestion
**Then** the action is applied immediately
**And** conflict detection re-runs
**And** toast confirms "Conflict resolved"

## Tasks / Subtasks

### Task 1: Create ConflictResolutionSheet component (AC: #1)
- [x] Build bottom sheet component using shadcn/ui Sheet
- [x] Display conflict details: both item names and overlap duration
- [x] List 4 resolution options as action buttons
- [x] Style with clear visual hierarchy
- [x] Add "Cancel" button to close without action

### Task 2: Implement time suggestion algorithm (AC: #1)
- [x] Create findNextAvailableSlot function
- [x] Calculate time gaps in the day's schedule
- [x] Find first gap that fits the item's duration
- [x] Suggest moving to gap start time
- [x] Handle case: no available slots (suggest next day)

### Task 3: Build resolution action handlers (AC: #2)
- [x] Implement moveToSuggestedTime: update item's scheduled_time
- [x] Implement moveTo AnotherDay: show date picker
- [x] Implement removeFromTrip: delete item from trip
- [x] Each action updates trip via useTripManagement
- [x] Close bottom sheet after action applied

### Task 4: Re-run conflict detection after resolution (AC: #2)
- [x] Trigger conflict detection after any schedule change
- [x] Remove resolved conflict from conflicts array
- [x] Check if new conflicts were created by resolution
- [x] Display updated conflict banners or success state
- [x] Show toast: "Conflict resolved" or "New conflict detected"

### Task 5: Add suggested time formatting and validation (AC: #1)
- [x] Format suggested times in 12-hour format (e.g., "3:00 PM")
- [x] Validate suggestions: ensure within reasonable hours (6 AM - 11 PM)
- [x] Show duration needed in suggestion text
- [x] Handle multiple conflicts for same item
- [x] Provide fallback if no good suggestions available

## Dev Notes

### Technical Guidance
- Bottom sheet: shadcn/ui Sheet component
- Time suggestions: scan day's schedule for gaps ≥ item duration
- Resolution actions: use useTripManagement update functions
- Conflict detection: automatically re-runs via useEffect dependency
- Toast: shadcn/ui Toast with success styling

### Resolution Options Logic
```typescript
interface ResolutionOption {
  label: string;
  description: string;
  action: () => void;
}

const generateResolutionOptions = (
  conflict: Conflict,
  itemA: TripItem,
  itemB: TripItem,
  daySchedule: TripItem[]
): ResolutionOption[] => {
  const expA = getExperience(itemA.experience_id);
  const expB = getExperience(itemB.experience_id);

  const nextSlotA = findNextAvailableSlot(daySchedule, expA.duration_hours);
  const nextSlotB = findNextAvailableSlot(daySchedule, expB.duration_hours);

  return [
    {
      label: `Move ${expA.title} to ${formatTime(nextSlotA)}`,
      description: `Reschedule to next available time`,
      action: () => moveItemToTime(itemA.id, nextSlotA)
    },
    {
      label: `Move ${expB.title} to ${formatTime(nextSlotB)}`,
      description: `Reschedule to next available time`,
      action: () => moveItemToTime(itemB.id, nextSlotB)
    },
    {
      label: `Move ${expA.title} to another day`,
      description: `Choose a different date`,
      action: () => openDatePickerFor(itemA.id)
    },
    {
      label: `Remove ${expA.title} from trip`,
      description: `Permanently remove this experience`,
      action: () => removeItem(itemA.id)
    }
  ];
};
```

### Find Next Available Slot Algorithm
```typescript
const findNextAvailableSlot = (
  dayItems: TripItem[],
  durationHours: number
): string | null => {
  // Sort items by scheduled_time
  const sorted = dayItems
    .filter(item => item.scheduled_time)
    .sort((a, b) => parseTimeToMinutes(a.scheduled_time!) - parseTimeToMinutes(b.scheduled_time!));

  const durationMinutes = durationHours * 60;
  let searchStart = 6 * 60; // Start at 6 AM

  for (const item of sorted) {
    const itemStart = parseTimeToMinutes(item.scheduled_time!);
    const gap = itemStart - searchStart;

    if (gap >= durationMinutes) {
      return minutesToTime(searchStart);
    }

    const experience = getExperience(item.experience_id);
    searchStart = itemStart + Math.round(experience.duration_hours * 60);
  }

  // Check gap after last item
  if (searchStart + durationMinutes <= 23 * 60) { // Before 11 PM
    return minutesToTime(searchStart);
  }

  return null; // No available slot found
};
```

### Resolution Sheet Layout
```
ConflictResolutionSheet
├── Header
│   └── "Schedule Conflict"
├── ConflictDetails
│   └── "[Item A] overlaps with [Item B] by [X] minutes"
├── ResolutionOptions (list)
│   ├── Option 1 (Move A)
│   ├── Option 2 (Move B)
│   ├── Option 3 (Move to another day)
│   └── Option 4 (Remove)
└── CancelButton
```

### Visual Specifications
- Sheet height: auto, max 80% screen height
- Option buttons: full width, left-aligned text
- Icon per option: Clock, Calendar, Trash
- Conflict details: yellow background, bold text
- Button padding: 16px vertical, 16px horizontal

## References

- [Source: planning-artifacts/epics/epic-09.md#Epic 9, Story 9.3]
- [Source: prd/pulau-prd.md#Smart Conflict Resolution]
- [Related: Story 9.1 - Implement Time Conflict Detection Algorithm]
- [Related: Story 9.2 - Display Conflict Warning Banners]
- [Figma: Conflict Resolution Bottom Sheet]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

