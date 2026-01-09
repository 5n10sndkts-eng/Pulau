---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "prd.md"
  - "architecture/phase-2-architecture.md"
  - "pulau-detailed-spec.md"
workflowType: 'epics'
project_name: 'Pulau Phase 2'
user_name: 'Moe'
date: '2026-01-09'
lastStep: 4
phase: '2a-core'
status: 'complete'
---

# Pulau Phase 2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Pulau Phase 2a (Core Transactional), decomposing the requirements from the Phase 2 PRD and Architecture into implementable stories.

**Scope:** Phase 2a focuses on transforming Pulau from a "Travel Canvas" MVP into a fully transactional marketplace with:
- Stripe Connect payment processing
- Real-time inventory management
- Vendor KYC onboarding
- Audit trail for compliance

---

## Requirements Inventory

### Functional Requirements

**Vendor Onboarding & Identity:**
- FR-VEN-01: Vendor can register via "Stripe Express" flow, completing KYC and Bank Account linkage.
- FR-VEN-02: Vendor can define "Instant Book" vs "Request" policies per experience.
- FR-VEN-03: Vendor can set "Cut-off Times" (e.g., stop booking 2 hours before start).

**Traveler Booking & Payment:**
- FR-BOOK-01: Traveler can filter search results by "Instant Confirmation".
- FR-BOOK-02: Traveler can view real-time slot availability (e.g., "5 spots left at 10:00 AM").
- FR-BOOK-03: Traveler can pay via Credit Card or Apple/Google Pay (Stripe Elements).
- FR-BOOK-04: Traveler receives an immediate PDF Ticket via Email upon payment success.

**Offline Trust (Web/PWA):**
- FR-OFF-01: Traveler can access their "Active Ticket" page without network connectivity (served via Service Worker Cache).
- FR-OFF-02: Traveler sees a "Last Updated" timestamp on their offline ticket to indicate data freshness.

**Vendor Pocket Operations:**
- FR-OPS-01: Vendor receives Push/SMS notification immediately upon new booking. *(Phase 2b)*
- FR-OPS-02: Vendor can "Check-in" a traveler by scanning a QR code (using device camera via PWA wrapper).
- FR-OPS-03: Vendor can manually block/unblock inventory slots for walk-in customers.

**Financial Admin & Disputes:**
- FR-ADM-01: Admin can search bookings by Booking ID, Vendor Name, or Traveler Email.
- FR-ADM-02: Admin can initiate a partial or full refund via the Dashboard.
- FR-ADM-03: Admin can view an immutable "Audit Log" of all status changes for a specific booking.

### Non-Functional Requirements

**Performance:**
- NFR-PERF-01: Inventory availability updates must propagate to all connected clients within **500ms** (99th percentile) via Supabase Realtime.
- NFR-PERF-02: The "Active Ticket" page must reach TTI (Time to Interactive) in **< 1.5 seconds** on a 4G connection.

**Reliability & Offline:**
- NFR-REL-01: Downloaded ticket data (QR code, metadata) must remain accessible via PWA Cache/LocalDB for **30 days** without network renewal.
- NFR-REL-02: The application must automatically attempt to reconcile booking state within **10 seconds** of network restoration.

**Security & Compliance:**
- NFR-SEC-01: The application must NEVER process or store raw PAN (Primary Account Number) data. All card entry must occur within Stripe Elements iframes (SAQ-A).
- NFR-SEC-02: Critical actions (Booking Confirmation, Cancellation, Refund) must generate an immutable audit log entry retained for **7 years** for tax/legal compliance.

**Concurrency:**
- NFR-CON-01: The database must support row-level locking or atomic transactions to handle **10 concurrent booking attempts** for a single slot, ensuring exactly zero overbookings.

### Additional Requirements (from Architecture)

**Database Schema Extensions:**
- ARCH-DB-01: Add `experience_slots` table for time-based availability management
- ARCH-DB-02: Add `payments` table for Stripe payment records
- ARCH-DB-03: Add `audit_logs` table for immutable event logging
- ARCH-DB-04: Add Stripe columns to `vendors` table (stripe_account_id, stripe_onboarding_complete, instant_book_enabled, last_activity_at)
- ARCH-DB-05: Implement RLS policies for experience_slots, payments, and audit_logs

**Edge Functions:**
- ARCH-EF-01: `checkout` - Create Stripe Checkout Session
- ARCH-EF-02: `webhook-stripe` - Handle Stripe webhooks
- ARCH-EF-03: `create-booking` - Atomic booking + inventory decrement
- ARCH-EF-04: `process-refund` - Initiate refund per policy
- ARCH-EF-05: `vendor-onboard` - Create Stripe Connect account
- ARCH-EF-06: `vendor-payout-status` - Check payout status

**Service Layer Extensions:**
- ARCH-SVC-01: Create `paymentService.ts` for Stripe operations
- ARCH-SVC-02: Create `slotService.ts` for availability management
- ARCH-SVC-03: Create `realtimeService.ts` for subscription management
- ARCH-SVC-04: Create `auditService.ts` for audit log queries

**Real-Time Patterns:**
- ARCH-RT-01: Implement slot availability subscriptions per experience
- ARCH-RT-02: Implement booking status subscriptions
- ARCH-RT-03: Use row-level locking (SERIALIZABLE) for concurrency control

**UX Requirements (from Detailed Spec):**
- UX-01: Mobile-first design with 44x44px minimum touch targets
- UX-02: Skeleton loading states for async operations
- UX-03: Clear error states with retry options
- UX-04: Success animations for completed actions
- UX-05: Progressive disclosure pattern (show what's needed, reveal more on demand)

---

### FR Coverage Map

| Requirement | Epic | Description |
|-------------|------|-------------|
| FR-VEN-01 | Epic 22 | Vendor Stripe KYC registration |
| FR-VEN-02 | Epic 23 | Instant Book vs Request policies |
| FR-VEN-03 | Epic 23 | Cut-off time settings |
| FR-BOOK-01 | Epic 25 | Filter by Instant Confirmation |
| FR-BOOK-02 | Epic 25 | Real-time slot availability |
| FR-BOOK-03 | Epic 24 | Payment via Stripe Elements |
| FR-BOOK-04 | Epic 24 | Email PDF ticket delivery |
| FR-OFF-01 | Epic 26 | PWA offline ticket access |
| FR-OFF-02 | Epic 26 | Last Updated timestamp |
| FR-OPS-02 | Epic 27 | QR code check-in |
| FR-OPS-03 | Epic 23 | Manual slot block/unblock |
| FR-ADM-01 | Epic 28 | Search bookings |
| FR-ADM-02 | Epic 28 | Initiate refunds |
| FR-ADM-03 | Epic 28 | Immutable audit log |

**Note:** FR-OPS-01 (Push notifications) deferred to Phase 2b.

---

## Epic List

### Epic 21: Database Schema Extensions for Phase 2
Platform has the data structures needed to support payments, real-time inventory, and audit compliance.

**FRs covered:** ARCH-DB-01, ARCH-DB-02, ARCH-DB-03, ARCH-DB-04, ARCH-DB-05

---

### Epic 22: Vendor Stripe Onboarding & KYC
Vendors can complete identity verification and bank account setup to enable receiving payments.

**FRs covered:** FR-VEN-01, ARCH-EF-05

---

### Epic 23: Vendor Availability Management
Vendors can create, manage, and control time-based availability slots for their experiences.

**FRs covered:** FR-VEN-02, FR-VEN-03, FR-OPS-03, ARCH-SVC-02

---

### Epic 24: Traveler Payment & Checkout
Travelers can complete secure payment for their trip using credit cards or mobile wallets.

**FRs covered:** FR-BOOK-03, FR-BOOK-04, ARCH-EF-01, ARCH-EF-02, ARCH-EF-03, ARCH-SVC-01, NFR-SEC-01

---

### Epic 25: Real-Time Inventory & Availability
Travelers see live availability updates; bookings automatically decrement inventory with zero overbookings.

**FRs covered:** FR-BOOK-01, FR-BOOK-02, ARCH-RT-01, ARCH-RT-02, ARCH-RT-03, ARCH-SVC-03, NFR-PERF-01, NFR-CON-01

---

### Epic 26: Offline Ticket Access (PWA)
Travelers can access their booking tickets and QR codes without network connectivity.

**FRs covered:** FR-OFF-01, FR-OFF-02, NFR-REL-01, NFR-REL-02, NFR-PERF-02

---

### Epic 27: Vendor Check-In & Operations
Vendors can scan traveler QR codes to validate tickets and manage day-of operations.

**FRs covered:** FR-OPS-02, ARCH-EF-06

---

### Epic 28: Admin Refunds & Audit Trail
Admins can search bookings, process refunds, and view complete audit history for dispute resolution.

**FRs covered:** FR-ADM-01, FR-ADM-02, FR-ADM-03, ARCH-EF-04, ARCH-SVC-04, NFR-SEC-02

---

## Epic Dependencies

```
Epic 21 (Database)
    ↓
    ├── Epic 22 (Vendor KYC) ──→ Epic 23 (Availability)
    │                                    ↓
    │                              Epic 25 (Real-Time)
    │                                    ↓
    ├── Epic 24 (Payment) ────────→ Epic 26 (Offline)
    │         ↓
    │   Epic 27 (Check-In)
    │         ↓
    └── Epic 28 (Admin/Audit)
```

---

# Epic Stories

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

## Epic 22: Vendor Stripe Onboarding & KYC

Vendors can complete identity verification and bank account setup to enable receiving payments.

### Story 22.1: Create Stripe Connect Account for Vendor

As a **vendor**,
I want to initiate the Stripe Connect onboarding process,
So that I can receive payments for my experiences.

**Acceptance Criteria:**

**Given** I am a registered vendor in the system
**When** I click "Set Up Payments" on my vendor dashboard
**Then** the system calls the `vendor-onboard` Edge Function
**And** a Stripe Connect Express account is created with my email
**And** my `vendors.stripe_account_id` is populated
**And** I am redirected to Stripe's hosted onboarding flow
**And** my vendor status changes to `KYC_SUBMITTED`

---

### Story 22.2: Handle Stripe Account Update Webhooks

As a **platform operator**,
I want Stripe account status changes to update vendor records automatically,
So that vendor payment capabilities reflect their Stripe verification status.

**Acceptance Criteria:**

**Given** the `webhook-stripe` Edge Function is deployed
**When** Stripe sends an `account.updated` webhook event
**Then** the system validates the webhook signature
**And** updates `vendors.stripe_onboarding_complete` based on `charges_enabled` and `payouts_enabled`
**And** creates an audit log entry with event details
**And** if onboarding complete, vendor status transitions to `KYC_VERIFIED`

**Given** a vendor's Stripe account becomes fully verified
**When** they have linked a bank account
**Then** their vendor status transitions to `BANK_LINKED`
**And** they can enable "Instant Book" for their experiences

---

### Story 22.3: Build Vendor Payment Setup UI

As a **vendor**,
I want to see my payment setup status on my dashboard,
So that I know what steps remain before I can receive payments.

**Acceptance Criteria:**

**Given** I am on my vendor dashboard
**When** my Stripe onboarding is incomplete
**Then** I see a "Complete Payment Setup" card with progress indicator
**And** I see which steps remain (Identity, Bank Account)
**And** I can click to continue onboarding where I left off

**Given** my Stripe onboarding is complete
**When** I view my dashboard
**Then** I see a "Payments Active" badge
**And** I can click to access my Stripe Express dashboard
**And** I see my payout schedule information

---

### Story 22.4: Implement Vendor Onboarding State Machine

As a **platform operator**,
I want vendor onboarding to follow a defined state machine,
So that vendor capabilities are correctly gated at each stage.

**Acceptance Criteria:**

**Given** the vendor state machine has states: REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
**When** a vendor progresses through onboarding
**Then** state transitions are enforced in order
**And** each transition creates an audit log entry
**And** capabilities are gated by state:
  - REGISTERED: Can create draft experiences
  - KYC_SUBMITTED: Awaiting verification
  - KYC_VERIFIED: Can publish "Request to Book" experiences
  - BANK_LINKED: Can enable "Instant Book"
  - ACTIVE: Full platform access

---

### Story 22.5: Create Vendor Onboard Edge Function

As a **platform operator**,
I want a `vendor-onboard` Edge Function,
So that Stripe Connect accounts are created securely server-side.

**Acceptance Criteria:**

**Given** a vendor initiates payment setup
**When** the `vendor-onboard` Edge Function is called
**Then** it validates the vendor is authenticated
**And** creates a Stripe Connect Express account with:
  - `type: 'express'`
  - `country: 'ID'` (Indonesia)
  - `email` from vendor profile
  - `capabilities: { card_payments: { requested: true }, transfers: { requested: true } }`
**And** stores the `stripe_account_id` in the vendors table
**And** returns an Account Link URL for onboarding
**And** creates an audit log entry for account creation

---

## Epic 23: Vendor Availability Management

Vendors can create, manage, and control time-based availability slots for their experiences.

### Story 23.1: Build Slot Creation Interface

As a **vendor**,
I want to create availability slots for my experiences,
So that travelers can see when my experience is available.

**Acceptance Criteria:**

**Given** I am editing one of my experiences
**When** I navigate to the "Availability" tab
**Then** I see a calendar view of the current month
**And** I can click a date to add time slots
**And** for each slot I can set:
  - Start time
  - Duration (auto-calculated end time)
  - Capacity (number of guests)
  - Price override (optional, defaults to experience base price)
**And** I can create recurring slots (e.g., "Every Monday at 9 AM")

---

### Story 23.2: Implement Instant Book vs Request Policy

As a **vendor**,
I want to choose between "Instant Book" and "Request to Book" policies,
So that I can control how reservations are confirmed.

**Acceptance Criteria:**

**Given** I am managing my experience settings
**When** I configure booking policy
**Then** I can select:
  - "Instant Book" - Bookings are confirmed immediately upon payment
  - "Request to Book" - I must approve each booking request within 24 hours
**And** the policy is saved to `experiences.instant_book_enabled`
**And** "Instant Book" is only available if my vendor status is BANK_LINKED or ACTIVE

**Given** an experience has "Request to Book" policy
**When** a traveler requests a booking
**Then** the slot is temporarily held for 24 hours
**And** I receive a notification to approve/decline
**And** payment is only captured upon my approval

---

### Story 23.3: Configure Cut-off Time Settings

As a **vendor**,
I want to set how far in advance bookings must be made,
So that I have adequate preparation time.

**Acceptance Criteria:**

**Given** I am configuring my experience
**When** I set the "Cut-off Time"
**Then** I can specify hours before start time (e.g., 2 hours, 24 hours)
**And** this is stored in `experiences.cutoff_hours`
**And** slots within the cut-off window show as "Unavailable" to travelers
**And** the default cut-off is 2 hours if not specified

---

### Story 23.4: Manual Slot Blocking/Unblocking

As a **vendor**,
I want to manually block or unblock availability slots,
So that I can accommodate walk-in customers or close dates.

**Acceptance Criteria:**

**Given** I am viewing my availability calendar
**When** I tap/click on an existing slot
**Then** I can toggle "Block this slot" on/off
**And** blocked slots show as "Unavailable" to travelers
**And** I can add a reason for blocking (internal note)
**And** blocking a slot does NOT cancel existing confirmed bookings

**Given** I have a walk-in customer
**When** I add them via "Manual Walk-in" button
**Then** `available_count` decreases by the guest count
**And** a booking record is created with source = "walk_in"
**And** real-time updates propagate to all connected clients

---

### Story 23.5: Create Slot Service Module

As a **developer**,
I want a `slotService.ts` module,
So that slot CRUD operations are centralized and type-safe.

**Acceptance Criteria:**

**Given** the slotService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `createSlot(experienceId, slotData)` - Create new slot
  - `updateSlot(slotId, updates)` - Update slot details
  - `blockSlot(slotId, reason?)` - Mark slot as blocked
  - `unblockSlot(slotId)` - Remove block
  - `getAvailableSlots(experienceId, dateRange)` - Query available slots
  - `decrementAvailability(slotId, count)` - Atomic decrement with locking
**And** all mutations create appropriate audit log entries
**And** TypeScript types match the database schema

---

## Epic 24: Traveler Payment & Checkout

Travelers can complete secure payment for their trip using credit cards or mobile wallets.

### Story 24.1: Create Checkout Edge Function

As a **platform operator**,
I want a `checkout` Edge Function,
So that Stripe Checkout Sessions are created securely.

**Acceptance Criteria:**

**Given** a traveler initiates checkout
**When** the `checkout` Edge Function is called
**Then** it validates:
  - User is authenticated
  - All items in cart have available inventory
  - All experiences accept the user's payment method
**And** creates a Stripe Checkout Session with:
  - `mode: 'payment'`
  - `payment_method_types: ['card']`
  - Line items for each experience booking
  - `payment_intent_data.transfer_data.destination` for each vendor
  - Platform fee calculated (e.g., 15%)
  - Success and cancel URLs
**And** returns the Checkout Session URL
**And** creates a `payments` record with status = 'pending'

---

### Story 24.2: Build Checkout Review Screen

As a **traveler**,
I want to review my trip before payment,
So that I can verify all details are correct.

**Acceptance Criteria:**

**Given** I have items in my trip and click "Checkout"
**When** the checkout review screen loads
**Then** I see:
  - List of all experiences with dates, times, guest counts
  - Price breakdown per item
  - Platform fees (if displayed)
  - Total amount
  - Cancellation policy summary for each item
**And** I can remove items from checkout
**And** I can adjust guest counts (if availability allows)
**And** I see real-time availability status (e.g., "2 spots left")

---

### Story 24.3: Integrate Stripe Elements for Payment

As a **traveler**,
I want to enter my payment details securely,
So that my card information is protected.

**Acceptance Criteria:**

**Given** I am on the payment step of checkout
**When** the payment form renders
**Then** Stripe Elements iframe loads for card input
**And** I can enter card number, expiry, CVC
**And** Apple Pay / Google Pay buttons appear if supported
**And** card input validates in real-time (card type, errors)
**And** NO raw card data touches our servers (PCI SAQ-A compliance)
**And** 3D Secure is enforced for liability shift

---

### Story 24.4: Handle Stripe Webhooks for Payment Events

As a **platform operator**,
I want the `webhook-stripe` Edge Function to process payment events,
So that booking status reflects payment outcomes.

**Acceptance Criteria:**

**Given** the `webhook-stripe` Edge Function is deployed
**When** Stripe sends `checkout.session.completed` event
**Then** the system:
  - Validates webhook signature
  - Finds the payment record by session ID
  - Updates payment status to 'succeeded'
  - Calls `create-booking` Edge Function to confirm bookings
  - Decrements slot availability atomically
  - Creates audit log entries

**Given** Stripe sends `payment_intent.payment_failed` event
**When** webhook is processed
**Then** payment status updates to 'failed'
**And** held inventory is released
**And** user receives failure notification

---

### Story 24.5: Create Booking Confirmation Edge Function

As a **platform operator**,
I want a `create-booking` Edge Function,
So that bookings are atomically created with inventory decrements.

**Acceptance Criteria:**

**Given** payment is successful
**When** `create-booking` Edge Function is called
**Then** it executes in a database transaction:
  - Acquires row-level lock on affected slots (SELECT FOR UPDATE)
  - Verifies availability hasn't changed
  - Creates booking records with status = 'confirmed'
  - Decrements `available_count` for each slot
  - If any slot is unavailable, entire transaction rolls back
**And** returns confirmation numbers
**And** creates audit log for each booking

---

### Story 24.6: Generate and Send PDF Ticket

As a **traveler**,
I want to receive a PDF ticket immediately after booking,
So that I have proof of purchase and entry credentials.

**Acceptance Criteria:**

**Given** my booking is confirmed
**When** confirmation processing completes
**Then** a PDF ticket is generated containing:
  - QR code encoding booking ID
  - Experience name and date/time
  - Guest count
  - Meeting point information
  - Vendor contact info
  - Cancellation policy
**And** PDF is emailed to my registered email
**And** PDF is stored and accessible from my bookings page
**And** email delivery is logged for support reference

---

### Story 24.7: Create Payment Service Module

As a **developer**,
I want a `paymentService.ts` module,
So that Stripe operations are centralized and type-safe.

**Acceptance Criteria:**

**Given** the paymentService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `createCheckoutSession(items, userId)` - Create Stripe session
  - `getPaymentByBookingId(bookingId)` - Retrieve payment record
  - `calculatePlatformFee(amount)` - Calculate fee (15%)
  - `calculateVendorPayout(amount, fee)` - Calculate vendor amount
**And** all Stripe API calls include idempotency keys
**And** TypeScript types align with Stripe SDK types

---

## Epic 25: Real-Time Inventory & Availability

Travelers see live availability updates; bookings automatically decrement inventory with zero overbookings.

### Story 25.1: Implement Supabase Realtime Subscriptions

As a **traveler**,
I want to see availability update in real-time,
So that I know the current booking status without refreshing.

**Acceptance Criteria:**

**Given** I am viewing an experience detail page
**When** another user books a slot I'm viewing
**Then** the availability count updates within 500ms
**And** if a slot becomes sold out, the UI updates immediately
**And** I see a subtle animation indicating the change
**And** subscription is automatically cleaned up when I leave the page

---

### Story 25.2: Create Real-Time Service Module

As a **developer**,
I want a `realtimeService.ts` module,
So that Supabase Realtime subscriptions are managed consistently.

**Acceptance Criteria:**

**Given** the realtimeService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `subscribeToSlotAvailability(experienceId, callback)` - Watch slot changes
  - `subscribeToBookingStatus(bookingId, callback)` - Watch booking updates
  - `unsubscribe(subscriptionId)` - Clean up subscription
  - `unsubscribeAll()` - Clean up all subscriptions
**And** subscriptions use Supabase Realtime channels
**And** reconnection is handled automatically
**And** TypeScript types for callback payloads are provided

---

### Story 25.3: Implement Atomic Inventory Decrement

As a **platform operator**,
I want inventory decrements to be atomic,
So that concurrent bookings never cause overbooking.

**Acceptance Criteria:**

**Given** multiple users attempt to book the last available slot simultaneously
**When** the booking transactions execute
**Then** only ONE booking succeeds (the first to acquire the lock)
**And** other attempts receive "Slot no longer available" error
**And** the database uses SERIALIZABLE isolation or SELECT FOR UPDATE
**And** stress test with 10 concurrent requests shows 0 overbookings

---

### Story 25.4: Add Instant Confirmation Filter

As a **traveler**,
I want to filter experiences by "Instant Confirmation",
So that I can find experiences that confirm immediately.

**Acceptance Criteria:**

**Given** I am browsing experiences
**When** I enable the "Instant Confirmation" filter
**Then** only experiences with `instant_book_enabled = true` are shown
**And** each result shows an "Instant" badge
**And** the filter is available on search results and category browse screens

---

### Story 25.5: Display Real-Time Slot Availability

As a **traveler**,
I want to see how many spots are left for each time slot,
So that I can make informed booking decisions.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I view available time slots
**Then** each slot shows:
  - Time (e.g., "10:00 AM")
  - Available count (e.g., "5 spots left")
  - Price (or "From $X")
  - Visual indicator for low availability (< 3 spots)
**And** sold out slots are shown but disabled
**And** availability updates in real-time via subscription

---

## Epic 26: Offline Ticket Access (PWA)

Travelers can access their booking tickets and QR codes without network connectivity.

### Story 26.1: Implement Service Worker for Ticket Caching

As a **traveler**,
I want my tickets cached for offline access,
So that I can show my ticket even without internet.

**Acceptance Criteria:**

**Given** I have a confirmed booking
**When** I view my ticket page while online
**Then** the Service Worker caches:
  - Ticket page HTML/JS/CSS
  - QR code image
  - Booking metadata (experience name, time, meeting point)
**And** cached data persists for 30 days
**And** cache is updated when I view the ticket online

---

### Story 26.2: Build Offline Ticket Display

As a **traveler**,
I want to view my ticket when offline,
So that I can gain entry to my experience.

**Acceptance Criteria:**

**Given** I have a cached ticket
**When** I am offline and open my ticket page
**Then** I see:
  - QR code (prominently displayed)
  - Experience name and date/time
  - Guest count
  - Meeting point information
  - "Offline Mode" indicator
  - "Last Updated" timestamp
**And** the page loads in < 1.5 seconds (TTI)
**And** I can access the ticket from my bookings list

---

### Story 26.3: Show Last Updated Timestamp

As a **traveler**,
I want to see when my ticket data was last updated,
So that I know if the information is current.

**Acceptance Criteria:**

**Given** I am viewing a cached ticket offline
**When** the ticket displays
**Then** I see "Last updated: [timestamp]" (e.g., "Last updated: 2 hours ago")
**And** if data is older than 24 hours, I see a warning
**And** a "Refresh" button is available (grayed out when offline)

---

### Story 26.4: Implement Network Restoration Sync

As a **traveler**,
I want my app to sync automatically when I regain connectivity,
So that I have the latest booking information.

**Acceptance Criteria:**

**Given** I was offline and network is restored
**When** the app detects connectivity
**Then** within 10 seconds it:
  - Syncs any pending state changes
  - Refreshes cached ticket data
  - Updates booking status if changed
  - Shows brief "Syncing..." indicator
**And** if booking was cancelled while offline, I see a clear notification

---

### Story 26.5: PWA Installation and Offline Indicator

As a **traveler**,
I want to install Pulau as a PWA,
So that I have app-like access to my tickets.

**Acceptance Criteria:**

**Given** I visit Pulau on a mobile browser
**When** the PWA installation prompt appears
**Then** I can add Pulau to my home screen
**And** the PWA icon reflects Pulau branding
**And** when launched, shows splash screen
**And** when offline, shows "Offline" banner at top of app
**And** offline-capable pages remain functional

---

## Epic 27: Vendor Check-In & Operations

Vendors can scan traveler QR codes to validate tickets and manage day-of operations.

### Story 27.1: Build QR Code Scanner Interface

As a **vendor**,
I want to scan traveler QR codes,
So that I can validate their tickets at check-in.

**Acceptance Criteria:**

**Given** I am on my vendor operations page
**When** I tap "Scan Ticket"
**Then** the device camera activates for QR scanning
**And** I can scan any booking QR code
**And** after successful scan, I see booking details:
  - Traveler name
  - Experience name
  - Time slot
  - Guest count
  - Check-in status

---

### Story 27.2: Implement Ticket Validation Logic

As a **vendor**,
I want scanned tickets to be validated against bookings,
So that I only admit travelers with valid reservations.

**Acceptance Criteria:**

**Given** I scan a QR code
**When** the booking ID is decoded
**Then** the system validates:
  - Booking exists and is confirmed
  - Booking is for today's date
  - Booking is for one of my experiences
  - Booking hasn't already been checked in
**And** if valid, I see green "VALID" indicator with details
**And** if invalid, I see red "INVALID" with reason

---

### Story 27.3: Record Check-In Status

As a **vendor**,
I want to mark travelers as checked in,
So that I have a record of attendance.

**Acceptance Criteria:**

**Given** I have validated a ticket
**When** I tap "Check In" button
**Then** the booking status updates to "checked_in"
**And** check-in timestamp is recorded
**And** an audit log entry is created
**And** I cannot check in the same booking twice
**And** check-in works offline (syncs when online)

---

### Story 27.4: View Today's Bookings Dashboard

As a **vendor**,
I want to see all bookings for today,
So that I can prepare for my guests.

**Acceptance Criteria:**

**Given** I am on my vendor operations page
**When** I view "Today's Bookings"
**Then** I see a list of all bookings for today's date:
  - Time slot
  - Traveler name
  - Guest count
  - Check-in status (Pending / Checked In / No Show)
**And** I can filter by experience (if I have multiple)
**And** I can mark no-shows after the experience time passes
**And** total guest count is summarized at top

---

### Story 27.5: Create Vendor Payout Status Edge Function

As a **vendor**,
I want to check my payout status,
So that I know when to expect payment.

**Acceptance Criteria:**

**Given** I have completed bookings
**When** I call the `vendor-payout-status` Edge Function
**Then** it returns:
  - Pending payouts (funds in escrow)
  - Scheduled payouts (with expected date)
  - Completed payouts (with Stripe transfer ID)
  - Payout schedule settings from Stripe account
**And** data is fetched from Stripe Connect API
**And** response is cached for 5 minutes to reduce API calls

---

## Epic 28: Admin Refunds & Audit Trail

Admins can search bookings, process refunds, and view complete audit history for dispute resolution.

### Story 28.1: Build Booking Search Interface

As an **admin**,
I want to search bookings by various criteria,
So that I can find specific bookings for support.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** I use the booking search
**Then** I can search by:
  - Booking ID (exact match)
  - Traveler email (partial match)
  - Vendor name (partial match)
  - Date range
  - Booking status
**And** results show key booking details
**And** I can click a booking to view full details
**And** search supports pagination for large result sets

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

