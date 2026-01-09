# Story 11.5: Create Active Trip Mode

Status: done

## Story

As a traveler during my booked trip,
I want an enhanced home screen experience,
So that I can easily access today's activities.

## Acceptance Criteria

### AC 1: Active Trip Detection
**Given** I have a confirmed booking AND today is within trip date range
**When** I open the app / view home screen
**Then** home screen transforms to "Active Trip Mode"
**And** the detection happens automatically on screen load

### AC 2: Trip Banner Display
**Given** Active Trip Mode is enabled
**When** the home screen loads
**Then** I see a top banner displaying "Day X of your [destination] adventure!"
**And** the banner is prominently styled with primary colors

### AC 3: Countdown Display
**Given** Active Trip Mode shows trip progress
**When** I view the banner
**Then** I see a countdown showing "X days remaining"
**And** the countdown accurately calculates days until trip.end_date

### AC 4: Today's Schedule Section
**Given** Active Trip Mode is active
**When** I scroll on the home screen
**Then** "Today's Schedule" section is prominently displayed
**And** it shows today's items with times, meeting points, quick directions
**And** the section appears before other home screen content

### AC 5: Schedule Item Details
**Given** items are displayed in "Today's Schedule"
**When** I view an item
**Then** each item has "View Details" button expanding to full info
**And** expanded view shows complete experience details

### AC 6: Full Itinerary Access
**Given** I am in Active Trip Mode
**When** I want to see all trip activities
**Then** I see a "View Full Itinerary" button
**And** tapping it navigates to complete trip details

### AC 7: Weather Widget Display
**Given** Active Trip Mode has location context
**When** the home screen displays
**Then** a weather widget for the destination appears (if API available)
**And** widget shows current conditions and forecast

### AC 8: Mode Deactivation
**Given** my trip has ended (after end_date)
**When** I view the home screen
**Then** home screen returns to normal planning mode
**And** past trip moves to "Past" tab automatically
**And** no active trip banner is displayed

## Tasks / Subtasks

### Task 1: Detect Active Trip on Home Screen (AC: #1, #8)
- [x] Create useActiveTrip hook to query confirmed bookings where today is within date range
- [x] Add query: status='confirmed' AND trip.start_date <= today AND trip.end_date >= today
- [x] Run detection on home screen mount and when app becomes active
- [x] Handle multiple active trips (show most recent or user-selected)
- [x] Cache active trip data to reduce queries

### Task 2: Build Active Trip Banner (AC: #2, #3)
- [x] Create ActiveTripBanner component
- [x] Display "Day X of your [destination] adventure!" with dynamic trip name
- [x] Calculate current day: Math.floor((today - trip.start_date) / (1 day)) + 1
- [x] Show countdown: trip.end_date - today in days
- [x] Style banner with gradient background and prominent positioning
- [x] Add subtle animation on first render

### Task 3: Create Today's Schedule Section (AC: #4, #5)
- [x] Create TodaysSchedule component
- [x] Query trip_items where scheduled_date = today
- [x] Sort items by time (earliest first)
- [x] Display each item with: time, experience name, meeting point preview
- [x] Add "Get Directions" quick action for each item
- [x] Implement collapsible/expandable item details

### Task 4: Build Schedule Item Card (AC: #5)
- [x] Create ScheduleItemCard component
- [x] Show collapsed view: time, experience name, location
- [x] Add "View Details" button to expand
- [x] Expanded view shows: full description, operator contact, meeting instructions
- [x] Style with clear visual hierarchy
- [x] Add smooth expand/collapse animation

### Task 5: Implement Full Itinerary Navigation (AC: #6)
- [x] Add "View Full Itinerary" button below today's schedule
- [x] Navigate to trip detail/builder screen on tap
- [x] Pass trip ID for detail view
- [x] Ensure itinerary shows all trip items (not just today's)
- [x] Style button as secondary action

### Task 6: Integrate Weather Widget (AC: #7)
- [x] Research and integrate weather API (OpenWeatherMap, WeatherAPI, etc.)
- [x] Create WeatherWidget component
- [x] Fetch weather for trip destination using coordinates or city name
- [x] Display: current temperature, conditions icon, high/low
- [x] Show 3-day forecast if space permits
- [x] Handle API errors gracefully (hide widget if data unavailable)
- [x] Cache weather data for 1 hour to reduce API calls

### Task 7: Handle Mode Transitions (AC: #8)
- [x] Check trip.end_date daily to detect completion
- [x] Auto-transition to normal home screen when trip ends
- [x] Move completed booking to "Past" tab
- [x] Optionally show "How was your trip?" prompt after completion
- [x] Clear active trip cache

### Task 8: Build Normal Home Screen Fallback (AC: #8)
- [x] Ensure home screen has default content when no active trip
- [x] Show explore/discover content
- [x] Display "Plan a trip" CTA if user has no trips
- [x] Test smooth transition between active and normal modes

## Dev Notes

### Active Trip Detection Query
```typescript
const { data: activeTrip } = await supabase
  .from('bookings')
  .select('*, trips(*, trip_items(*, experiences(*)))')
  .eq('status', 'confirmed')
  .lte('trips.start_date', today)
  .gte('trips.end_date', today)
  .order('trips.start_date', { ascending: false })
  .limit(1)
  .single();
```

### Day Calculation
```typescript
const getTripDay = (startDate: Date, today: Date): number => {
  const diff = today.getTime() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days + 1;
};

const getDaysRemaining = (endDate: Date, today: Date): number => {
  const diff = endDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
```

### Weather API Integration
- Use OpenWeatherMap API: https://openweathermap.org/api
- Free tier: 1000 calls/day
- Endpoint: `/weather?q={city}&appid={API_KEY}`
- Consider using user's current location if in destination

### Component Structure
```
HomeScreen
├── ActiveTripBanner (if active trip)
├── TodaysSchedule
│   ├── ScheduleItemCard[]
│   └── ViewFullItineraryButton
├── WeatherWidget (if API available)
└── NormalHomeContent (if no active trip)
```

### Testing Considerations
- Test with trips starting today, ending today, and in the middle
- Test with trips in different time zones
- Verify day calculation accuracy across date boundaries
- Test transition when trip ends at midnight
- Test with no active trips (normal mode)
- Verify weather widget handles API failures gracefully

### Performance Considerations
- Cache active trip query for duration of app session
- Implement real-time updates if trip is cancelled during active mode
- Lazy load weather widget to avoid blocking home screen render
- Consider pre-fetching today's schedule on app launch

## References

- [Source: planning-artifacts/epics/epic-11.md#Epic 11 - Story 11.5]
- [Source: prd/pulau-prd.md#Home Screen]
- [Related: Story 11.1 - Create Booking History Screen]
- [Related: Story 11.2 - Build Booking Detail View]
- [Related: Story 11.4 - Add Booking Status Tracking]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

