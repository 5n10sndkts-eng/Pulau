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
