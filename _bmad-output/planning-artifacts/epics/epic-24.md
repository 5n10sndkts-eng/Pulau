## Epic 24: Traveler Payment & Checkout

Travelers can complete secure payment for their trip using credit cards or mobile wallets.

### Story 24.1: Initialize Secure Checkout with Payment Infrastructure

As a **traveler**,
I want to complete a secure checkout for my trip,
So that I can confirm my bookings with payment.

**Acceptance Criteria:**

**Given** I have items in my trip canvas and click "Proceed to Checkout"
**When** the checkout process initializes
**Then** the system creates the payments table if not exists (id, booking_id, stripe_payment_intent_id, amount, currency, status, created_at)
**And** the system creates the `checkout` Edge Function if not exists
**And** a new checkout session is created with my cart items
**And** it validates:
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
**And** appropriate RLS policies are applied to payments table
**And** session data is persisted with 30-minute expiration

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
