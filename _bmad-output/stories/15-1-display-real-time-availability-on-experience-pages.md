# Story 15.1: Display Real-time Availability on Experience Pages

Status: ready-for-dev

## Story

As a traveler,
I want to see current availability for experiences,
So that I can book dates that work.

## Acceptance Criteria

### AC1: Calendar Display
**Given** I am on an experience detail page
**When** the availability section loads
**Then** I see a calendar showing next 60 days
**And** each date shows availability status:
  - Green: Available (slots > 50%)
  - Yellow: Limited (slots 1-50%)
  - Red: Sold Out (slots = 0)
  - Gray: Not Operating (no availability record)
**And** availability loads from experience_availability table

### AC2: Date Selection
**When** I tap an available date
**Then** date selects and "Add to Trip" prefills with that date
**And** slots remaining displays: "X spots left"

## Tasks / Subtasks

### Task 1: Create Availability Calendar Component (AC: #1)
- [ ] Build AvailabilityCalendar component with 60-day date range
- [ ] Implement color-coded status system (green/yellow/red/gray indicators)
- [ ] Add date grid layout with mobile-first responsive design
- [ ] Fetch and parse experience_availability table data
- [ ] Display availability legend with status explanations

### Task 2: Implement Date Selection Logic (AC: #2)
- [ ] Add tap/click handlers for available dates (disabled for unavailable)
- [ ] Update selected date state and highlight selected date visually
- [ ] Calculate and display remaining slots for selected date
- [ ] Prefill "Add to Trip" CTA with selected date parameter
- [ ] Add deselection capability (tap again to deselect)

### Task 3: Optimize Data Fetching and Caching
- [ ] Query experience_availability by experience_id for next 60 days
- [ ] Implement Spark useKV caching for availability data
- [ ] Add loading skeleton while availability fetches
- [ ] Handle real-time updates when vendor changes availability
- [ ] Set cache expiry to 30 seconds for fresh data

### Task 4: Handle Edge Cases and Errors (AC: #1, #2)
- [ ] Display graceful error state if availability fails to load
- [ ] Show "No availability data" message if table has no records
- [ ] Handle timezone conversion for date display
- [ ] Prevent selection of past dates
- [ ] Add retry mechanism for failed availability requests

### Task 5: Test Across Devices and Accessibility (AC: #1, #2)
- [ ] Test calendar rendering on mobile (320px-428px), tablet, desktop
- [ ] Verify touch targets meet 44x44px minimum on mobile
- [ ] Ensure color status indicators have sufficient contrast (WCAG AA)
- [ ] Add ARIA labels for screen readers (date status, selection state)
- [ ] Test keyboard navigation for date selection

## Dev Notes

### Technical Implementation
- Use Spark useKV for caching availability queries
- Store availability as array of objects: `{ date: string, slots_available: number, slots_total: number }`
- Calculate percentage: `(slots_available / slots_total) * 100` to determine color
- Component location: `src/components/availability/AvailabilityCalendar.tsx`

### Database Query
```typescript
const availability = await db.experience_availability
  .where('experience_id', '=', experienceId)
  .where('date', '>=', today)
  .where('date', '<=', sixtyDaysFromNow)
  .orderBy('date', 'asc')
  .execute();
```

### Color Thresholds
- Green: `slots_available / slots_total > 0.5`
- Yellow: `slots_available > 0 && slots_available / slots_total <= 0.5`
- Red: `slots_available === 0`
- Gray: No record in experience_availability table

### Design System Tokens
- Use design system colors: `bg-success-light` (green), `bg-warning-light` (yellow), `bg-destructive-light` (red), `bg-gray-100` (gray)
- Border radius: `rounded-lg` (8px) for date cells
- Touch targets: Ensure date cells are at least 44x44px on mobile

### Accessibility
- Add `role="button"` to tappable date cells
- Include `aria-label` with full date and availability status
- Use `aria-selected` for selected date
- Ensure keyboard navigation with arrow keys and Enter to select

## References

- [Source: epics.md#Epic 15, Story 15.1]
- [Database Schema: experience_availability table]
- [Design System: Color tokens and spacing]
- [Related: Story 15.2 - Vendor Calendar Updates]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
