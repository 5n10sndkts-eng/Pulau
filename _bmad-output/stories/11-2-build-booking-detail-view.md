# Story 11.2: Build Booking Detail View

Status: ready-for-dev

## Story

As a traveler,
I want to view complete details of a booking,
So that I can access all confirmation information.

## Acceptance Criteria

### AC 1: Navigation to Detail View
**Given** I tap a booking card from history
**When** the booking detail screen loads
**Then** I see the complete booking detail view

### AC 2: Header Information Display
**Given** the booking detail screen has loaded
**When** I view the header section
**Then** I see: booking reference (copyable), status badge, booked date
**And** the booking reference has a copy icon/button next to it

### AC 3: Trip Items Display
**Given** the booking detail shows trip items
**When** I scroll through the items
**Then** all trip items display with: date, time, experience details, guest count
**And** the layout is identical to the trip builder read-only view

### AC 4: Operator Contact Information
**Given** each experience in the booking
**When** I view the experience details
**Then** operator contact info is visible for each experience
**And** contact info includes phone number and email (if available)

### AC 5: Meeting Point Information
**Given** each experience has a meeting point
**When** I view the experience details
**Then** meeting point info is accessible
**And** I can tap to view on a map or get directions

### AC 6: Price Summary Display
**Given** the booking detail screen
**When** I scroll to the price section
**Then** the price summary shows: what was paid, payment method last 4 digits
**And** breakdown includes all items and total amount

### AC 7: Help Link Access
**Given** I am viewing the booking detail
**When** I look for support options
**Then** I see a "Need Help?" link to support
**And** tapping it opens the help/support screen or contact options

### AC 8: Read-Only State
**Given** the booking detail screen
**When** I interact with the screen
**Then** the screen is read-only (no editing capabilities)
**And** no edit buttons or editable fields are shown

## Tasks / Subtasks

### Task 1: Create BookingDetailScreen Component (AC: #1, #2)
- [ ] Create BookingDetailScreen component in `app/bookings/[id].tsx`
- [ ] Implement dynamic routing to accept booking ID parameter
- [ ] Add screen header with back button and "Booking Details" title
- [ ] Build header card with booking reference, status badge, and booked date
- [ ] Implement copy-to-clipboard functionality for booking reference

### Task 2: Display Trip Items in Read-Only Mode (AC: #3)
- [ ] Reuse TripItemCard component from trip builder in read-only mode
- [ ] Display all trip items with dates, times, and experience details
- [ ] Show guest count for each item
- [ ] Apply read-only styling (remove edit/delete buttons)
- [ ] Group items by date if applicable

### Task 3: Show Operator Contact Information (AC: #4)
- [ ] Fetch operator/vendor details for each experience
- [ ] Display operator name, phone number, and email
- [ ] Add call and email action buttons (tel: and mailto: links)
- [ ] Style contact info section with proper spacing
- [ ] Handle cases where contact info is missing

### Task 4: Implement Meeting Point Display (AC: #5)
- [ ] Show meeting point address for each experience
- [ ] Add "View on Map" button that opens map view or external maps app
- [ ] Implement "Get Directions" functionality using device maps
- [ ] Display meeting point instructions if available
- [ ] Add map preview thumbnail if coordinates available

### Task 5: Build Price Summary Section (AC: #6)
- [ ] Create PriceSummaryCard component showing itemized breakdown
- [ ] Display each experience price and quantity
- [ ] Show payment method used (card brand and last 4 digits)
- [ ] Calculate and display total amount paid
- [ ] Format currency based on user preferences

### Task 6: Add Help and Support Access (AC: #7)
- [ ] Add "Need Help?" button or link at bottom of screen
- [ ] Navigate to help/support screen on tap
- [ ] Pass booking reference as context to support screen
- [ ] Consider adding quick action: "Contact about this booking"
- [ ] Style help section prominently but not intrusively

### Task 7: Data Fetching and Error Handling (AC: #1, #2, #3)
- [ ] Create useBookingDetail hook to fetch booking by ID
- [ ] Join bookings with trips, trip_items, experiences, and vendors
- [ ] Implement loading state with skeleton
- [ ] Handle booking not found error (404)
- [ ] Add retry mechanism for failed fetches

## Dev Notes

### Database Schema References
- Query: bookings JOIN trips JOIN trip_items JOIN experiences JOIN vendors
- Include payment_methods for card details
- Fetch meeting_points data for each experience
- Consider using a single comprehensive query or RPC function

### Component Reusability
- Reuse TripItemCard from trip builder with `readOnly` prop
- Reuse StatusBadge component from booking history
- Consider creating a CopyableText component for booking reference

### Copy to Clipboard
```typescript
import * as Clipboard from 'expo-clipboard';

const copyBookingRef = async (ref: string) => {
  await Clipboard.setStringAsync(ref);
  // Show toast: "Booking reference copied"
};
```

### Contact Actions
```typescript
// Phone call
Linking.openURL(`tel:${phoneNumber}`);

// Email
Linking.openURL(`mailto:${email}?subject=Booking ${bookingRef}`);

// Maps
Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
```

### Testing Considerations
- Test with various booking statuses (confirmed, cancelled, completed)
- Verify all links and actions work (copy, call, email, maps)
- Test with bookings that have missing operator contact info
- Ensure read-only mode prevents any editing
- Test deep linking to specific booking details

## References

- [Source: epics.md#Epic 11 - Story 11.2]
- [Source: prd/pulau-prd.md#Booking Management]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.6 - Implement Booking Cancellation Flow]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
