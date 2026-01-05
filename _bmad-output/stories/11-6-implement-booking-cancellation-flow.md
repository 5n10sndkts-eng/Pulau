# Story 11.6: Implement Booking Cancellation Flow

Status: ready-for-dev

## Story

As a traveler who needs to cancel,
I want to cancel my booking according to policy,
So that I can get a refund if eligible.

## Acceptance Criteria

### AC 1: Cancel Button Visibility
**Given** I am viewing a confirmed booking detail
**When** the booking detail screen loads
**Then** I see a "Cancel Booking" button
**And** the button is clearly accessible but styled to prevent accidental taps

### AC 2: Cancellation Policy Display
**Given** I tap "Cancel Booking"
**When** the cancellation modal opens
**Then** the modal displays cancellation policy for each experience
**And** policies are clearly explained with timing details

### AC 3: Refund Calculation - Full Refund
**Given** the cancellation is more than 24 hours before each experience
**When** the refund calculation displays
**Then** it shows full refund for experiences > 24 hours away
**And** the full refund amount is clearly stated

### AC 4: Refund Calculation - Partial/No Refund
**Given** the cancellation is within 24 hours of any experience
**When** the refund calculation displays
**Then** it shows partial/no refund if within 24 hours
**And** the reduced refund amount is clearly explained

### AC 5: Total Refund Display
**Given** refund amounts are calculated for all experiences
**When** I view the cancellation modal
**Then** the total refund amount is prominently displayed
**And** breakdown shows refund per experience

### AC 6: Cancellation Confirmation
**Given** I review the refund calculation
**When** I confirm cancellation
**Then** booking status updates to 'cancelled'
**And** the status change is immediately reflected

### AC 7: Refund Processing
**Given** the booking has been cancelled
**When** the cancellation is confirmed
**Then** refund is initiated via payment gateway
**And** refund processing begins immediately

### AC 8: Confirmation Communication
**Given** the cancellation is complete
**When** the process finishes
**Then** cancellation confirmation email is sent
**And** toast displays "Booking cancelled. Refund processing."
**And** email includes cancellation details and refund timeline

### AC 9: Cancelled Booking Visibility
**Given** a booking has been cancelled
**When** I view my booking history
**Then** cancelled booking remains visible in history (grayed out)
**And** status badge shows "Cancelled"
**And** I can still view the cancelled booking details

## Tasks / Subtasks

### Task 1: Add Cancel Booking Button (AC: #1)
- [ ] Add "Cancel Booking" button to BookingDetailScreen
- [ ] Position button at bottom of screen or in overflow menu
- [ ] Style as destructive action (red/coral color)
- [ ] Hide button for already cancelled or completed bookings
- [ ] Add confirmation step to prevent accidental cancellation

### Task 2: Create Cancellation Policy Modal (AC: #2, #3, #4, #5)
- [ ] Create CancellationModal component
- [ ] Display cancellation policy from each experience
- [ ] Calculate hours until each experience start time
- [ ] Show refund eligibility per experience (full/partial/none)
- [ ] Display itemized refund breakdown
- [ ] Show total refund amount prominently

### Task 3: Implement Refund Calculation Logic (AC: #3, #4, #5)
- [ ] Create calculateRefund function
- [ ] Check time until each experience: hours_until = experience.date - now
- [ ] Apply policy: if hours_until > 24, full refund; else partial/none
- [ ] Calculate per-experience refunds
- [ ] Sum total refund amount
- [ ] Format currency properly

### Task 4: Build Cancellation Service (AC: #6, #7)
- [ ] Create cancelBooking function in services/booking.service.ts
- [ ] Update booking status to 'cancelled' in database
- [ ] Log status change to booking_status_history
- [ ] Initiate refund via payment gateway (Stripe/Xendit)
- [ ] Handle refund API errors with retry logic
- [ ] Wrap in database transaction for atomicity

### Task 5: Integrate Payment Gateway Refund (AC: #7)
- [ ] Use Stripe/Xendit refund API
- [ ] Pass refund amount and payment_intent_id
- [ ] Handle partial refunds for mixed timing scenarios
- [ ] Store refund_id in database for tracking
- [ ] Handle refund failures gracefully
- [ ] Implement idempotency to prevent duplicate refunds

### Task 6: Send Cancellation Notifications (AC: #8)
- [ ] Create cancellation email template
- [ ] Include booking reference, cancelled items, refund amount
- [ ] Add refund processing timeline (e.g., "5-10 business days")
- [ ] Send email via email service (SendGrid/Resend)
- [ ] Show in-app toast "Booking cancelled. Refund processing."
- [ ] Log email sending status

### Task 7: Update UI for Cancelled Bookings (AC: #9)
- [ ] Ensure cancelled bookings appear in "All" and "Past" tabs
- [ ] Gray out cancelled booking cards
- [ ] Display "Cancelled" status badge
- [ ] Show refund status in booking detail
- [ ] Make cancelled bookings read-only (no re-cancellation)
- [ ] Add "Refund Status" section showing progress

### Task 8: Add Cancellation Analytics and Logging
- [ ] Track cancellation rate metrics
- [ ] Log cancellation reasons (optional user feedback)
- [ ] Monitor refund processing success/failure rates
- [ ] Create admin view for cancellation overview
- [ ] Track timing of cancellations (how far in advance)

## Dev Notes

### Refund Calculation Logic
```typescript
const calculateRefund = (booking: Booking): RefundBreakdown => {
  const now = new Date();
  const refunds = booking.trip.trip_items.map(item => {
    const experienceDate = new Date(item.scheduled_date);
    const hoursUntil = (experienceDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil > 24) {
      return { experience: item.experience.name, amount: item.price, refundable: true };
    } else {
      return { experience: item.experience.name, amount: 0, refundable: false };
    }
  });

  const totalRefund = refunds.reduce((sum, r) => sum + r.amount, 0);
  return { items: refunds, total: totalRefund };
};
```

### Payment Gateway Refund
```typescript
// Stripe example
const refund = await stripe.refunds.create({
  payment_intent: booking.payment_intent_id,
  amount: refundAmount * 100, // cents
  reason: 'requested_by_customer',
  metadata: { booking_id: booking.id }
});

// Store refund ID
await supabase
  .from('bookings')
  .update({ refund_id: refund.id, refund_status: 'processing' })
  .eq('id', booking.id);
```

### Cancellation Policy Text
```
Cancellation Policy:
- Full refund if cancelled more than 24 hours before experience
- No refund if cancelled within 24 hours of experience
- Refunds processed within 5-10 business days
```

### Database Updates
- Add refund_id, refund_status, refund_amount columns to bookings table
- Create cancellation_reasons table (optional) for user feedback
- Log all cancellations to booking_status_history

### Testing Scenarios
- Cancel booking > 24 hours before (full refund)
- Cancel booking < 24 hours before (no refund)
- Cancel booking with mixed experiences (some refundable, some not)
- Test refund API failures and retries
- Verify cancelled bookings appear correctly in history
- Test email delivery
- Ensure idempotency (double-tap prevention)

### User Experience Considerations
- Show clear warning before cancellation: "Are you sure?"
- Display refund timeline expectations
- Provide customer support link in cancellation flow
- Consider offering alternative: "Modify booking" instead of cancel
- Show refund status updates in booking detail

## References

- [Source: epics.md#Epic 11 - Story 11.6]
- [Source: prd/pulau-prd.md#Booking Management]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 11.4 - Add Booking Status Tracking]
- [Related: Story 9.3 - Process Payment and Create Booking]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
