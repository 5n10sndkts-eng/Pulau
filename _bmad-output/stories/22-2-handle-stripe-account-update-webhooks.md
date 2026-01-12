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
