# Story 33.4: Checkout Form Optimization (Pre-fill)

Status: ready-for-dev

## Story

As a **User on Mobile**,
I want **my checkout details to be pre-filled based on my earlier choices**,
So that **I can complete the booking without repetitive typing, which is frustrating on a phone.**

## Acceptance Criteria

### AC 1: Guest Count Pre-fill

**Given** I enter the checkout flow
**When** the form loads
**Then** the "Number of Guests" field should default to a value derived from my "Group Type" preference

- Solo = 1
- Couple = 2
- Family = 4 (editable)

### AC 2: Date Pre-fill

**Given** I have previously selected dates (in Onboarding or Search)
**Then** the Checkout Date picker should be pre-populated with those dates
**Else** it should default to the nearest available weekend (or prompt "Select Dates")

### AC 3: Minimal Contact Fields

**Given** I am a returning user (profile exists)
**Then** Name and Email fields should be pre-filled and read-only (or easily impactful)
**Given** I am a guest
**Then** I should only see "Full Name" and "Email" as mandatory contact fields

### AC 4: Payment Visuals (Mock)

**Given** I reach the payment section
**Then** I should see a prominent "Apple Pay" (or "Pay Now") button as the primary action
**And** typical credit card fields should be collapsed or secondary
_Note: This story covers the UI logic, the actual Stripe integration is in Epic 24._

### AC 5: Trust Reinforcement

**Given** I am about to tap "Pay"
**Then** a "Free Cancellation until [Date]" message should be visible in close proximity to the price/button
**And** the Total Price should be explicitly broken down (Taxes included/excluded)

## Tasks / Subtasks

### Task 1: Create Checkout Form Smart Defaults (AC: #1, #2)

- [ ] Modify `src/components/checkout/CheckoutFlow.tsx` or `ContactForm`
- [ ] Read `UserPreferences` from context
- [ ] Map `groupType` -> `guestCount` integer
- [ ] Initialize `react-hook-form` (or state) with these defaults

### Task 2: Implement "One-Tap" Payment UI (AC: #4)

- [ ] Create a `PaymentRequestButton` component (Visual only for now)
- [ ] Style it to resemble Apple Pay / Google Pay standards
- [ ] Ensure it triggers the `onSuccess` flow for this MVP phase

### Task 3: Trust Signal Components (AC: #5)

- [ ] Add `TrustBadge` component near total
- [ ] Implement simple date calculation for "Free cancellation until [Today + 1 month]" logic (mock logic)

### Task 4: Testing (All ACs)

- [ ] Verify defaults load correctly for different "Group Type" settings
- [ ] Test form validation (ensure fields can still be edited)

## Dev Notes

### Smart Default Logic

```typescript
const getGuestCount = (groupType: string) => {
  switch (groupType) {
    case 'solo':
      return 1;
    case 'couple':
      return 2;
    case 'family':
      return 4;
    case 'friends':
      return 4;
    default:
      return 2;
  }
};
```
