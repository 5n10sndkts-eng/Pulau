## Epic 22: Vendor Stripe Onboarding & KYC

Vendors can complete identity verification and bank account setup to enable receiving payments.

### Story 22.1: Initialize Vendor Stripe Onboarding with Database Foundation

As a **vendor**,
I want to begin the Stripe Connect onboarding process,
So that I can receive payments for my experiences.

**Acceptance Criteria:**

**Given** I am a registered vendor in the system
**When** I click "Set Up Payments" on my vendor dashboard
**Then** the system creates the vendors table Stripe columns if not exists (stripe_account_id, kyc_status, onboarding_completed)
**And** the system calls the `vendor-onboard` Edge Function
**And** a Stripe Connect Express account is created with my email
**And** my `vendors.stripe_account_id` is populated
**And** I am redirected to Stripe's hosted onboarding flow
**And** my vendor status changes to `KYC_SUBMITTED`
**And** appropriate database indexes are created for vendor payment lookups

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
