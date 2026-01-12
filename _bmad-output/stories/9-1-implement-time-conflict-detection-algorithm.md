### Story 9.1: Implement Time Conflict Detection Algorithm

As a developer,
I want an algorithm that detects scheduling conflicts,
So that users are warned about overlapping activities.

**Acceptance Criteria:**

**Given** trip items have scheduled_date and scheduled_time
**When** conflict detection runs (on any item change)
**Then** algorithm checks: for each day, are any item time ranges overlapping?
**And** time range = scheduled_time to (scheduled_time + experience.duration_hours)
**And** conflicts identified when: itemA.end_time > itemB.start_time AND itemA.start_time < itemB.end_time
**And** conflict data stored: { item_ids: [id1, id2], overlap_minutes, date }
**And** algorithm runs in <50ms for up to 20 items per day
