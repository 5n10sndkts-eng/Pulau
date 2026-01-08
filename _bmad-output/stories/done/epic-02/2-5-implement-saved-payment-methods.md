# Story 2.5: Implement Saved Payment Methods

Status: ready-for-dev

## Story

As a frequent traveler,
I want to save my payment methods securely,
so that checkout is faster on future bookings.

## Acceptance Criteria

1. **Given** I am logged in and on the Payment Methods settings screen **When** I add a new payment method (credit card) **Then** card details are tokenized via payment gateway (Stripe/PayPal) without storing raw card numbers
2. Only last 4 digits and card brand (Visa/Mastercard) are stored in payment_methods KV namespace
3. payment_methods KV namespace includes: user_id, payment_token, last_four, card_brand, expiry_month, expiry_year, is_default
4. **When** I set a card as default **Then** is_default flag updates, and only one card can be default
5. **When** I delete a payment method **Then** the record is soft-deleted (deleted_at timestamp)
6. I can add multiple payment methods
7. PCI compliance is maintained (no raw card data stored)

## Tasks / Subtasks

- [ ] Task 1: Create payment methods list screen (AC: #2, #3, #6)
  - [ ] Create `src/screens/profile/PaymentMethodsScreen.tsx`
  - [ ] Display list of saved cards with card brand icon
  - [ ] Show "•••• [last 4 digits]" format
  - [ ] Show expiry date (MM/YY format)
  - [ ] Display "Default" badge on default card
  - [ ] Add "+ Add New Card" button at bottom
- [ ] Task 2: Create add card modal/screen (AC: #1, #7)
  - [ ] Create card entry form (mocked for MVP)
  - [ ] Input fields: card number, expiry (MM/YY), CVV, cardholder name
  - [ ] Format card number with spaces (#### #### #### ####)
  - [ ] Detect and display card brand icon (Visa/Mastercard/Amex)
  - [ ] Mock tokenization (generate fake token, store only last 4)
  - [ ] Add "Save this card" confirmation button
- [ ] Task 3: Implement payment method data model (AC: #3)
  - [ ] Define PaymentMethod type in `src/types/payment.ts`
  - [ ] Include: id, user_id, payment_token, last_four, card_brand, expiry_month, expiry_year, is_default, deleted_at
  - [ ] Create payment methods storage in useKV
  - [ ] Filter deleted methods from display
- [ ] Task 4: Implement card management (AC: #4, #5)
  - [ ] Add "Set as Default" option on card tap
  - [ ] Implement default flag logic (only one default)
  - [ ] Add "Remove" option with confirmation modal
  - [ ] Implement soft delete (set deleted_at timestamp)
  - [ ] Show "Card removed" toast on delete
- [ ] Task 5: Validate card input (AC: #1)
  - [ ] Validate card number with Luhn algorithm
  - [ ] Validate expiry is not in past
  - [ ] Validate CVV is 3-4 digits
  - [ ] Show inline validation errors

## Dev Notes

- Real payment tokenization requires backend - mock for MVP
- Never store full card numbers in any storage
- Card brand detection: Visa (4xxx), Mastercard (5xxx), Amex (34xx/37xx)
- Consider Apple Pay / Google Pay buttons for future enhancement

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: prd/pulau-prd.md#Payment Processing]
- [Source: architecture/architecture.md#Payment Integration]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

