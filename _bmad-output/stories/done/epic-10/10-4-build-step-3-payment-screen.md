# Story 10.4: Build Step 3 - Payment Screen

Status: done

## Story

As a traveler in checkout,
I want to enter payment information securely,
So that I can complete my purchase.

## Acceptance Criteria

**AC #1: Display order summary and payment options**
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

**AC #2: Require CVV for saved cards**
**When** I select a saved card
**Then** CVV re-entry is required for security

**AC #3: Format and validate card fields**
**When** I enter card details
**Then** card number formats automatically (#### #### #### ####)
**And** card brand icon appears (Visa/Mastercard/Amex)
**And** validation runs on blur and submit

## Tasks / Subtasks

### Task 1: Create PaymentStep component layout (AC: #1)
- [x] Build PaymentStep with order summary sidebar
- [x] Display trip total, item count, "Need help?" link
- [x] Add saved payment methods list (if any)
- [x] Create "Add New Card" form section
- [x] Include alternative payment buttons (PayPal, Apple Pay, Google Pay)

### Task 2: Implement card input fields with formatting (AC: #3)
- [x] Add Card Number input with auto-formatting (#### #### #### ####)
- [x] Detect card brand (Visa, Mastercard, Amex) and show icon
- [x] Add Expiry Date input with MM/YY formatting
- [x] Add CVV input (3-4 digits, password masked)
- [x] Add Cardholder Name input (text)

### Task 3: Add saved card selection with CVV re-entry (AC: #2)
- [x] Display list of saved cards (last 4 digits, brand, expiry)
- [x] Add radio buttons for card selection
- [x] Show CVV re-entry field when saved card selected
- [x] Validate CVV on submit
- [x] Add "Use new card" option

### Task 4: Implement card validation (AC: #3)
- [x] Validate card number with Luhn algorithm
- [x] Validate expiry date: MM/YY format, not expired
- [x] Validate CVV: 3 digits (Visa/MC) or 4 (Amex)
- [x] Validate cardholder name: min 2 characters
- [x] Show inline errors on invalid fields

### Task 5: Add alternative payment options (AC: #1)
- [x] Create PayPal button integration
- [x] Add Apple Pay button (if window.ApplePaySession exists)
- [x] Add Google Pay button (if Google Pay available)
- [x] Handle payment method selection state
- [x] Disable card form when alternative method selected

## Dev Notes

### Technical Guidance
- Card formatting: use `react-credit-cards` or custom formatter
- Luhn algorithm: validate card number checksum
- Card brand detection: check first digits (4=Visa, 5=MC, 3=Amex)
- Payment gateway: prepare for Stripe/PayPal integration (Story 10.5)
- Validation: use Zod schema from Story 10.7

### Card Number Formatting
```typescript
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ').substr(0, 19); // Max 16 digits + 3 spaces
};

const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'unknown';
};
```

### Luhn Algorithm Validation
```typescript
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    if (isEven) digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};
```

### Visual Specifications
- Card form: centered, max-width 500px
- Card number input: mono font, auto-spacing
- Card brand icon: 40px width, right side of input
- CVV input: 80px width, password masked
- Saved cards: card brand icon, "•••• 4242", expiry date
- Alternative payment buttons: branded colors (PayPal blue, Apple black)

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.4]
- [Source: prd/pulau-prd.md#Checkout Step 3 - Payment]
- [Related: Story 10.5 - Implement Payment Processing]
- [Related: Story 10.7 - Implement Form Validation with Zod]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

