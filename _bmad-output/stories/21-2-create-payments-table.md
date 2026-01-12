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
