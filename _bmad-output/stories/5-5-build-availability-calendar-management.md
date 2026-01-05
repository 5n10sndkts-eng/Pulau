# Story 5.5: Build Availability Calendar Management

Status: ready-for-dev

## Story

As a vendor,
I want to manage which dates my experience is available,
so that travelers can only book when I'm operating.

## Acceptance Criteria

1. **Given** I am editing an experience **When** I navigate to "Manage Availability" tab **Then** I see a calendar UI for the next 12 months
2. Each date shows: Available (green), Limited Spots (yellow), Sold Out (red), Blocked (gray)
3. **When** I click a date **Then** I can set: Status (Available/Blocked), Slots Available (number)
4. Changes save to experience_availability table (experience_id, date, slots_available, status)
5. **When** I select "Set Recurring Availability" **Then** I can define: Days of week operating (checkboxes), Slots per day (number), Date range
6. Bulk records are created for matching dates
7. Blackout dates can be added to block specific days
8. Availability updates sync to customer views in real-time

## Tasks / Subtasks

- [ ] Task 1: Create availability calendar UI (AC: #1, #2)
  - [ ] Create `src/screens/vendor/AvailabilityCalendarScreen.tsx`
  - [ ] Build 12-month calendar grid
  - [ ] Color-code dates: green (available), yellow (limited <5), red (sold out), gray (blocked)
  - [ ] Add month navigation arrows
  - [ ] Show current month by default
  - [ ] Display slots count on hover/tap
- [ ] Task 2: Implement single date editing (AC: #3, #4)
  - [ ] Open modal on date click
  - [ ] Status toggle: Available / Blocked
  - [ ] Slots available number input
  - [ ] "Save" and "Cancel" buttons
  - [ ] Update experience_availability record
  - [ ] Reflect color change immediately on calendar
- [ ] Task 3: Implement recurring availability (AC: #5, #6)
  - [ ] Create "Set Recurring" button
  - [ ] Open recurring configuration modal
  - [ ] Day of week checkboxes (Mon-Sun)
  - [ ] Slots per day input
  - [ ] Date range pickers (start, end)
  - [ ] Generate bulk records for matching dates
  - [ ] Show preview of affected dates
- [ ] Task 4: Implement blackout dates (AC: #7)
  - [ ] Add "Block Dates" mode
  - [ ] Allow selecting multiple dates
  - [ ] Bulk update selected dates to "blocked"
  - [ ] Useful for holidays, maintenance, etc.
- [ ] Task 5: Create availability data model (AC: #4)
  - [ ] Define ExperienceAvailability type
  - [ ] Include: id, experience_id, date, slots_available, status
  - [ ] Status enum: available, blocked
  - [ ] Create storage in useKV
- [ ] Task 6: Sync to customer views (AC: #8)
  - [ ] Ensure customer browse shows correct availability
  - [ ] Update availability instantly on save
  - [ ] Handle concurrent booking conflicts (edge case)

## Dev Notes

- Calendar should be performant with 365+ days
- Consider lazy loading months as user navigates
- Slots tracking enables "Only X spots left!" urgency
- Blocked dates prevent any bookings

### References

- [Source: epics.md#Story 5.5]
- [Source: prd/pulau-prd.md#Availability System]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

