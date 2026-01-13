### Story 24.4: Handle Stripe Webhooks for Payment Events

As a **platform operator**,
I want the `webhook-stripe` Edge Function to process payment events,
So that booking status reflects payment outcomes.

**Acceptance Criteria:**

**Given** the `webhook-stripe` Edge Function is deployed
**When** Stripe sends `checkout.session.completed` event
**Then** the system:

- Validates webhook signature
- Finds the payment record by session ID
- Updates payment status to 'succeeded'
- Calls `create-booking` Edge Function to confirm bookings
- Decrements slot availability atomically
- Creates audit log entries

**Given** Stripe sends `payment_intent.payment_failed` event
**When** webhook is processed
**Then** payment status updates to 'failed'
**And** held inventory is released
**And** user receives failure notification

---
