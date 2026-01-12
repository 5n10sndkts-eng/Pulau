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
