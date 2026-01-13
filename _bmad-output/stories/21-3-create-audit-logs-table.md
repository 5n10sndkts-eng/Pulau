### Story 21.3: Create Audit Logs Table

As a **platform operator**,
I want the database to have an immutable `audit_logs` table,
So that all critical actions are recorded for compliance and dispute resolution.

**Acceptance Criteria:**

**Given** the Supabase database is accessible
**When** the migration is applied
**Then** an `audit_logs` table exists with columns:

- `id` (UUID, primary key)
- `event_type` (TEXT, not null)
- `entity_type` (TEXT, not null)
- `entity_id` (UUID, not null)
- `actor_id` (UUID, nullable, references auth.users)
- `actor_type` (TEXT, not null)
- `metadata` (JSONB, default '{}')
- `stripe_event_id` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, not null)
  **And** an index exists on (entity_type, entity_id) for lookups
  **And** an index exists on created_at for time-range queries
  **And** NO UPDATE or DELETE policies exist (insert-only)

---
