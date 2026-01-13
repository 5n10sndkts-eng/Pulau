### Story 21.1: Create Experience Slots Table

As a **platform operator**,
I want the database to have an `experience_slots` table,
So that vendors can manage time-based availability for their experiences.

**Acceptance Criteria:**

**Given** the Supabase database is accessible
**When** the migration is applied
**Then** an `experience_slots` table exists with columns:

- `id` (UUID, primary key)
- `experience_id` (UUID, foreign key to experiences)
- `slot_date` (DATE)
- `slot_time` (TIME)
- `total_capacity` (INTEGER)
- `available_count` (INTEGER)
- `price_override_amount` (INTEGER, nullable)
- `is_blocked` (BOOLEAN, default false)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
  **And** a unique constraint exists on (experience_id, slot_date, slot_time)
  **And** an index exists on (experience_id, slot_date) for query performance

---
