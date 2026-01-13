### Story 10.4: Build Step 3 - Payment Screen

As a traveler in checkout,
I want to enter payment information securely,
So that I can complete my purchase.

**Acceptance Criteria:**

**Given** I am on checkout Step 3 (Payment)
**When** the screen loads
**Then** I see order summary: item count, total price
**And** saved payment methods display (if any from user profile)
**And** "Add New Card" option with fields:

- Card Number (with card brand icon detection)
- Expiry Date (MM/YY)
- CVV
- Cardholder Name
  **And** alternative payment buttons: PayPal, Apple Pay (if available), Google Pay (if available)
  **And** "Save this card for future bookings" checkbox
  **When** I select a saved card
  **Then** CVV re-entry is required for security
  **When** I enter card details
  **Then** card number formats automatically (#### #### #### ####)
  **And** card brand icon appears (Visa/Mastercard/Amex)
  **And** validation runs on blur and submit
