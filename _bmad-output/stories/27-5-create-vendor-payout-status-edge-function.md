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
