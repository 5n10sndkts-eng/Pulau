# Story 21.3: Create Audit Logs Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **platform operator**,
I want the database to have an `audit_logs` table,
So that all critical financial events are logged immutably for compliance and reconciliation.

## Acceptance Criteria

1. **Given** the Supabase database is accessible
   **When** the migration is applied
   **Then** an `audit_logs` table exists with columns:
   - `id` (UUID, primary key, default `gen_random_uuid()`)
   - `event_type` (TEXT, NOT NULL) - e.g., 'booking.created', 'payment.succeeded'
   - `entity_type` (TEXT, NOT NULL) - e.g., 'booking', 'payment', 'vendor'
   - `entity_id` (UUID, NOT NULL)
   - `actor_id` (UUID, nullable, references auth.users)
   - `actor_type` (TEXT, NOT NULL) - values: 'user', 'vendor', 'system', 'stripe'
   - `metadata` (JSONB, NOT NULL, default '{}')
   - `stripe_event_id` (TEXT, nullable) - for webhook reconciliation
   - `created_at` (TIMESTAMPTZ, NOT NULL, default now())

2. **Given** the table is created
   **When** querying audit logs by entity
   **Then** an index on `(entity_type, entity_id)` provides optimized performance

3. **Given** the table is created
   **When** querying audit logs by date range
   **Then** an index on `created_at` provides optimized performance

4. **Given** the table is created
   **When** querying audit logs by stripe_event_id (webhook reconciliation)
   **Then** an index on `stripe_event_id` provides optimized performance

5. **Given** RLS is enabled
   **When** any authenticated user attempts to INSERT
   **Then** the operation is allowed (for logging from Edge Functions)

6. **Given** RLS is enabled
   **When** any user attempts to SELECT/UPDATE/DELETE audit logs
   **Then** the operation is denied (service role only for reads)

7. **Given** the compliance requirement of 7-year retention
   **When** any user attempts to DELETE audit logs
   **Then** the operation is denied at both RLS and database level

## Tasks / Subtasks

- [x] Task 1: Create migration file for audit_logs table (AC: #1, #2, #3, #4)
  - [x] 1.1: Created migration via Supabase MCP `apply_migration` tool (name: `create_audit_logs_table`)
  - [x] 1.2: Defined table with all 9 required columns and data types
  - [x] 1.3: Added CHECK constraint for valid actor_type values (user, vendor, system, stripe)
  - [x] 1.4: Added index on (entity_type, entity_id) for entity queries
  - [x] 1.5: Added index on created_at for date range queries
  - [x] 1.6: Added partial index on stripe_event_id for webhook reconciliation (WHERE NOT NULL)
  - [x] 1.7: Added partial index on actor_id for actor-based queries (WHERE NOT NULL)
  - [x] 1.8: BONUS: Added index on event_type for event type queries

- [x] Task 2: Implement RLS policies (AC: #5, #6, #7)
  - [x] 2.1: Enabled RLS on audit_logs table
  - [x] 2.2: Created INSERT policy for authenticated users (audit_logs_insert_authenticated)
  - [x] 2.3: NO SELECT policy for authenticated users (service role only)
  - [x] 2.4: NO UPDATE/DELETE policies (immutable log)

- [x] Task 3: Add database-level immutability (AC: #7)
  - [x] 3.1: Created trigger `audit_logs_no_update` with `audit_logs_prevent_update()` function
  - [x] 3.2: Created trigger `audit_logs_no_delete` with `audit_logs_prevent_delete()` function

- [x] Task 4: Apply migration and verify (AC: all)
  - [x] 4.1: Applied migration via Supabase MCP
  - [x] 4.2: Verified table structure - 9 columns correctly defined
  - [x] 4.3: Verified 6 indexes created (pkey, entity, created_at, stripe_event, actor, event_type)
  - [x] 4.4: Verified 1 RLS policy active (audit_logs_insert_authenticated)
  - [x] 4.5: Verified 2 immutability triggers active (audit_logs_no_update, audit_logs_no_delete)

- [x] Task 5: Update TypeScript types (AC: #1)
  - [x] 5.1: Generated TypeScript types from Supabase schema via MCP tool
  - [x] 5.2: Added audit_logs table types to `src/lib/database.types.ts`

## Dev Notes

### Architecture Patterns & Constraints

**Database Naming Convention (from project-context.md):**
- Tables: `snake_case` plural → Table name: `audit_logs`
- Columns: `snake_case` → All columns follow this pattern

**Audit Log Requirements (from phase-2-architecture.md):**
- **Retention:** 7 years for tax/legal compliance
- **Event Types:** Booking, Payment, Refund, Cancellation
- **Immutability:** No UPDATE or DELETE allowed
- **Webhook Storage:** Stripe event ID for reconciliation

**Schema from Architecture Document:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'booking.created', 'payment.succeeded', etc.
  entity_type TEXT NOT NULL, -- 'booking', 'payment', 'vendor'
  entity_id UUID NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT NOT NULL, -- 'user', 'vendor', 'system', 'stripe'
  metadata JSONB NOT NULL DEFAULT '{}',
  stripe_event_id TEXT, -- For webhook reconciliation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Immutable: No UPDATE or DELETE policies
CREATE POLICY audit_insert_only ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
```

**RLS Pattern (from phase-2-architecture.md):**
```sql
-- Insert only, no read by default (admin function)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_insert ON audit_logs
  FOR INSERT WITH CHECK (true);
-- Read access via service role only (Edge Functions)
```

### Event Type Conventions

Standard event_type values to use:
- `booking.created` - New booking created
- `booking.confirmed` - Booking confirmed after payment
- `booking.cancelled` - Booking cancelled
- `payment.pending` - Payment initiated
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Full refund processed
- `payment.partially_refunded` - Partial refund processed
- `vendor.onboarded` - Vendor completed KYC
- `vendor.suspended` - Vendor suspended
- `slot.blocked` - Experience slot blocked
- `slot.unblocked` - Experience slot unblocked

### Actor Type Values

- `user` - Customer action
- `vendor` - Vendor action
- `system` - Automated system action
- `stripe` - Stripe webhook event

### Project Structure Notes

**Migration Location:** `supabase/migrations/`
- Follow existing naming pattern: `YYYYMMDDHHMMSS_description.sql`
- Next migration: `20260109000003_create_audit_logs_table.sql`

**Existing Migrations (reference):**
- `20260108000000_initial_schema.sql` - profiles, vendors, experiences tables
- `20260108000005_complete_schema.sql` - bookings, trips tables
- `20260109000001_create_experience_slots.sql` - experience_slots table (Story 21.1)
- `20260109000002_create_payments_table.sql` - payments table (Story 21.2)

### Critical Implementation Notes

1. **Immutability is Critical:** This table must be immutable for legal/compliance reasons. Database triggers should prevent UPDATE and DELETE even for service role.

2. **No Foreign Key on entity_id:** The `entity_id` references various tables (bookings, payments, vendors) so we cannot add a foreign key constraint. Integrity is maintained at application level.

3. **Actor ID Reference:** `actor_id` references `auth.users(id)` but is nullable because Stripe webhook events don't have a user actor.

4. **JSONB Metadata:** The `metadata` field stores additional context like:
   - For payments: `{amount, currency, payment_method}`
   - For bookings: `{experience_id, slot_id, guest_count}`
   - For refunds: `{refund_amount, reason}`

5. **Service Role Access:** Only Edge Functions (using service role) should read audit logs. No authenticated user should be able to query this table directly.

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Audit & Compliance Architecture]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 21.3]
- [Source: project-context.md#Database Naming]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Migration applied via Supabase MCP `apply_migration` tool
- Verification queries executed via `execute_sql` tool

### Completion Notes List

1. **Migration Strategy**: Applied migration via Supabase MCP tool
2. **Partial Indexes**: Used partial indexes for nullable columns (stripe_event_id, actor_id) to optimize storage
3. **Bonus Index**: Added event_type index for common event type queries
4. **Immutability Enforcement**: Database triggers prevent UPDATE/DELETE even for service role
5. **RLS Pattern**: INSERT-only for authenticated, no SELECT/UPDATE/DELETE policies

### Verification Results

- **Table**: 9 columns created with correct types
- **Indexes**: 6 total (pkey, idx_audit_logs_entity, idx_audit_logs_created_at, idx_audit_logs_stripe_event, idx_audit_logs_actor, idx_audit_logs_event_type)
- **Constraints**: 1 CHECK (valid_actor_type)
- **RLS Policies**: 1 active (audit_logs_insert_authenticated)
- **Triggers**: 2 active (audit_logs_no_update, audit_logs_no_delete)

### File List

- `supabase/migrations/20260109000003_create_audit_logs_table.sql` (CREATED)
- `src/lib/database.types.ts` (UPDATED - added audit_logs types)

### Code Review Record

**Reviewed by:** Claude Opus 4.5 (code-review workflow)
**Review Date:** 2026-01-09
**Issues Found:** 0 High, 0 Medium, 0 Low
**Issues Fixed:** 0
**Issues Deferred:** 0

**Acceptance Criteria Verification:**

| AC# | Description | Status |
|-----|-------------|--------|
| 1 | Table exists with 9 required columns | ✅ PASS |
| 2 | Index on (entity_type, entity_id) exists | ✅ PASS |
| 3 | Index on created_at exists | ✅ PASS |
| 4 | Index on stripe_event_id exists | ✅ PASS |
| 5 | INSERT allowed for authenticated users | ✅ PASS |
| 6 | SELECT/UPDATE/DELETE denied for authenticated | ✅ PASS |
| 7 | DELETE denied at database level (trigger) | ✅ PASS |

**Immutability Tests:**
- INSERT: ✅ Succeeded (returned id)
- UPDATE: ✅ Blocked with `UPDATE operations are not allowed on audit_logs table`
- DELETE: ✅ Blocked with `DELETE operations are not allowed on audit_logs table`

**Review Notes:**
- All 7 Acceptance Criteria verified as PASS
- All 5 tasks (18 subtasks) verified as genuinely complete
- Immutability enforced at both RLS and trigger level
- Local migration file created for git tracking
- Partial indexes used for nullable columns (optimization)
