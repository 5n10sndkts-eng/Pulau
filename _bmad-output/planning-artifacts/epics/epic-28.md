## Epic 28: Admin Refunds & Audit Trail

Admins can search bookings, process refunds, and view complete audit history for dispute resolution.

### Story 28.1: Create Admin Refund Interface with Audit Foundation

As a **customer service admin**,
I want to search and process booking refunds,
So that I can resolve customer issues efficiently.

**Acceptance Criteria:**

**Given** I am logged in as an admin user
**When** I access the Admin Refunds section
**Then** the system creates the audit_logs table if not exists (id, table_name, record_id, action, old_values, new_values, user_id, timestamp)
**And** the refund search interface displays with filters (booking ID, customer email, date range, refund status)
**And** I can search by:
  - Booking ID (exact match)
  - Traveler email (partial match)
  - Vendor name (partial match)
  - Date range
  - Booking status
**And** search results show booking details, payment amount, refund eligibility
**And** I can click a booking to view full details
**And** search supports pagination for large result sets
**And** all admin actions are logged to audit_logs table
**And** appropriate RLS policies restrict audit log access to admin users

---

### Story 28.2: Create Refund Processing Interface

As an **admin**,
I want to initiate refunds from the dashboard,
So that I can resolve customer issues efficiently.

**Acceptance Criteria:**

**Given** I am viewing a booking detail
**When** I click "Process Refund"
**Then** I can choose:
  - Full refund (100% of payment)
  - Partial refund (custom amount up to total)
**And** I must enter a refund reason
**And** I see the calculated amounts:
  - Amount to refund traveler
  - Amount deducted from vendor (if applicable)
  - Platform fee handling
**And** I must confirm before processing

---

### Story 28.3: Implement Refund Edge Function

As a **platform operator**,
I want a `process-refund` Edge Function,
So that refunds are processed securely via Stripe.

**Acceptance Criteria:**

**Given** an admin initiates a refund
**When** the `process-refund` Edge Function is called
**Then** it:
  - Validates admin has refund permissions
  - Validates refund amount doesn't exceed original payment
  - Creates Stripe refund via API
  - Updates payment record with refund_amount and refund_reason
  - Updates booking status to "refunded" or "partially_refunded"
  - Creates audit log entry with all details
**And** uses idempotency key to prevent duplicate refunds
**And** handles Stripe errors gracefully

---

### Story 28.4: Display Immutable Audit Log

As an **admin**,
I want to view the complete audit history for a booking,
So that I can understand exactly what happened for dispute resolution.

**Acceptance Criteria:**

**Given** I am viewing a booking detail
**When** I click "View Audit Log"
**Then** I see a chronological list of all events:
  - Event type (created, payment_received, confirmed, checked_in, refunded, etc.)
  - Timestamp
  - Actor (user, vendor, admin, system)
  - Metadata (amounts, reasons, etc.)
**And** events are displayed newest-first by default
**And** I can filter by event type
**And** Stripe event IDs are shown for payment events

---

### Story 28.5: Create Audit Service Module

As a **developer**,
I want an `auditService.ts` module,
So that audit log operations are centralized.

**Acceptance Criteria:**

**Given** the auditService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `createAuditEntry(eventType, entityType, entityId, actorId, metadata)` - Log event
  - `getAuditLog(entityType, entityId)` - Retrieve log for entity
  - `getAuditLogByDateRange(startDate, endDate)` - Time-based query
**And** entries are insert-only (no updates or deletes)
**And** TypeScript types for event types are exhaustive
**And** sensitive data is redacted from metadata

---

### Story 28.6: Enforce Audit Log Retention Policy

As a **platform operator**,
I want audit logs retained for 7 years,
So that we meet compliance requirements.

**Acceptance Criteria:**

**Given** audit log entries are created
**When** data retention is evaluated
**Then** entries are never automatically deleted (manual archival only)
**And** entries older than 7 years can be archived to cold storage
**And** archived entries remain queryable via admin tools
**And** retention policy is documented in compliance documentation

---

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

