# Story 8.1: Create Trip Data Model and Persistence

Status: ready-for-dev

## Story

As a developer,
I want a trip data model with Spark KV persistence,
So that trip data survives page refreshes and offline use.

## Acceptance Criteria

**AC #1: Initialize trip data model with useKV**
**Given** the application loads
**When** useKV hook initializes for trips
**Then** trips are stored with structure: { id, user_id, name, start_date, end_date, items[], status, created_at, updated_at }
**And** trip_items have structure: { id, trip_id, experience_id, scheduled_date, scheduled_time, guest_count, notes, created_at }
**And** default empty trip is created for new users

**AC #2: Implement null safety patterns**
**And** null safety pattern is applied: `const safeTrip = trip || defaultTrip`
**And** updater functions check for null: `setTrip(current => { const base = current || defaultTrip; ... })`

**AC #3: Persist across sessions**
**And** trip data persists across bobjectser sessions

## Tasks / Subtasks

### Task 1: Define TypeScript interfaces for trip data model (AC: #1)
- [ ] Create Trip interface with all required fields (id, user_id, name, dates, items, status, timestamps)
- [ ] Create TripItem interface with experience reference and scheduling details
- [ ] Create TripStatus enum ('planning', 'booked', 'active', 'completed', 'cancelled')
- [ ] Export types from shared types file for reuse
- [ ] Add JSDoc comments for developer documentation

### Task 2: Implement useKV hook for trip persistence (AC: #1, #3)
- [ ] Create useTripManagement custom hook wrapping Spark's useKV
- [ ] Initialize with key 'current_trip' and default empty trip structure
- [ ] Configure useKV to persist to localStorage for bobjectser sessions
- [ ] Test persistence: verify data survives page refresh
- [ ] Handle useKV initialization errors gracefully

### Task 3: Create default trip factory function (AC: #1, #2)
- [ ] Implement createDefaultTrip() function that generates empty trip
- [ ] Include UUID generation for trip ID
- [ ] Set default values: name="My Trip", status='planning', dates=null
- [ ] Initialize empty items array
- [ ] Add current timestamp for created_at

### Task 4: Implement null safety patterns throughout (AC: #2)
- [ ] Apply null safety to all trip access: `const safeTrip = trip || defaultTrip`
- [ ] Update setter functions with null checks: `setTrip(current => { const base = current || defaultTrip; return {...base, ...updates} })`
- [ ] Add defensive checks before accessing trip.items
- [ ] Create utility function: `ensureTripExists(trip: Trip | null): Trip`
- [ ] Test with intentionally null trip values

### Task 5: Create trip CRUD operations (AC: #1, #3)
- [ ] Implement addTripItem(experienceId, guestCount) function
- [ ] Implement removeTripItem(itemId) function
- [ ] Implement updateTripItem(itemId, updates) function
- [ ] Implement updateTripDetails(name, dates) function
- [ ] Add optimistic updates for instant UI feedback

## Dev Notes

### Technical Guidance
- Use Spark's `useKV` hook: `const [trip, setTrip] = useKV<Trip | null>('current_trip', null)`
- Always use null safety wrapper before accessing trip properties
- UUID generation: use `crypto.randomUUID()` for trip and item IDs
- Timestamps: use ISO 8601 format with `new Date().toISOString()`
- Consider using React Context to share trip state globally across components

### Data Structure
```typescript
interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null; // ISO date
  end_date: string | null;   // ISO date
  items: TripItem[];
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

interface TripItem {
  id: string;
  trip_id: string;
  experience_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null; // HH:MM format
  guest_count: number;
  notes: string | null;
  created_at: string;
}

type TripStatus = 'planning' | 'booked' | 'active' | 'completed' | 'cancelled';
```

### Default Trip Factory
```typescript
const createDefaultTrip = (): Trip => ({
  id: crypto.randomUUID(),
  user_id: getCurrentUserId() || 'guest',
  name: 'My Trip',
  start_date: null,
  end_date: null,
  items: [],
  status: 'planning',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
```

### Null Safety Pattern
```typescript
const useTripManagement = () => {
  const [trip, setTrip] = useKV<Trip | null>('current_trip', null);
  const safeTrip = trip || createDefaultTrip();

  const addItem = (experienceId: string, guestCount: number = 1) => {
    setTrip(current => {
      const base = current || createDefaultTrip();
      return {
        ...base,
        items: [...base.items, createTripItem(experienceId, guestCount)],
        updated_at: new Date().toISOString()
      };
    });
  };

  return { trip: safeTrip, addItem, ... };
};
```

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.1]
- [Source: prd/pulau-prd.md#Trip Canvas & Itinerary Building]
- [Technical: Spark useKV Documentation]
- [Technical: TypeScript Interface Design]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
