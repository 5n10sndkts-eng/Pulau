### Story 8.1: Create Trip Data Model and Persistence

As a developer,
I want a trip data model with Spark KV persistence,
So that trip data survives page refreshes and offline use.

**Acceptance Criteria:**

**Given** the application loads
**When** useKV hook initializes for trips
**Then** trips are stored with structure: { id, user_id, name, start_date, end_date, items[], status, created_at, updated_at }
**And** trip_items have structure: { id, trip_id, experience_id, scheduled_date, scheduled_time, guest_count, notes, created_at }
**And** default empty trip is created for new users
**And** null safety pattern is applied: `const safeTrip = trip || defaultTrip`
**And** updater functions check for null: `setTrip(current => { const base = current || defaultTrip; ... })`
**And** trip data persists across browser sessions
