# Story 8.5: Build Calendar View Toggle

Status: ready-for-dev

## Story

As a traveler,
I want to switch between calendar and list views of my trip,
So that I can visualize my itinerary in my preferred format.

## Acceptance Criteria

**AC #1: Display view toggle with default list view**
**Given** I am on the trip builder screen
**When** I see the view toggle (Calendar | List)
**Then** default view is List (timeline)

**AC #2: Switch to calendar view**
**When** I tap "Calendar"
**Then** view switches to monthly calendar grid
**And** days with activities show colored dots (one dot per item)
**And** tapping a day shows that day's items in a bottom sheet
**And** current day is highlighted

**AC #3: Switch to list view**
**When** I tap "List"
**Then** view switches to vertical timeline
**And** items grouped by day with connecting timeline lines
**And** smooth transition animation between views (200ms)

## Tasks / Subtasks

### Task 1: Create view toggle component (AC: #1, #3)
- [ ] Build SegmentedControl component with "Calendar" and "List" options
- [ ] Style with active state highlighting (teal background)
- [ ] Position toggle below date picker in trip builder
- [ ] Store view preference in local state
- [ ] Add smooth background slide animation on toggle

### Task 2: Implement list/timeline view (AC: #1, #3)
- [ ] Create TripTimelineView component (default view)
- [ ] Display items grouped by day with vertical timeline
- [ ] Add connecting lines between day sections
- [ ] Show day number, date, and items for each day
- [ ] Include unscheduled section at bottom

### Task 3: Build calendar grid view (AC: #2)
- [ ] Create TripCalendarView component using calendar grid layout
- [ ] Display monthly calendar showing trip date range
- [ ] Add colored dots on days with scheduled items
- [ ] Highlight current day with border/background
- [ ] Make calendar navigable (prev/next month buttons)

### Task 4: Implement day detail bottom sheet (AC: #2)
- [ ] Create DayDetailSheet component (modal/bottom sheet)
- [ ] Trigger sheet on calendar day tap
- [ ] Display selected day's date and all items
- [ ] Show item details: time, title, duration, price
- [ ] Add "Close" and "Edit" actions in sheet

### Task 5: Add smooth view transition animations (AC: #3)
- [ ] Use Framer Motion AnimatePresence for view switching
- [ ] Configure 200ms fade + slide transition
- [ ] Ensure smooth height adjustment between views
- [ ] Prevent layout shift during transition
- [ ] Test animation performance on mobile

## Dev Notes

### Technical Guidance
- View toggle: use shadcn/ui Tabs or custom SegmentedControl
- Calendar library: use `react-day-picker` or shadcn/ui Calendar
- Timeline view: use CSS flexbox with pseudo-element lines
- Bottom sheet: use shadcn/ui Sheet component
- View state: `const [view, setView] = useState<'list' | 'calendar'>('list')`

### Component Structure
```
TripBuilderContent
├── ViewToggle (Calendar | List)
├── {view === 'list' ? (
│   <TripTimelineView items={tripItems} />
│ ) : (
│   <TripCalendarView items={tripItems} onDayClick={openDayDetail} />
│ )}
└── DayDetailSheet (conditional)
```

### Calendar Dot Indicator Logic
```typescript
const getDayDots = (date: Date, items: TripItem[]): number => {
  return items.filter(item =>
    item.scheduled_date &&
    isSameDay(parseISO(item.scheduled_date), date)
  ).length;
};
```

### Animation Configuration
```typescript
const viewTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2, ease: "easeInOut" }
};
```

### Visual Specifications
- Calendar dots: 4px diameter, teal color, max 3 dots per day
- Timeline connector: 2px vertical line, gray color
- Day header in timeline: bold, 16px font size
- Bottom sheet: 60% screen height, rounded top corners

## References

- [Source: epics.md#Epic 8, Story 8.5]
- [Source: prd/pulau-prd.md#Trip Canvas - Calendar View]
- [Related: Story 8.4 - Create Detailed Trip Builder Screen]
- [Figma: Calendar and List View Designs]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
