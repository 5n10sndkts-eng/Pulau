# Epic 10: Multi-Step Checkout & Booking

**Goal:** Travelers complete secure bookings through guided 4-step checkout (Review → Traveler Details → Payment → Confirmation) with form validation, session persistence, payment processing, and success animations.

**Phase:** Phase 1 (MVP)
**Dependencies:** Epic 8 (Trip Builder), Epic 2 (Mock Auth)
**Storage:** **Spark KV Store** (`pulau_bookings_{userId}`)

### Story 10.1: Create Checkout Flow Navigation
As a traveler ready to book, I want a clear multi-step checkout process, so that I can complete my booking with confidence.

**Acceptance Criteria:**
- **Given** checkout initiates **Then** I see a 4-step progress indicator at the top
- **And** I can navigate back to completed steps but cannot skip ahead
- **And** checkout state persists through page refreshes using KV store

### Story 10.2: Build Step 1 - Trip Review Screen
As a traveler in checkout, I want to review my complete trip before providing details, so that I can confirm my selections.

**Acceptance Criteria:**
- **Given** Step 1 (Review) **Then** I see all trip items with thumbnails, guest counts, and prices
- **And** price summary shows Subtotal, 10% Service Fee, and Grand Total
- **And** "Edit Trip" link allows returning to the builder

### Story 10.3: Build Step 2 - Traveler Details Form
As a traveler in checkout, I want to enter my contact and traveler information, so that operators can reach me.

**Acceptance Criteria:**
- **Given** Step 2 (Traveler Details) **Then** form displays required contact fields (pre-filled if logged in via Epic 2)
- **And** form uses Zod validation for required fields
- **And** validation errors display inline; "Continue" button enables ONLY when valid

### Story 10.4: Build Step 3 - Payment Screen
As a traveler in checkout, I want to enter payment information securely, so that I can complete my purchase.

**Acceptance Criteria:**
- **Given** Step 3 (Payment) **Then** I see order summary and saved payment methods
- **When** adding new card **Then** brand detection (Visa/MC) and auto-formatting apply
- **And** CVV re-entry is required for saved cards

### Story 10.5: Implement Payment Processing (Mock)
As a traveler submitting payment, I want my payment processed securely, so that my booking is confirmed.

**MVP Note:** Payment processing is **mocked**. Real payment gateway integration (Stripe) is **deferred** (see Backlog).

**Acceptance Criteria:**

*Happy Path:*
- **Given** "Pay" button tapped **When** processing **Then** button shows spinner with "Processing..."; all inputs disabled
- **And** payment token generated (mock: simulated 2-second delay)
- **And** booking record created in KV namespace `pulau_bookings_{userId}` with 'pending' status
- **When** mock payment succeeds **Then** status updates to 'confirmed'
- **And** a unique booking reference `PL-{YYYYMMDD}-{UUID.slice(0,8)}` is generated
- **And** user is redirected to Step 4 (Confirmation)

*Error Cases:*
- **Given** payment gateway returns error **Then** booking remains in 'pending' status and user can retry
- **And** form data is preserved; user does not need to re-enter card details

### Story 10.6: Build Step 4 - Confirmation Screen
As a traveler who completed booking, I want to see my booking confirmation, so that I know my reservation is secured.

**Acceptance Criteria:**
- **Given** Step 4 (Confirmation) **Then** confetti burst animation plays with success heading
- **And** displays booking reference, summary, and action buttons (View My Trips, Back Home)

### Story 10.7: Implement Form Validation with Zod
As a developer, I want consistent form validation across checkout, so that user input is validated reliably.

**Acceptance Criteria:**
- **Given** Hook Form usage **Then** Zod schemas enforce required name, email, and international phone formats
- **And** paymentSchema validates card length (Luhn), expiry, and CVV digits

### Story 10.8: Session Persistence for Incomplete Bookings
As a traveler who gets interrupted during checkout, I want my progress saved, so that I can resume where I left off.

**Acceptance Criteria:**
- **Given** partial progress **When** returning within 24 hours **Then** "Continue your booking?" prompt appears
- **And** session state (form data, step, trip) is restored from Spark useKV
