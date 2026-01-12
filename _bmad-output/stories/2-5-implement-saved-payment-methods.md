### Story 2.5: Implement Saved Payment Methods

As a frequent traveler,
I want to save my payment methods securely,
So that checkout is faster on future bookings.

**Acceptance Criteria:**

**Given** I am logged in and on the Payment Methods settings screen
**When** I add a new payment method (credit card)
**Then** card details are tokenized via payment gateway (Stripe/PayPal) without storing raw card numbers
**And** only last 4 digits and card brand (Visa/Mastercard) are stored in payment_methods table
**And** payment_methods table includes: user_id, payment_token, last_four, card_brand, expiry_month, expiry_year, is_default
**When** I set a card as default
**Then** is_default flag updates, and only one card can be default
**When** I delete a payment method
**Then** the record is soft-deleted (deleted_at timestamp)
**And** I can add multiple payment methods
**And** PCI compliance is maintained (no raw card data stored)
