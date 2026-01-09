# Story 9.1: Implement Time Conflict Detection Algorithm

Status: done

## Story

As a developer,
I want an algorithm that detects scheduling conflicts,
So that users are warned about overlapping activities.

## Acceptance Criteria

**AC #1: Detect time range overlaps**
**Given** trip items have scheduled_date and scheduled_time
**When** conflict detection runs (on any item change)
**Then** algorithm checks: for each day, are any item time ranges overlapping?
**And** time range = scheduled_time to (scheduled_time + experience.duration_hours)
**And** conflicts identified when: itemA.end_time > itemB.start_time AND itemA.start_time < itemB.end_time

**AC #2: Store conflict data**
**And** conflict data stored: { item_ids: [id1, id2], overlap_minutes, date }
**And** algorithm runs in <50ms for up to 20 items per day

## Tasks / Subtasks

### Task 1: Create time range calculation utilities (AC: #1)
- [x] Implement parseTimeString: convert "HH:MM" to minutes since midnight
- [x] Implement calculateEndTime: start_time + duration_hours
- [x] Implement isOverlapping: check if two time ranges overlap
- [x] Add edge case handling: times crossing midnight
- [x] Write unit tests for time calculations

### Task 2: Build conflict detection algorithm (AC: #1, #2)
- [x] Create detectConflicts function taking trip items as input
- [x] Group items by scheduled_date
- [x] For each day: compare all pairs of items for overlap
- [x] Use isOverlapping utility to check each pair
- [x] Return array of Conflict objects with item IDs and overlap details

### Task 3: Implement conflict data structure (AC: #2)
- [x] Define Conflict interface: { item_ids, overlap_minutes, date, conflictId }
- [x] Calculate overlap_minutes for each conflict pair
- [x] Generate unique conflictId for each conflict
- [x] Store conflicts in state or context for UI access
- [x] Clear stale conflicts when items are updated

### Task 4: Optimize algorithm performance (AC: #2)
- [x] Benchmark algorithm with 20 items per day
- [x] Ensure execution time is <50ms
- [x] Use early exit strategies when no times are set
- [x] Memoize results to avoid re-running on unchanged data
- [x] Add performance monitoring in development mode

### Task 5: Integrate algorithm into trip management hook (AC: #1, #2)
- [x] Run detectConflicts whenever trip items change
- [x] Trigger on: item add, remove, date/time update
- [x] Store conflicts in useTripManagement state
- [x] Expose conflicts via hook: `const { conflicts } = useTripManagement()`
- [x] Re-run detection automatically on relevant changes

## Dev Notes

### Technical Guidance
- Time format: use 24-hour format "HH:MM" (e.g., "14:30")
- Duration: stored as decimal hours (e.g., 2.5 for 2.5 hours)
- Overlap algorithm: classic interval overlap check
- Performance: use O(n²) pairwise comparison (accepKV namespace for n<20)
- Memoization: use `useMemo` to cache conflict results

### Time Utilities
```typescript
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateEndTime = (startTime: string, durationHours: number): string => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = startMinutes + Math.round(durationHours * 60);
  return minutesToTime(endMinutes % (24 * 60)); // Handle midnight wrap
};
```

### Conflict Detection Algorithm
```typescript
interface Conflict {
  conflictId: string;
  item_ids: [string, string];
  overlap_minutes: number;
  date: string;
}

const detectConflicts = (items: TripItem[], experiences: Experience[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  const itemsByDay = groupBy(items, item => item.scheduled_date);

  Object.entries(itemsByDay).forEach(([date, dayItems]) => {
    const itemsWithTime = dayItems.filter(item => item.scheduled_time);

    for (let i = 0; i < itemsWithTime.length; i++) {
      for (let j = i + 1; j < itemsWithTime.length; j++) {
        const itemA = itemsWithTime[i];
        const itemB = itemsWithTime[j];
        const expA = experiences.find(exp => exp.id === itemA.experience_id);
        const expB = experiences.find(exp => exp.id === itemB.experience_id);

        if (!expA || !expB) continue;

        const startA = parseTimeToMinutes(itemA.scheduled_time!);
        const endA = startA + Math.round(expA.duration_hours * 60);
        const startB = parseTimeToMinutes(itemB.scheduled_time!);
        const endB = startB + Math.round(expB.duration_hours * 60);

        // Check overlap
        if (endA > startB && startA < endB) {
          const overlapStart = Math.max(startA, startB);
          const overlapEnd = Math.min(endA, endB);
          const overlapMinutes = overlapEnd - overlapStart;

          conflicts.push({
            conflictId: `${itemA.id}-${itemB.id}`,
            item_ids: [itemA.id, itemB.id],
            overlap_minutes: overlapMinutes,
            date
          });
        }
      }
    }
  });

  return conflicts;
};
```

### Performance Considerations
- Early exit: if no items have scheduled_time, skip detection
- Memoization: cache results based on items array reference
- Debounce: wait 100ms after rapid changes before re-running
- Complexity: O(n² × d) where n=items per day, d=days (accepKV namespace for small n)

## References

- [Source: planning-artifacts/epics/epic-09.md#Epic 9, Story 9.1]
- [Source: prd/pulau-prd.md#Scheduling & Conflict Detection]
- [Related: Story 9.2 - Display Conflict Warning Banners]
- [Technical: Algorithm Optimization Patterns]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

