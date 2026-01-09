# Story 21.4: Add Stripe Columns to Vendors Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **platform operator**,
I want the vendors table to have Stripe Connect columns,
So that vendor onboarding state and payment capabilities can be tracked.

## Acceptance Criteria

1. **Given** the Supabase database is accessible
   **When** the migration is applied
   **Then** the `vendors` table has new columns:
   - `stripe_account_id` (TEXT, nullable) - Stripe Connect account ID
   - `stripe_onboarding_complete` (BOOLEAN, default false)
   - `instant_book_enabled` (BOOLEAN, default false)
   - `last_activity_at` (TIMESTAMPTZ, nullable)

2. **Given** the columns are added
   **When** querying vendors by stripe_account_id
   **Then** an index provides optimized performance

3. **Given** the columns are added
   **When** querying vendors by instant_book_enabled status
   **Then** an index provides optimized performance for filtering bookable vendors

4. **Given** a vendor has stripe_account_id set
   **When** another vendor attempts to use the same stripe_account_id
   **Then** a unique constraint violation occurs

5. **Given** existing RLS policies on vendors table
   **When** vendors query their own record
   **Then** they can see all new Stripe columns

6. **Given** the columns are added
   **When** the TypeScript types are regenerated
   **Then** the vendors type includes all new columns with correct types

## Tasks / Subtasks

- [x] Task 1: Create migration file for vendors table alterations (AC: #1, #2, #3, #4)
  - [x] 1.1: Created migration via Supabase MCP `apply_migration` tool (name: `add_stripe_columns_to_vendors`)
  - [x] 1.2: Added stripe_account_id column (TEXT, nullable, UNIQUE)
  - [x] 1.3: Added stripe_onboarding_complete column (BOOLEAN, default false)
  - [x] 1.4: Added instant_book_enabled column (BOOLEAN, default false)
  - [x] 1.5: Added last_activity_at column (TIMESTAMPTZ, nullable)
  - [x] 1.6: Added unique constraint on stripe_account_id (vendors_stripe_account_id_unique)
  - [x] 1.7: Added partial index on stripe_account_id for lookups (WHERE NOT NULL)
  - [x] 1.8: Added partial index on instant_book_enabled for filtering (WHERE true)

- [x] Task 2: Verify existing RLS policies (AC: #5)
  - [x] 2.1: Confirmed existing RLS policies apply to new columns (column-level inheritance)
  - [x] 2.2: No new RLS policies needed (columns inherit table policies)

- [x] Task 3: Apply migration and verify (AC: all)
  - [x] 3.1: Applied migration via Supabase MCP
  - [x] 3.2: Verified 4 new columns with correct types and defaults
  - [x] 3.3: Verified 3 new indexes created (unique, stripe_account_id partial, instant_book_enabled partial)
  - [x] 3.4: Verified unique constraint on stripe_account_id

- [x] Task 4: Update TypeScript types (AC: #6)
  - [x] 4.1: Generated TypeScript types from Supabase schema via MCP tool
  - [x] 4.2: Updated vendors type in `src/lib/database.types.ts` with 4 new columns

## Dev Notes

### Architecture Patterns & Constraints

**Database Naming Convention (from project-context.md):**
- Columns: `snake_case` → All new columns follow this pattern

**Schema from Architecture Document (phase-2-architecture.md):**
```sql
-- Stripe Connected Accounts for Vendors
ALTER TABLE vendors ADD COLUMN stripe_account_id TEXT;
ALTER TABLE vendors ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN instant_book_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN last_activity_at TIMESTAMPTZ;
```

**Vendor State Machine (from phase-2-architecture.md):**
```
REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
                   ↓              ↓             ↓
            KYC_REJECTED   KYC_REJECTED   SUSPENDED
```

### Column Purposes

1. **stripe_account_id**: Stripe Connect Express account ID (e.g., `acct_1234567890`)
   - Set when vendor initiates Stripe onboarding
   - Used for payment transfers and payout management

2. **stripe_onboarding_complete**: Stripe Connect onboarding status
   - `false` - Onboarding not started or incomplete
   - `true` - All KYC requirements met, bank account linked

3. **instant_book_enabled**: Vendor eligibility for instant booking
   - Requires: `stripe_onboarding_complete = true` AND active status
   - Enables "Instant Confirmation" filter for travelers

4. **last_activity_at**: Last vendor activity timestamp
   - Updated when vendor manages availability, responds to messages
   - Used for stale detection (auto-disable Instant Book if stale)

### Project Structure Notes

**Migration Location:** `supabase/migrations/`
- Next migration: `20260109000004_add_stripe_columns_to_vendors.sql`

**Existing Migrations (reference):**
- `20260108000000_initial_schema.sql` - vendors table created
- `20260109000001_create_experience_slots.sql` - Story 21.1
- `20260109000002_create_payments_table.sql` - Story 21.2
- `20260109000003_create_audit_logs_table.sql` - Story 21.3

### Critical Implementation Notes

1. **Unique Constraint on stripe_account_id**: Prevents a single Stripe account from being linked to multiple vendors (fraud prevention).

2. **No NOT NULL on stripe_account_id**: Vendors can exist without Stripe onboarding (legacy or pending vendors).

3. **Default Values**: Both boolean columns default to `false` for safety.

4. **RLS Inheritance**: New columns automatically inherit existing RLS policies on the vendors table. No additional policies needed.

5. **Index Strategy**:
   - `stripe_account_id` index for webhook lookups by Stripe account
   - `instant_book_enabled` index for traveler filtering queries

### References

- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Database Schema Extensions]
- [Source: _bmad-output/planning-artifacts/architecture/phase-2-architecture.md#Vendor KYC & Onboarding Architecture]
- [Source: project-context.md#Database Naming]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Migration applied via Supabase MCP `apply_migration` tool
- Verification queries executed via `execute_sql` tool

### Completion Notes List

1. **Migration Strategy**: Applied migration via Supabase MCP tool
2. **Partial Indexes**: Used partial indexes for efficiency (WHERE NOT NULL, WHERE true)
3. **Unique Constraint**: Added for fraud prevention on stripe_account_id
4. **RLS Inheritance**: No new policies needed - columns inherit existing vendors table policies

### Verification Results

- **Columns**: 4 new columns added with correct types and defaults
- **Indexes**: 3 new (vendors_stripe_account_id_unique, idx_vendors_stripe_account_id, idx_vendors_instant_book_enabled)
- **Constraints**: 1 new UNIQUE constraint (vendors_stripe_account_id_unique)

### File List

- `supabase/migrations/20260109000004_add_stripe_columns_to_vendors.sql` (CREATED)
- `src/lib/database.types.ts` (UPDATED - added 4 new vendor columns)

### Code Review Record

**Reviewed by:** Claude Opus 4.5 (code-review workflow)
**Review Date:** 2026-01-09
**Issues Found:** 0 High, 0 Medium, 0 Low
**Issues Fixed:** 0
**Issues Deferred:** 0

**Acceptance Criteria Verification:**

| AC# | Description | Status |
|-----|-------------|--------|
| 1 | 4 new columns added with correct types | ✅ PASS |
| 2 | Index on stripe_account_id exists | ✅ PASS |
| 3 | Index on instant_book_enabled exists | ✅ PASS |
| 4 | Unique constraint on stripe_account_id | ✅ PASS |
| 5 | Existing RLS policies apply to new columns | ✅ PASS |
| 6 | TypeScript types include new columns | ✅ PASS |

**Review Notes:**
- All 6 Acceptance Criteria verified as PASS
- All 4 tasks (14 subtasks) verified as genuinely complete
- Local migration file created for git tracking
- Partial indexes used for optimization
