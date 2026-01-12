### Story 10.5: Implement Payment Processing

As a traveler submitting payment,
I want my payment processed securely,
So that my booking is confirmed.

**Acceptance Criteria:**

**Given** I tap "Pay $XXX" button on payment screen
**When** payment processing begins
**Then** button shows loading spinner and "Processing..."
**And** all form inputs are disabled during processing
**And** payment token is generated via payment gateway (Stripe/PayPal)
**And** booking record created in bookings table:
  - id, user_id, trip_id, status: 'pending', total_amount, payment_token, created_at
**When** payment succeeds
**Then** booking status updates to 'confirmed'
**And** booking_reference generated (format: PL-XXXXXX)
**And** user advances to Step 4 (Confirmation)
**When** payment fails
**Then** error message displays: "Payment failed: [reason]"
**And** "Try Again" button allows retry
**And** booking status remains 'pending' or 'failed'
