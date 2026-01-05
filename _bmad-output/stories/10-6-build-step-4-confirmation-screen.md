# Story 10.6: Build Step 4 - Confirmation Screen

Status: ready-for-dev

## Story

As a traveler who completed booking,
I want to see my booking confirmation,
So that I know my reservation is secured.

## Acceptance Criteria

**AC #1: Display success animation**
**Given** payment succeeded and I'm on Step 4 (Confirmation)
**When** the screen loads
**Then** success animation plays: confetti burst (500ms) with green checkmark

**AC #2: Show confirmation details**
**And** confirmation displays:
  - "Booking Confirmed!" heading
  - Booking reference: PL-XXXXXX (tappable to copy)
  - "Confirmation sent to [email]" message
  - Trip summary: dates, item count, total paid

**AC #3: Provide next action buttons**
**And** action buttons:
  - "View My Trips" (primary) - navigates to booking history
  - "Back to Home" (secondary)

**AC #4: Trigger confirmation email**
**And** confirmation email is triggered (queued for sending)
**And** trip status updates from 'planning' to 'booked'

## Tasks / Subtasks

### Task 1: Create ConfirmationStep component (AC: #1, #2, #3)
- [ ] Build ConfirmationStep layout component
- [ ] Add animated success checkmark icon
- [ ] Display "Booking Confirmed!" heading
- [ ] Show booking reference with copy functionality
- [ ] Add confirmation email message
- [ ] Include trip summary section

### Task 2: Implement confetti success animation (AC: #1)
- [ ] Install canvas-confetti library or use custom animation
- [ ] Trigger confetti burst on component mount
- [ ] Configure: 500ms duration, colorful particles
- [ ] Add green checkmark icon with scale-in animation
- [ ] Ensure animation doesn't block UI

### Task 3: Display booking reference with copy (AC: #2)
- [ ] Show booking reference prominently (large font, centered)
- [ ] Format as "PL-XXXXXX" with monospace font
- [ ] Add copy icon button next to reference
- [ ] Implement clipboard copy on tap
- [ ] Show "Copied!" toast on successful copy

### Task 4: Add trip summary section (AC: #2)
- [ ] Display trip dates (or "Dates TBD" if not set)
- [ ] Show item count: "5 experiences booked"
- [ ] Display total amount paid: "$XXX.XX"
- [ ] List experience names (optional expandable list)
- [ ] Add booking date/time

### Task 5: Implement navigation buttons and cleanup (AC: #3, #4)
- [ ] Add "View My Trips" button (primary, teal)
- [ ] Add "Back to Home" button (secondary, outline)
- [ ] "View My Trips": navigate to /bookings
- [ ] "Back to Home": navigate to / (home screen)
- [ ] Clear checkout session on confirmation
- [ ] Update trip status to 'booked'

## Dev Notes

### Technical Guidance
- Confetti library: `canvas-confetti` or `react-rewards`
- Booking reference: fetch from booking record created in Story 10.5
- Email trigger: queue email job, don't wait for send
- Checkout session: clear from useKV after confirmation
- Trip status: update trip.status = 'booked'

### Confetti Animation
```typescript
import confetti from 'canvas-confetti';

useEffect(() => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#0D7377', '#FF6B6B', '#F4D03F', '#27AE60']
  });
}, []);
```

### Booking Reference Copy
```typescript
const handleCopyReference = async () => {
  try {
    await navigator.clipboard.writeText(bookingReference);
    toast.success('Booking reference copied!');
  } catch (error) {
    toast.error('Failed to copy');
  }
};
```

### Email Trigger
```typescript
// Backend API call to queue confirmation email
const triggerConfirmationEmail = async (bookingId: string) => {
  await fetch('/api/bookings/send-confirmation', {
    method: 'POST',
    body: JSON.stringify({ bookingId })
  });
  // Don't wait for response, email is queued
};
```

### Component Structure
```typescript
<ConfirmationStep>
  <SuccessAnimation>
    <Confetti />
    <CheckmarkIcon className="animate-scale-in" />
  </SuccessAnimation>
  <Heading>Booking Confirmed!</Heading>
  <BookingReference>
    <span>{bookingReference}</span>
    <CopyButton onClick={handleCopyReference} />
  </BookingReference>
  <Message>
    Confirmation sent to {travelerDetails.email}
  </Message>
  <TripSummary>
    <SummaryRow label="Dates" value={formatDateRange(trip)} />
    <SummaryRow label="Experiences" value={`${trip.items.length} booked`} />
    <SummaryRow label="Total Paid" value={formatPrice(totalAmount)} />
  </TripSummary>
  <Actions>
    <Button onClick={() => navigate('/bookings')}>
      View My Trips
    </Button>
    <Button variant="outline" onClick={() => navigate('/')}>
      Back to Home
    </Button>
  </Actions>
</ConfirmationStep>
```

### Visual Specifications
- Success checkmark: 80px diameter, green circle, white check
- Booking reference: 24px font, monospace, teal color
- Copy button: small icon button, gray, hover teal
- Trip summary: card with light background, 16px padding
- Action buttons: full width on mobile, inline on desktop
- Spacing: generous vertical spacing between sections

## References

- [Source: epics.md#Epic 10, Story 10.6]
- [Source: prd/pulau-prd.md#Checkout Step 4 - Confirmation]
- [Related: Story 10.5 - Implement Payment Processing]
- [Technical: canvas-confetti Documentation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
