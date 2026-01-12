### Story 21.5: Implement RLS Policies for New Tables

As a **platform operator**,
I want Row Level Security policies on all new tables,
So that data access is properly controlled at the database level.

**Acceptance Criteria:**

**Given** the experience_slots, payments, and audit_logs tables exist
**When** RLS is enabled and policies are applied
**Then** for `experience_slots`:
  - All users can SELECT (public read)
  - Only vendors who own the experience can INSERT/UPDATE/DELETE
**And** for `payments`:
  - Users can SELECT payments for their own bookings
  - Vendors can SELECT payments received for their experiences
  - No direct INSERT/UPDATE/DELETE (service role only)
**And** for `audit_logs`:
  - INSERT allowed for authenticated users
  - No SELECT access via RLS (service role only for admin queries)
  - No UPDATE or DELETE allowed

