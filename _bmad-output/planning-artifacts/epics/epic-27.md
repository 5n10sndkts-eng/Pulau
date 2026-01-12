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
