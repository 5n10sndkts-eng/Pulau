# Story 11.3: Implement Book Again Functionality

Status: ready-for-dev

## Story

As a traveler who enjoyed a past trip,
I want to quickly rebook the same experiences,
So that I can plan a return visit easily.

## Acceptance Criteria

### AC 1: Book Again Button Visibility
**Given** I am viewing a past/completed booking
**When** I view the booking detail screen
**Then** I see a "Book Again" button prominently displayed

### AC 2: Trip Duplication Process
**Given** I tap the "Book Again" button
**When** the duplication process executes
**Then** a new trip is created copying all items from the original booking
**And** the new trip is created in the database with status 'planning'

### AC 3: New Trip Naming
**Given** a new trip is being created from "Book Again"
**When** the trip name is set
**Then** new trip has name = "[Original name] (Copy)"
**And** the naming is consistent and clear to the user

### AC 4: Trip Dates Reset
**Given** the new trip is created
**When** I view the new trip
**Then** dates = null (no dates set)
**And** status = 'planning'

### AC 5: Trip Items Duplication
**Given** all trip items from the original booking
**When** they are copied to the new trip
**Then** all trip_items are copied with: same experiences, same guest counts
**And** scheduled_dates are cleared (items become unscheduled)

### AC 6: Navigation to Trip Builder
**Given** the new trip has been created successfully
**When** the duplication completes
**Then** I am navigated to the trip builder with the new trip
**And** I can immediately start planning dates

### AC 7: User Feedback
**Given** the trip has been duplicated and navigation occurs
**When** I arrive at the trip builder
**Then** toast displays "Trip copied! Set your new dates."
**And** the message is clear and actionable

### AC 8: Original Booking Preservation
**Given** I have used "Book Again"
**When** I return to view the original booking
**Then** the original booking remains unchanged
**And** no modifications have been made to the original data

## Tasks / Subtasks

### Task 1: Add Book Again Button to Booking Detail (AC: #1)
- [ ] Add "Book Again" button to BookingDetailScreen for past/completed bookings
- [ ] Position button prominently (bottom of screen or near header)
- [ ] Style button as primary action with teal color
- [ ] Add loading state for button during duplication
- [ ] Hide button for upcoming/active bookings

### Task 2: Create Trip Duplication Service (AC: #2, #3, #4, #5)
- [ ] Create duplicateBooking function in services/booking.service.ts
- [ ] Query original booking with all trip items and experiences
- [ ] Create new trip record with name "[Original name] (Copy)"
- [ ] Set new trip dates to null and status to 'planning'
- [ ] Copy all trip_items with cleared scheduled_dates

### Task 3: Implement Database Transactions (AC: #2, #5, #8)
- [ ] Wrap duplication in database transaction for atomicity
- [ ] Create trip record first, get new trip ID
- [ ] Batch insert all trip_items with new trip_id
- [ ] Handle transaction rollback on any error
- [ ] Ensure original booking data is never modified

### Task 4: Handle Duplication Errors (AC: #2, #8)
- [ ] Add try-catch error handling for duplication process
- [ ] Display error toast if duplication fails
- [ ] Log errors for debugging
- [ ] Ensure no partial trips are created on failure
- [ ] Provide retry option if duplication fails

### Task 5: Navigate to Trip Builder (AC: #6, #7)
- [ ] Use router.push to navigate to trip builder with new trip ID
- [ ] Pass trip data to trip builder screen
- [ ] Show success toast "Trip copied! Set your new dates."
- [ ] Ensure trip builder loads in edit mode
- [ ] Highlight date selection as next action

### Task 6: Add Analytics Tracking
- [ ] Track "Book Again" button taps
- [ ] Log successful trip duplications
- [ ] Track navigation to trip builder from "Book Again"
- [ ] Monitor duplication errors and failure rates
- [ ] Analyze which trips are most frequently rebooked

## Dev Notes

### Database Operations
```typescript
// Pseudo-code for duplication
const duplicateBooking = async (bookingId: string) => {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, trips(*, trip_items(*))')
    .eq('id', bookingId)
    .single();

  const { data: newTrip } = await supabase
    .from('trips')
    .insert({
      user_id: booking.trips.user_id,
      name: `${booking.trips.name} (Copy)`,
      start_date: null,
      end_date: null,
      status: 'planning'
    })
    .select()
    .single();

  const tripItems = booking.trips.trip_items.map(item => ({
    trip_id: newTrip.id,
    experience_id: item.experience_id,
    guest_count: item.guest_count,
    scheduled_date: null
  }));

  await supabase.from('trip_items').insert(tripItems);

  return newTrip;
};
```

### Validation Considerations
- Check if all experiences in original booking are still available
- Optionally notify user if any experiences are no longer available
- Consider checking if prices have changed since original booking
- Decide whether to show a preview before creating the duplicate

### User Experience
- Consider adding confirmation dialog: "Create a copy of this trip?"
- Show loading indicator during duplication (can take a few seconds)
- Ensure smooth transition to trip builder
- Consider adding animation for the duplication action

### Testing Scenarios
- Test duplicating trips with 1, 5, and 10+ items
- Test with trips containing unavailable experiences
- Test concurrent duplications (multiple taps)
- Verify transaction rollback on errors
- Test navigation flow from duplication to trip builder

## References

- [Source: epics.md#Epic 11 - Story 11.3]
- [Source: prd/pulau-prd.md#Trip Planning]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 7.1 - Build Trip Planner Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
