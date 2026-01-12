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
