# Story 8.2: Build Trip Canvas Home View

Status: ready-for-dev

## Story

As a traveler,
I want to see my trip overview on the home screen,
So that I can quickly understand my planned activities.

## Acceptance Criteria

**AC #1: Display trip header with editable details**
**Given** I am on the home screen with an active trip
**When** the trip canvas section loads
**Then** I see trip header: trip name (editable), date range (or "Dates not set")
**And** trip summary bar shows: item count, total days, total price

**AC #2: Display trip items organized by day**
**And** below header I see trip items organized by day
**And** each day section shows: day number, date, scheduled items
**And** each item card displays: time, experience title, duration, price, guest count

**AC #3: Show expand to full trip builder**
**And** "View Full Trip" button expands to detailed trip builder

**AC #4: Show empty state when no items**
**When** trip has no items
**Then** empty state shows: suitcase illustration, "Your trip canvas is empty", "Start Exploring" button

## Tasks / Subtasks

### Task 1: Create TripCanvasHome component structure (AC: #1, #2, #3, #4)
- [ ] Build TripCanvasHome component with header, summary, and items sections
- [ ] Add collapsible/expandable container for trip view
- [ ] Position component prominently on home screen (below hero)
- [ ] Ensure responsive layout for mobile and desktop
- [ ] Add loading skeleton while trip data loads

### Task 2: Implement editable trip header (AC: #1)
- [ ] Create TripHeader with inline-editable trip name
- [ ] Add date range display (format: "Mar 15 - 20, 2026")
- [ ] Show "Dates not set" when start_date/end_date are null
- [ ] Implement inline edit on tap/click for trip name
- [ ] Save edited name to trip data with auto-save

### Task 3: Build trip summary bar (AC: #1)
- [ ] Create TripSummaryBar component displaying key metrics
- [ ] Show item count: "5 experiences"
- [ ] Calculate and display total days from date range
- [ ] Display total price with real-time calculation
- [ ] Style with pill/badge design for each metric

### Task 4: Implement day-organized item list (AC: #2)
- [ ] Group trip items by scheduled_date
- [ ] Create DaySection component with day number and date header
- [ ] Render TripItemCard for each item in day
- [ ] Display time, title, duration, price, guest count on each card
- [ ] Add "Unscheduled" section for items without dates

### Task 5: Create "View Full Trip" button and navigation (AC: #3)
- [ ] Add "View Full Trip" button at bottom of canvas
- [ ] Style as secondary button with full width
- [ ] Navigate to detailed trip builder screen on click
- [ ] Add smooth transition animation (fade + slide)
- [ ] Persist scroll position when returning to home

### Task 6: Build empty state component (AC: #4)
- [ ] Create EmptyTripCanvas component with suitcase SVG illustration
- [ ] Add heading: "Your trip canvas is empty"
- [ ] Include subtext: "Start adding experiences to build your itinerary"
- [ ] Add "Start Exploring" CTA button navigating to browse/home
- [ ] Center empty state vertically in canvas container

## Dev Notes

### Technical Guidance
- Use `useTripManagement` hook to access trip data
- Trip name edit: use `contentEditable` div or inline input with blur handler
- Date formatting: use `date-fns` library's `format(date, 'MMM d - d, yyyy')`
- Total days calculation: `differenceInDays(end_date, start_date) + 1`
- Group items by date: `const itemsByDay = groupBy(trip.items, item => item.scheduled_date)`

### Component Hierarchy
```
TripCanvasHome
├── TripHeader (name, dates)
├── TripSummaryBar (count, days, total)
├── DaySection (per date)
│   ├── DayHeader (Day 1, Mar 15)
│   └── TripItemCard[] (time, title, details)
├── UnscheduledSection
│   └── TripItemCard[]
├── ViewFullTripButton
└── EmptyTripCanvas (conditional)
```

### Layout Specifications
- Canvas section: max-width 800px, centered on desktop
- Padding: 16px mobile, 24px desktop
- Day section spacing: 24px vertical gap
- Item card height: auto, min 80px
- Empty state illustration: 200px width

### Price Display Format
- Individual items: "$45.00"
- Total in summary: "$225.00" with highlight animation on change
- Include currency symbol from user preferences

## References

- [Source: epics.md#Epic 8, Story 8.2]
- [Source: prd/pulau-prd.md#Trip Canvas Building]
- [Related: Story 8.1 - Create Trip Data Model]
- [Related: Story 8.4 - Create Detailed Trip Builder Screen]
- [Figma: Trip Canvas Home View]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
