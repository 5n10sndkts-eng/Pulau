# Story 13.3: Build Payment Methods Management

Status: ready-for-dev

## Story

As a user,
I want to manage my saved payment methods,
So that checkout is convenient.

## Acceptance Criteria

### AC 1: Payment Methods Screen Display
**Given** I tap "Payment Methods" from profile
**When** the payment methods screen loads
**Then** I see list of saved cards with card brand icon, last 4 digits, expiry date, and "Default" badge if is_default = true

### AC 2: Add New Card Button
**Given** the payment methods screen is displayed
**When** I scroll to the bottom
**Then** I see "+ Add New Card" button

### AC 3: Card Options
**Given** I tap a card
**When** options appear
**Then** I see: "Set as Default", "Remove"

### AC 4: Remove Card Confirmation
**Given** I tap "Remove"
**When** confirmation modal appears
**Then** I see "Remove this card?" confirmation
**And** on confirm, card soft-deleted (deleted_at set)

### AC 5: Add New Card Flow
**Given** I tap "Add New Card"
**When** card entry form opens
**Then** I see the same card form as checkout

## Tasks / Subtasks

### Task 1: Create Payment Methods Screen (AC: #1)
- [ ] Create screen in `app/profile/payments.tsx`
- [ ] Query payment_methods WHERE user_id AND deleted_at IS NULL
- [ ] Display cards in list with brand icon, masked number, expiry
- [ ] Show "Default" badge for is_default cards
- [ ] Add skeleton loader

### Task 2: Build Payment Card Component (AC: #1)
- [ ] Create PaymentMethodCard component
- [ ] Display card brand logo (Visa, Mastercard, Amex)
- [ ] Show "•••• {last4}"
- [ ] Display expiry MM/YY
- [ ] Add "Default" badge styling
- [ ] Make card tappable for options

### Task 3: Implement Card Options Menu (AC: #3)
- [ ] Show action sheet/bottom sheet on card tap
- [ ] Add "Set as Default" option
- [ ] Add "Remove" option (destructive style)
- [ ] Handle set default: UPDATE payment_methods SET is_default
- [ ] Ensure only one card can be default

### Task 4: Build Remove Card Flow (AC: #4)
- [ ] Show confirmation modal on remove
- [ ] Soft delete: SET deleted_at = NOW()
- [ ] Prevent removing default card (must set another default first)
- [ ] Show success toast
- [ ] Refresh card list

### Task 5: Integrate Add Card Flow (AC: #2, #5)
- [ ] Add "+ Add New Card" button
- [ ] Navigate to card entry form
- [ ] Reuse CardEntryForm from checkout
- [ ] Save card and return to payment methods screen
- [ ] Set as default if first card

## Dev Notes

### Query Payment Methods
```typescript
const { data: paymentMethods } = await supabase
  .from('payment_methods')
  .select('*')
  .eq('user_id', user.id)
  .is('deleted_at', null)
  .order('is_default', { ascending: false });
```

### Card Brand Icons
Use `@stripe/react-stripe-js` or custom icons for Visa, Mastercard, Amex, etc.

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.3]
- [Related: Story 9.1 - Build Payment Entry Form]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
