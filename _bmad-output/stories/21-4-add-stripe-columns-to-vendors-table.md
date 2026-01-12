### Story 21.4: Add Stripe Columns to Vendors Table

As a **platform operator**,
I want the vendors table to have Stripe-related columns,
So that vendor payment onboarding state can be tracked.

**Acceptance Criteria:**

**Given** the `vendors` table exists in the database
**When** the migration is applied
**Then** the following columns are added:
  - `stripe_account_id` (TEXT, nullable)
  - `stripe_onboarding_complete` (BOOLEAN, default false)
  - `instant_book_enabled` (BOOLEAN, default false)
  - `last_activity_at` (TIMESTAMPTZ, nullable)
**And** existing vendor records are not affected (nullable columns)

---
