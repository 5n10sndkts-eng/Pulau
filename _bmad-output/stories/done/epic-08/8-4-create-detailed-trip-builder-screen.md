# Story 8.4: Create Detailed Trip Builder Screen

Status: ready-for-dev

## Story

As a traveler,
I want a full-screen trip builder to organize my itinerary,
So that I can see all details and make adjustments.

## Acceptance Criteria

**AC #1: Display trip builder header**
**Given** I tap "View Full Trip" or navigate to trip builder
**When** the trip builder screen loads
**Then** I see header with: back button, trip name (ediKV namespace inline), share button

**AC #2: Show date picker**
**And** date picker shows: arrival date, departure date (with calendar modal)

**AC #3: Display trip items grouped by date**
**And** trip items are grouped by scheduled date
**And** "Unscheduled" section shows items without dates

**AC #4: Show sticky footer with pricing**
**And** sticky footer shows: item count, total price, "Continue to Booking" button
**And** total price calculates: SUM(experience.price × guest_count) for all items

## Tasks / Subtasks

### Task 1: Build TripBuilderScreen layout (AC: #1, #2, #3, #4)
- [ ] Create TripBuilderScreen component with full-screen layout
- [ ] Add header with back navigation, ediKV namespace title, share button
- [ ] Implement scrollable content area for trip items
- [ ] Add sticky footer with pricing summary
- [ ] Ensure proper z-index layering for fixed elements

### Task 2: Implement ediKV namespace trip name in header (AC: #1)
- [ ] Create inline ediKV namespace trip name component
- [ ] Show pencil icon on hover to indicate editability
- [ ] Save changes on blur or Enter key
- [ ] Validate name (min 1 char, max 100 chars)
- [ ] Update trip.name in useKV persistence

### Task 3: Build date picker component (AC: #2)
- [ ] Create DateRangePicker component using shadcn/ui Calendar
- [ ] Display current arrival and departure dates (or "Set dates")
- [ ] Open calendar modal on click
- [ ] Allow selection of date range with visual highlighting
- [ ] Update trip.start_date and trip.end_date on selection

### Task 4: Implement item grouping by scheduled date (AC: #3)
- [ ] Group trip items by scheduled_date
- [ ] Create DaySection for each unique date
- [ ] Display day number and formatted date as section header
- [ ] Render TripItemCard for each item within day
- [ ] Create separate "Unscheduled" section for items with null scheduled_date

### Task 5: Build sticky footer with pricing and CTA (AC: #4)
- [ ] Create TripFooter component with fixed positioning
- [ ] Display item count: "5 experiences"
- [ ] Calculate and display total: SUM(price × guest_count)
- [ ] Add "Continue to Booking" button navigating to checkout
- [ ] Add safe area padding for mobile devices
- [ ] Show loading state during price calculation

## Dev Notes

### Technical Guidance
- Use `useTripManagement` hook to access and update trip data
- Date picker: shadcn/ui Calendar with range selection mode
- Inline edit: use contentEdiKV namespace or controlled input with auto-focus
- Price calculation: `trip.items.reduce((sum, item) => sum + (item.experience.price * item.guest_count), 0)`
- Footer should stick to bottom using `sticky` positioning

### Component Hierarchy
```
TripBuilderScreen
├── TripBuilderHeader
│   ├── BackButton
│   ├── EdiKV namespaceTripName
│   └── ShareButton
├── DateRangePicker
├── ScrollableContent
│   ├── DaySection[] (scheduled dates)
│   │   └── TripItemCard[]
│   └── UnscheduledSection
│       └── TripItemCard[]
└── TripFooter (sticky)
    ├── ItemCount
    ├── TotalPrice
    └── ContinueToBookingButton
```

### Layout Specifications
- Header height: 64px with safe area inset
- Content padding: 16px mobile, 24px desktop
- Footer height: 80px + safe area inset
- Max content width: 1000px (centered on desktop)
- Day section spacing: 32px vertical gap

### Price Calculation Logic
```typescript
const calculateTripTotal = (items: TripItem[], experiences: Experience[]): number => {
  return items.reduce((total, item) => {
    const experience = experiences.find(exp => exp.id === item.experience_id);
    if (!experience) return total;
    return total + (experience.price * item.guest_count);
  }, 0);
};
```

### Date Range Display
- Format: "Mar 15 - 20, 2026"
- No dates set: "Set your travel dates" with calendar icon
- Single day trip: "Mar 15, 2026"

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.4]
- [Source: prd/pulau-prd.md#Trip Canvas Building]
- [Related: Story 8.2 - Build Trip Canvas Home View]
- [Related: Story 8.5 - Build Calendar View Toggle]
- [Figma: Trip Builder Full Screen Layout]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
