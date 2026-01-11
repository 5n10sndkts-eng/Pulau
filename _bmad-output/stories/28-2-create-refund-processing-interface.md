# Story 28.2: Create Refund Processing Interface

Status: done

## Story

As an **admin**,
I want to initiate refunds from the dashboard,
So that I can resolve customer issues efficiently.

## Acceptance Criteria

1. **Given** I am viewing a booking detail
   **When** I click "Process Refund"
   **Then** I can choose:
   - Full refund (100% of payment)
   - Partial refund (custom amount up to total)
   **And** I must enter a refund reason
   **And** I see the calculated amounts:
   - Amount to refund traveler
   - Amount deducted from vendor (if applicable)
   - Platform fee handling
   **And** I must confirm before processing

## Tasks / Subtasks

- [x] Add "Process Refund" button to booking detail (AC: 1)
  - [x] Show button on booking detail page in admin dashboard
  - [x] Enable only for confirmed/partially_refunded bookings
  - [x] Disable for fully refunded or cancelled bookings
  - [x] Open refund modal on click
- [x] Create refund modal interface (AC: 1)
  - [x] Display booking summary (experience, amount paid)
  - [x] Add refund type radio buttons: Full / Partial
  - [x] Add custom amount input (for partial refunds)
  - [x] Validate amount <= original payment
  - [x] Add refund reason textarea (required)
  - [x] Show calculated breakdown
- [x] Calculate refund amounts (AC: 1)
  - [x] Traveler refund amount
  - [x] Vendor deduction (if within cancellation window)
  - [x] Platform fee handling (refund or keep)
  - [x] Calculate based on refund policy
  - [x] Display itemized breakdown
- [x] Add confirmation step (AC: 1)
  - [x] Show summary before processing
  - [x] Require admin to confirm amounts
  - [x] Display "Confirm Refund" button
  - [x] Show loading state during processing
  - [x] Display success/error message after processing

## Dev Notes

### Architecture Patterns

**Refund Modal Flow:**
1. Admin clicks "Process Refund"
2. Modal opens with booking details
3. Admin selects Full or Partial refund
4. If Partial, enters custom amount
5. Admin enters refund reason
6. System calculates and displays breakdown
7. Admin reviews and confirms
8. Call process-refund Edge Function (Story 28.3)
9. Display success confirmation

**Refund Calculation Logic:**
```typescript
interface RefundCalculation {
  travelerRefund: number      // Amount to refund customer
  vendorDeduction: number     // Amount to deduct from vendor payout
  platformFeeRefund: number   // Platform fee to refund (if any)
  totalRefund: number         // Total refund amount
}

function calculateRefund(
  originalAmount: number,
  refundAmount: number,
  platformFeePercent: number,
  refundPolicy: RefundPolicy
): RefundCalculation {
  // Implementation based on refund policy
  // Example: Within 24 hours -> full refund, vendor pays
  // After 24 hours -> refund minus platform fee
}
```

**Refund Policies:**
- Within 24 hours: Full refund, vendor absorbs cost
- 24-48 hours: 50% refund
- After 48 hours: No refund (admin discretion)
- Platform fee: Typically not refunded (configurable)

### Code Quality Requirements

**TypeScript Patterns:**
- Define RefundRequest interface:
  ```typescript
  interface RefundRequest {
    bookingId: string
    refundType: 'full' | 'partial'
    amount: number
    reason: string
    adminId: string
  }
  ```
- Use Zod for form validation
- Strict type checking for amount calculations

**React Patterns:**
- Use useState for modal open/close state
- Use React Hook Form for refund form
- Use TanStack Mutation for refund processing
- Show toast notification on success/error

**Validation:**
- Refund amount > 0 and <= original payment
- Refund reason minimum 10 characters
- Booking status allows refunds (not already refunded)
- Admin has refund permissions

### File Structure

**Files to Create:**
- `src/components/admin/RefundModal.tsx` - Refund processing modal
- `src/components/admin/RefundCalculation.tsx` - Amount breakdown display

**Files to Modify:**
- `src/components/admin/BookingDetail.tsx` - Add "Process Refund" button
- `src/lib/bookingService.ts` - Add calculateRefundAmounts helper

**Files to Reference:**
- `src/components/ui/dialog.tsx` - Modal/dialog component
- `src/lib/types.ts` - Booking, Payment types

**Form Validation:**
```typescript
const refundSchema = z.object({
  refundType: z.enum(['full', 'partial']),
  amount: z.number()
    .positive()
    .max(originalAmount, 'Cannot exceed original payment'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
})
```

### Testing Requirements

**Manual Testing:**
- Open booking detail as admin
- Click "Process Refund"
- Select "Full Refund"
- Enter reason
- Verify calculated amounts are correct
- Confirm refund
- Verify success message
- Check booking status updated to "refunded"
- Repeat for partial refund

**Calculation Testing:**
- Original amount: $100, Full refund → verify $100
- Original amount: $100, Partial $50 → verify $50
- Platform fee $10 → verify fee handling correct
- Vendor payout calculation → verify vendor deduction

**Edge Cases:**
- Refund amount exceeds original → show validation error
- Empty refund reason → show validation error
- Already refunded booking → button disabled
- Network error during processing → show retry option

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 28: Admin Refunds & Audit Trail
- Implements FR-ADM-02: Refund initiation interface
- Works with Story 28.3 (refund edge function) for processing
- Uses Story 28.1 (booking search) to find bookings

**Integration Points:**
- Calls refund edge function from Story 28.3
- Creates audit log via Story 28.5
- Updates booking and payment records
- Displays audit log from Story 28.4 after refund

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-28-Story-28.2]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-ADM-02]
- [Source: project-context.md#Form-Validation]
- [Source: project-context.md#React-Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Standard modal implementation.

### Completion Notes List

**Implementation Summary:**
1. Created RefundModal component with:
   - Full/partial refund selection
   - Custom amount input for partial refunds
   - Required refund reason (min 10 chars)
   - Two-step confirmation flow
   - Loading states and error handling

2. TanStack Mutation for refund processing
3. Calls process-refund edge function
4. Toast notifications for success/error

### File List

**Created Files:**
- src/components/admin/RefundModal.tsx
