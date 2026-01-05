# Story 11.1: Create Booking History Screen

Status: ready-for-dev

## Story

As a traveler,
I want to view all my bookings in one place,
So that I can manage my travel plans.

## Acceptance Criteria

### AC 1: Navigation and Screen Access
**Given** I navigate to Profile → My Trips
**When** the booking history screen loads
**Then** I see the booking history interface with tab navigation

### AC 2: Tab Structure and Filtering
**Given** the booking history screen has loaded
**When** I view the tabs
**Then** I see tabs: "Upcoming" (default), "Past", "All"
**And** each tab filters bookings by status and dates

### AC 3: Upcoming Tab Filtering
**Given** I am on the "Upcoming" tab
**When** the bookings are displayed
**Then** I see only bookings where status = 'confirmed' AND trip.start_date >= today
**And** bookings are sorted by trip.start_date (nearest first)

### AC 4: Past Tab Filtering
**Given** I am on the "Past" tab
**When** the bookings are displayed
**Then** I see only bookings where trip.end_date < today OR status = 'completed'
**And** bookings are sorted by trip.start_date (most recent first)

### AC 5: Booking Card Display
**Given** bookings are displayed in any tab
**When** I view a booking card
**Then** the card displays: trip name, dates, item count, total price, status badge
**And** all information is clearly readable and properly formatted

### AC 6: Empty State Display
**Given** there are no bookings in a tab
**When** the empty tab is displayed
**Then** I see: suitcase icon, "No [upcoming/past] trips", "Explore experiences" CTA
**And** tapping the CTA navigates me to the explore screen

## Tasks / Subtasks

### Task 1: Create BookingHistoryScreen Component (AC: #1, #2)
- [ ] Create BookingHistoryScreen component in `app/(tabs)/profile/my-trips.tsx`
- [ ] Implement tab navigation using React Native Tab View or custom tabs
- [ ] Add sticky header with "My Trips" title
- [ ] Configure navigation from Profile screen to My Trips

### Task 2: Build Tab Components and Filtering Logic (AC: #2, #3, #4)
- [ ] Create UpcomingTab component with filter: status='confirmed' AND trip.start_date >= today
- [ ] Create PastTab component with filter: trip.end_date < today OR status='completed'
- [ ] Create AllTab component showing all bookings
- [ ] Implement proper sort logic for each tab (nearest first for upcoming, recent first for past)
- [ ] Add tab indicator and active state styling

### Task 3: Create BookingCard Component (AC: #5)
- [ ] Design BookingCard component with trip name, dates, item count
- [ ] Add total price display with proper currency formatting
- [ ] Implement status badge component with color coding
- [ ] Add touch handler for navigation to booking detail
- [ ] Apply card styling with shadows and proper spacing

### Task 4: Implement Data Fetching and State Management (AC: #3, #4, #5)
- [ ] Create useBookings hook to fetch bookings from Supabase
- [ ] Implement query filters for each tab type
- [ ] Add loading states during data fetch
- [ ] Handle error states with retry mechanism
- [ ] Set up real-time subscription for booking updates

### Task 5: Build Empty State Component (AC: #6)
- [ ] Create EmptyBookingsState component with suitcase icon
- [ ] Add dynamic text based on active tab ("No upcoming trips", "No past trips")
- [ ] Implement "Explore experiences" CTA button
- [ ] Configure navigation to explore screen on CTA tap
- [ ] Style empty state with centered layout

### Task 6: Add Pull-to-Refresh and Animations
- [ ] Implement pull-to-refresh functionality for all tabs
- [ ] Add Framer Motion animations for card entry
- [ ] Implement skeleton loading states while data loads
- [ ] Add smooth tab transition animations
- [ ] Test animations on both iOS and Android

## Dev Notes

### Database Queries
- Query bookings table joined with trips and trip_items
- Filter conditions for each tab must be performant
- Consider indexing on trip.start_date and trip.end_date
- Use Supabase RPC for complex date filtering if needed

### Component Structure
```
BookingHistoryScreen
├── Header (sticky)
├── TabNavigation
│   ├── UpcomingTab
│   ├── PastTab
│   └── AllTab
└── Tab Content
    ├── BookingCard[] (if data)
    └── EmptyBookingsState (if no data)
```

### Status Badge Colors
- "Confirmed": green (#27AE60)
- "Pending": yellow (#F4D03F)
- "Cancelled": gray
- "Completed": teal (#0D7377)

### Testing Considerations
- Test with users who have no bookings
- Test with users who have only upcoming/past bookings
- Verify date filtering edge cases (bookings starting/ending today)
- Test real-time updates when booking status changes

## References

- [Source: epics.md#Epic 11 - Story 11.1]
- [Source: prd/pulau-prd.md#Booking Management]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 11.4 - Add Booking Status Tracking]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
