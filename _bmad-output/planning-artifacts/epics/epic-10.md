## Epic 10: Multi-Step Checkout & Booking

**Goal:** Travelers complete secure bookings through guided 4-step checkout (Review → Traveler Details → Payment → Confirmation) with form validation, session persistence, payment processing, and success animations.

### Story 10.1: Initialize Secure Checkout with Serverless Backend

As a traveler,
I want to begin the checkout process for my trip,
So that I can complete my booking securely.

**Acceptance Criteria:**

**Given** I have items in my trip canvas and tap "Continue to Booking"
**When** the checkout flow initiates
**Then** Supabase Edge Functions are configured if not deployed
**And** the checkout Edge Function processes my cart data
**And** session validation occurs via Supabase Auth
**And** I see a 4-step progress indicator at top:
  - Step 1: Review (active)
  - Step 2: Traveler Details
  - Step 3: Payment
  - Step 4: Confirmation
**And** progress bar fills as I advance through steps
**And** step labels show: completed (checkmark), current (filled circle), upcoming (empty circle)
**And** I can tap completed steps to go back
**And** I cannot skip ahead to future steps
**And** checkout state persists to session (survives page refresh)
**And** inventory validation runs against real-time availability
**And** checkout session expires after 30 minutes of inactivity

### Story 10.2: Build Step 1 - Trip Review Screen

As a traveler in checkout,
I want to review my complete trip before providing details,
So that I can confirm my selections.

**Acceptance Criteria:**

**Given** I am on checkout Step 1 (Review)
**When** the screen loads
**Then** I see all trip items displayed:
  - Experience image thumbnail
  - Experience title
  - Scheduled date and time (or "Unscheduled")
  - Guest count with edit button
  - Item price (price × guests)
**And** price summary at bottom: Subtotal, Service Fee (10%), Total
**And** "Edit Trip" link returns to trip builder
**And** "Continue" button advances to Step 2
**When** I tap edit on guest count
**Then** inline stepper allows adjustment
**And** prices update immediately

### Story 10.3: Build Step 2 - Traveler Details Form

As a traveler in checkout,
I want to enter my contact and traveler information,
So that operators can reach me.

**Acceptance Criteria:**

**Given** I am on checkout Step 2 (Traveler Details)
**When** the screen loads
**Then** form displays fields (pre-filled if logged in):
  - Primary Contact: First Name*, Last Name*, Email*, Phone*
  - Trip Lead: Same as contact (checkbox), or separate fields
  - Special Requests: textarea (optional)
**And** fields marked with * are required
**And** form uses React Hook Form with Zod validation schema
**When** I submit with missing required fields
**Then** validation errors display inline below each field
**And** error border (red) highlights invalid fields
**When** all required fields are valid
**Then** "Continue to Payment" button enables
**And** form data persists to checkout session state

### Story 10.4: Build Step 3 - Payment Screen

As a traveler in checkout,
I want to enter payment information securely,
So that I can complete my purchase.

**Acceptance Criteria:**

**Given** I am on checkout Step 3 (Payment)
**When** the screen loads
**Then** I see order summary: item count, total price
**And** saved payment methods display (if any from user profile)
**And** "Add New Card" option with fields:
  - Card Number (with card brand icon detection)
  - Expiry Date (MM/YY)
  - CVV
  - Cardholder Name
**And** alternative payment buttons: PayPal, Apple Pay (if available), Google Pay (if available)
**And** "Save this card for future bookings" checkbox
**When** I select a saved card
**Then** CVV re-entry is required for security
**When** I enter card details
**Then** card number formats automatically (#### #### #### ####)
**And** card brand icon appears (Visa/Mastercard/Amex)
**And** validation runs on blur and submit

### Story 10.5: Implement Payment Processing

As a traveler submitting payment,
I want my payment processed securely,
So that my booking is confirmed.

**Acceptance Criteria:**

**Given** I tap "Pay $XXX" button on payment screen
**When** payment processing begins
**Then** button shows loading spinner and "Processing..."
**And** all form inputs are disabled during processing
**And** payment token is generated via payment gateway (Stripe/PayPal)
**And** booking record created in bookings table:
  - id, user_id, trip_id, status: 'pending', total_amount, payment_token, created_at
**When** payment succeeds
**Then** booking status updates to 'confirmed'
**And** booking_reference generated (format: PL-XXXXXX)
**And** user advances to Step 4 (Confirmation)
**When** payment fails
**Then** error message displays: "Payment failed: [reason]"
**And** "Try Again" button allows retry
**And** booking status remains 'pending' or 'failed'

### Story 10.6: Build Step 4 - Confirmation Screen

As a traveler who completed booking,
I want to see my booking confirmation,
So that I know my reservation is secured.

**Acceptance Criteria:**

**Given** payment succeeded and I'm on Step 4 (Confirmation)
**When** the screen loads
**Then** success animation plays: confetti burst (500ms) with green checkmark
**And** confirmation displays:
  - "Booking Confirmed!" heading
  - Booking reference: PL-XXXXXX (tappable to copy)
  - "Confirmation sent to [email]" message
  - Trip summary: dates, item count, total paid
**And** action buttons:
  - "View My Trips" (primary) - navigates to booking history
  - "Back to Home" (secondary)
**And** confirmation email is triggered (queued for sending)
**And** trip status updates from 'planning' to 'booked'

### Story 10.7: Implement Form Validation with Zod

As a developer,
I want consistent form validation across checkout,
So that user input is validated reliably.

**Acceptance Criteria:**

**Given** checkout forms use React Hook Form
**When** Zod schemas are defined
**Then** travelerDetailsSchema validates:
  - firstName: string, min 1, max 50
  - lastName: string, min 1, max 50
  - email: valid email format
  - phone: valid phone format (international)
**And** paymentSchema validates:
  - cardNumber: 13-19 digits (Luhn algorithm)
  - expiryDate: MM/YY format, not expired
  - cvv: 3-4 digits
  - cardholderName: string, min 2
**And** validation errors display user-friendly messages
**And** form submission is blocked until valid

### Story 10.8: Session Persistence for Incomplete Bookings

As a traveler who gets interrupted during checkout,
I want my progress saved,
So that I can resume where I left off.

**Acceptance Criteria:**

**Given** I am partway through checkout and close the browser/app
**When** I return to the app within 24 hours
**Then** I see a prompt: "Continue your booking?"
**And** my checkout progress is restored (step, form data, trip items)
**And** checkout session stored in Spark useKV with expiry timestamp
**When** session is older than 24 hours
**Then** session is cleared
**And** user starts fresh from trip builder
**When** I complete booking or explicitly cancel
**Then** checkout session is cleared

---
