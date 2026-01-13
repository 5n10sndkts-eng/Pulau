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
