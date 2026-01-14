# Defect DEF-001: AvailabilityCalendar Not Connected to Supabase

Status: done
Priority: P0 - Critical
Completed: 2026-01-13
Identified: 2026-01-13
Sprint: Remediation

## Defect Description

The customer-facing `AvailabilityCalendar` component uses the deprecated `useKV` hook from GitHub Spark instead of connecting to Supabase `slotService` and `realtimeService`. This causes customers to see stale/empty availability data.

## Root Cause

During Phase 2a migration from KV store to Supabase (Epic 20), the `AvailabilityCalendar` component was not updated to use the new data layer.

## Impact

- Customers cannot see real-time slot availability
- Booking conversion likely impacted
- Data inconsistency between vendor calendar (works) and customer calendar (broken)

## Acceptance Criteria

### AC 1: Calendar Fetches Live Slot Data

**Given** the experience detail page is displayed
**When** the AvailabilityCalendar component mounts
**Then** it fetches slot data from Supabase via `slotService.getSlotsForExperience()`
**And** displays accurate availability status for each date

### AC 2: Real-time Updates

**Given** the calendar is displaying availability
**When** a vendor updates slot capacity or blocks a date
**Then** the calendar reflects the change within 2 seconds via Supabase Realtime

### AC 3: Loading State

**Given** the calendar is fetching data
**When** the request is in progress
**Then** skeleton loading states are displayed
**And** the component handles errors gracefully with toast notification

---

## Tasks

### Task 1: Replace useKV with slotService (AC: #1)

- [ ] Remove `useKV` import from `@github/spark/hooks`
- [ ] Import `getSlotsForExperience` from `@/lib/slotService`
- [ ] Add `useState` for slots data and loading state
- [ ] Fetch slots in `useEffect` on mount and experienceId change
- [ ] Transform slot data to calendar availability format

### Task 2: Add Realtime Subscription (AC: #2)

- [ ] Import `realtimeService` from `@/lib/realtimeService`
- [ ] Subscribe to slot changes for experienceId
- [ ] Update local state when realtime events arrive
- [ ] Clean up subscription on unmount

### Task 3: Add Loading & Error States (AC: #3)

- [ ] Add Skeleton component for loading state
- [ ] Add toast error notification on fetch failure
- [ ] Handle empty state when no slots exist

### Task 4: Testing

- [ ] Add unit tests for AvailabilityCalendar component
- [ ] Test loading state rendering
- [ ] Test error handling
- [ ] Verify subscription cleanup

---

## Dev Notes

### Current Implementation (Broken)
```typescript
const [availabilityData] = useKV<ExperienceAvailability[]>(
  `availability:${experienceId}`,
  [],
);
```

### Target Implementation
```typescript
const [slots, setSlots] = useState<ExperienceSlot[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSlots = async () => {
    const result = await getSlotsForExperience(experienceId, dateRange);
    if (result.data) setSlots(result.data);
    setLoading(false);
  };
  fetchSlots();
  
  const unsubscribe = realtimeService.subscribeToSlots(experienceId, (updatedSlots) => {
    setSlots(updatedSlots);
  });
  
  return () => unsubscribe();
}, [experienceId]);
```

## Related

- Epic 25: Real-Time Inventory & Availability
- Story 25-5: Display Real-Time Slot Availability
- [slotService.ts](../../src/lib/slotService.ts)
- [realtimeService.ts](../../src/lib/realtimeService.ts)
