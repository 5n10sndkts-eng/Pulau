# Story 13.3: Build Payment Methods Management

Status: done

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
- [x] Create screen in `app/profile/payments.tsx`
- [x] Query payment_methods WHERE user_id AND deleted_at IS NULL
- [x] Display cards in list with brand icon, masked number, expiry
- [x] Show "Default" badge for is_default cards
- [x] Add skeleton loader

### Task 2: Build Payment Card Component (AC: #1)
- [x] Create PaymentMethodCard component
- [x] Display card brand logo (Visa, Mastercard, Amex)
- [x] Show "•••• {last4}"
- [x] Display expiry MM/YY
- [x] Add "Default" badge styling
- [x] Make card tappable for options

### Task 3: Implement Card Options Menu (AC: #3)
- [x] Show action sheet/bottom sheet on card tap
- [x] Add "Set as Default" option
- [x] Add "Remove" option (destructive style)
- [x] Handle set default: UPDATE payment_methods SET is_default
- [x] Ensure only one card can be default

### Task 4: Build Remove Card Flow (AC: #4)
- [x] Show confirmation modal on remove
- [x] Soft delete: SET deleted_at = NOW()
- [x] Prevent removing default card (must set another default first)
- [x] Show success toast
- [x] Refresh card list

### Task 5: Integrate Add Card Flow (AC: #2, #5)
- [x] Add "+ Add New Card" button
- [x] Navigate to card entry form
- [x] Reuse CardEntryForm from checkout
- [x] Save card and return to payment methods screen
- [x] Set as default if first card

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

