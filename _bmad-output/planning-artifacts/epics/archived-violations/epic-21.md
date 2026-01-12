## Epic 21: Database Schema Extensions for Phase 2

Platform has the data structures needed to support payments, real-time inventory, and audit compliance.

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

### Story 21.2: Create Payments Table

As a **platform operator**,
I want the database to have a `payments` table,
So that all Stripe payment records are tracked for reconciliation and auditing.

**Acceptance Criteria:**

**Given** the Supabase database is accessible
**When** the migration is applied
**Then** a `payments` table exists with columns:
  - `id` (UUID, primary key)
  - `booking_id` (UUID, foreign key to bookings)
  - `stripe_payment_intent_id` (TEXT, unique)
  - `stripe_checkout_session_id` (TEXT)
  - `amount` (INTEGER, in cents)
  - `currency` (TEXT, default 'usd')
  - `platform_fee` (INTEGER)
  - `vendor_payout` (INTEGER)
  - `status` (TEXT, default 'pending')
  - `refund_amount` (INTEGER, default 0)
  - `refund_reason` (TEXT, nullable)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
**And** an index exists on `booking_id` for query performance
**And** an index exists on `stripe_payment_intent_id` for webhook lookups

---

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
