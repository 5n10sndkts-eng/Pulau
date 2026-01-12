### Story 28.3: Implement Refund Edge Function

As a **platform operator**,
I want a `process-refund` Edge Function,
So that refunds are processed securely via Stripe.

**Acceptance Criteria:**

**Given** an admin initiates a refund
**When** the `process-refund` Edge Function is called
**Then** it:
  - Validates admin has refund permissions
  - Validates refund amount doesn't exceed original payment
  - Creates Stripe refund via API
  - Updates payment record with refund_amount and refund_reason
  - Updates booking status to "refunded" or "partially_refunded"
  - Creates audit log entry with all details
**And** uses idempotency key to prevent duplicate refunds
**And** handles Stripe errors gracefully

---
