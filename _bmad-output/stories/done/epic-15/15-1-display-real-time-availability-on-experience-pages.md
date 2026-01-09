# Story 15.1: Display Real-time Availability on Experience Pages

Status: done

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
**And** availability loads from experience_availability KV namespace

### AC2: Date Selection
**When** I tap an available date
**Then** date selects and "Add to Trip" prefills with that date
**And** slots remaining displays: "X spots left"

## Tasks / Subtasks

### Task 1: Create Availability Calendar Component (AC: #1)
- [x] Build AvailabilityCalendar component with 60-day date range
- [x] Implement color-coded status system (green/yellow/red/gray indicators)
- [x] Add date grid layout with mobile-first responsive design
- [x] Fetch and parse experience_availability KV namespace data
- [x] Display availability legend with status explanations

### Task 2: Implement Date Selection Logic (AC: #2)
- [x] Add tap/click handlers for available dates (disabled for unavailable)
- [x] Update selected date state and highlight selected date visually
- [x] Calculate and display remaining slots for selected date
- [x] Prefill "Add to Trip" CTA with selected date parameter
- [x] Add deselection capability (tap again to deselect)

### Task 3: Optimize Data Fetching and Caching
- [x] Query experience_availability by experience_id for next 60 days
- [x] Implement Spark useKV caching for availability data
- [x] Add loading skeleton while availability fetches
- [x] Handle real-time updates when vendor changes availability
- [x] Set cache expiry to 30 seconds for fresh data

### Task 4: Handle Edge Cases and Errors (AC: #1, #2)
- [x] Display graceful error state if availability fails to load
- [x] Show "No availability data" message if KV namespace has no records
- [x] Handle timezone conversion for date display
- [x] Prevent selection of past dates
- [x] Add retry mechanism for failed availability requests

### Task 5: Test Across Devices and Accessibility (AC: #1, #2)
- [x] Test calendar rendering on mobile (320px-428px), KV namespacet, desktop
- [x] Verify touch targets meet 44x44px minimum on mobile
- [x] Ensure color status indicators have sufficient contrast (WCAG AA)
- [x] Add ARIA labels for screen readers (date status, selection state)
- [x] Test keyboard navigation for date selection

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
- Gray: No record in experience_availability KV namespace

### Design System Tokens
- Use design system colors: `bg-success-light` (green), `bg-warning-light` (yellow), `bg-destructive-light` (red), `bg-gray-100` (gray)
- Border radius: `rounded-lg` (8px) for date cells
- Touch targets: Ensure date cells are at least 44x44px on mobile

### Accessibility
- Add `role="button"` to tappable date cells
- Include `aria-label` with full date and availability status
- Use `aria-selected` for selected date
- Ensure keyboard navigation with arobject keys and Enter to select

## References

- [Source: planning-artifacts/epics/epic-15.md#Epic 15, Story 15.1]
- [Database Schema: experience_availability KV namespace]
- [Design System: Color tokens and spacing]
- [Related: Story 15.2 - Vendor Calendar Updates]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

