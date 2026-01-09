# Story 21.1: Create Experience Slots Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **platform operator**,
I want the database to have an `experience_slots` table,
So that vendors can manage time-based availability for their experiences.

## Acceptance Criteria

1. **Given** the Supabase database is accessible
   **When** the migration is applied
   **Then** an `experience_slots` table exists with columns:
   - `id` (UUID, primary key, default `gen_random_uuid()`)
   - `experience_id` (UUID, foreign key to experiences, NOT NULL, CASCADE on delete)
   - `slot_date` (DATE, NOT NULL)
   - `slot_time` (TIME, NOT NULL)
   - `total_capacity` (INTEGER, NOT NULL)
   - `available_count` (INTEGER, NOT NULL)
   - `price_override_amount` (INTEGER, nullable) - in cents, NULL means use experience base price
   - `is_blocked` (BOOLEAN, default false)
   - `created_at` (TIMESTAMPTZ, default now())
   - `updated_at` (TIMESTAMPTZ, default now())

2. **Given** the table is created
   **When** attempting to insert a duplicate slot
   **Then** a unique constraint violation occurs on `(experience_id, slot_date, slot_time)`

3. **Given** the table is created
   **When** querying slots by experience and date
   **Then** an index on `(experience_id, slot_date)` provides optimized performance

4. **Given** RLS is enabled
   **When** any authenticated user queries slots
   **Then** all non-blocked slots are visible (public read access)

5. **Given** RLS is enabled
   **When** a vendor attempts to INSERT/UPDATE/DELETE slots
   **Then** the operation succeeds only if the vendor owns the experience

## Tasks / Subtasks

- [x] Task 1: Create migration file for experience_slots table (AC: #1, #2, #3)
  - [x] 1.1: Create new migration file `supabase/migrations/20260109000001_create_experience_slots.sql`
  - [x] 1.2: Define table with all required columns and data types
  - [x] 1.3: Add unique constraint on (experience_id, slot_date, slot_time)
  - [x] 1.4: Add foreign key constraint with ON DELETE CASCADE
  - [x] 1.5: Add index on (experience_id, slot_date)

- [x] Task 2: Implement RLS policies (AC: #4, #5)
  - [x] 2.1: Enable RLS on experience_slots table
  - [x] 2.2: Create SELECT policy for public read access
  - [x] 2.3: Create INSERT policy for vendor ownership check
  - [x] 2.4: Create UPDATE policy for vendor ownership check
  - [x] 2.5: Create DELETE policy for vendor ownership check

- [x] Task 3: Add updated_at trigger function (AC: #1)
  - [x] 3.1: Reused existing `handle_updated_at()` trigger function from complete_schema migration
  - [x] 3.2: Apply trigger to experience_slots table

- [x] Task 4: Apply migration and verify (AC: all)
  - [x] 4.1: Applied migration via Supabase MCP `apply_migration` tool
  - [x] 4.2: Verified table structure - 10 columns correctly defined
  - [x] 4.3: Verified RLS policies are active - 4 policies confirmed

## Dev Notes

### Architecture Patterns & Constraints

**Database Naming Convention (from project-context.md):**
- Tables: `snake_case` plural → Table name: `experience_slots`
- Columns: `snake_case` → All columns follow this pattern
- Foreign Keys: `{table}_id` → `experience_id`

**RLS Policy Pattern (from initial_schema.sql):**
```sql
-- Vendor ownership check pattern (used in experiences table)
auth.uid() in (select owner_id from public.vendors where id = vendor_id)

-- For experience_slots, we need to join through experiences:
auth.uid() in (
  select v.owner_id from public.vendors v
  join public.experiences e on e.vendor_id = v.id
  where e.id = experience_slots.experience_id
)
```

**Phase 2 Architecture Requirements (from phase-2-architecture.md):**
- This table supports real-time inventory management
- Row-level locking will be used for atomic inventory decrements (Story 25.3)
- `available_count` must support atomic decrement operations

**Schema from Architecture Document:**
```sql
CREATE TABLE experience_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_count INTEGER NOT NULL,
  price_override_amount INTEGER, -- NULL = use experience base price
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_slot UNIQUE (experience_id, slot_date, slot_time)
);

CREATE INDEX idx_slots_experience_date ON experience_slots(experience_id, slot_date);
```

### Project Structure Notes

**Migration Location:** `supabase/migrations/`
- Follow existing naming pattern: `YYYYMMDDHHMMSS_description.sql`
- Example: `20260109000001_create_experience_slots.sql`

**Existing Migrations (reference):**
- `20260108000000_initial_schema.sql` - profiles, vendors, experiences tables
- `20260108000005_complete_schema.sql` - additional schema setup

**Testing Considerations:**
- Verify RLS with service_role key (bypasses RLS)
- Verify RLS with anon key (enforces RLS)
- Test vendor ownership check with different user sessions

### Critical Implementation Notes

1. **Price Amount in Cents:** `price_override_amount` is stored in cents (INTEGER) to avoid floating-point precision issues. This matches the `payments` table pattern in Phase 2 architecture.

2. **Cascade Delete:** Foreign key uses `ON DELETE CASCADE` so slots are automatically removed when an experience is deleted.

3. **Available Count vs Total Capacity:**
   - `total_capacity` is the maximum seats for this slot
   - `available_count` starts equal to `total_capacity` and decrements with each booking
   - Story 25.3 will implement atomic decrement with row locking

4. **RLS Policy Complexity:** The vendor ownership check requires a JOIN through experiences and vendors tables. This is necessary because `experience_slots` references `experiences`, not `vendors` directly.

5. **Check Constraint (Optional Enhancement):** Consider adding `CHECK (available_count >= 0 AND available_count <= total_capacity)` to prevent data inconsistencies.

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Database Schema Extensions]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 21.1]
- [Source: supabase/migrations/20260108000000_initial_schema.sql (RLS patterns)]
- [Source: project-context.md#Database Naming]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Migration applied via Supabase MCP `apply_migration` tool
- Verification queries executed via `execute_sql` tool

### Completion Notes List

1. **Migration Strategy**: Combined all tasks into single atomic migration file for consistency
2. **Trigger Reuse**: Discovered and reused existing `handle_updated_at()` trigger function from `20260108000005_complete_schema.sql`
3. **Bonus Constraints**: Added CHECK constraints (`positive_capacity`, `valid_available_count`) beyond requirements for data integrity
4. **Optimized Indexing**: Added partial index `idx_experience_slots_available` for availability queries (WHERE available_count > 0 AND is_blocked = false)
5. **RLS Pattern**: Implemented vendor ownership via JOIN through experiences→vendors tables per architecture patterns

### Verification Results

- **Table**: 10 columns created with correct types
- **Indexes**: 4 total (pkey, unique_experience_slot, idx_experience_slots_experience_date, idx_experience_slots_available)
- **Constraints**: 5 total (fkey, pkey, unique, positive_capacity, valid_available_count)
- **RLS Policies**: 4 active (select_public, insert_vendor_owner, update_vendor_owner, delete_vendor_owner)

### File List

- `supabase/migrations/20260109000001_create_experience_slots.sql` (CREATED)
- `src/lib/database.types.ts` (UPDATED - added experience_slots types)

### Code Review Record

**Reviewed by:** Claude Opus 4.5 (code-review workflow)
**Review Date:** 2026-01-09
**Issues Found:** 0 High, 3 Medium, 2 Low
**Issues Fixed:** 1 (M1 - TypeScript types regenerated)
**Issues Deferred:** 2 Low (column comments, naming convention - cosmetic only)

**Review Notes:**
- All 5 Acceptance Criteria verified as PASS
- All 15 tasks/subtasks verified as genuinely complete
- TypeScript types regenerated to include experience_slots table
- Migration file needs to be committed to git (M3 - user action required)
