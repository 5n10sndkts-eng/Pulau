# Story 10.6: Build Step 4 - Confirmation Screen

Status: done

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
- [x] Build ConfirmationStep layout component
- [x] Add animated success checkmark icon
- [x] Display "Booking Confirmed!" heading
- [x] Show booking reference with copy functionality
- [x] Add confirmation email message
- [x] Include trip summary section

### Task 2: Implement confetti success animation (AC: #1)
- [x] Install canvas-confetti library or use custom animation
- [x] Trigger confetti burst on component mount
- [x] Configure: 500ms duration, colorful particles
- [x] Add green checkmark icon with scale-in animation
- [x] Ensure animation doesn't block UI

### Task 3: Display booking reference with copy (AC: #2)
- [x] Show booking reference prominently (large font, centered)
- [x] Format as "PL-XXXXXX" with monospace font
- [x] Add copy icon button next to reference
- [x] Implement clipboard copy on tap
- [x] Show "Copied!" toast on successful copy

### Task 4: Add trip summary section (AC: #2)
- [x] Display trip dates (or "Dates TBD" if not set)
- [x] Show item count: "5 experiences booked"
- [x] Display total amount paid: "$XXX.XX"
- [x] List experience names (optional expandable list)
- [x] Add booking date/time

### Task 5: Implement navigation buttons and cleanup (AC: #3, #4)
- [x] Add "View My Trips" button (primary, teal)
- [x] Add "Back to Home" button (secondary, outline)
- [x] "View My Trips": navigate to /bookings
- [x] "Back to Home": navigate to / (home screen)
- [x] Clear checkout session on confirmation
- [x] Update trip status to 'booked'

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

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.6]
- [Source: prd/pulau-prd.md#Checkout Step 4 - Confirmation]
- [Related: Story 10.5 - Implement Payment Processing]
- [Technical: canvas-confetti Documentation]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

