# Story 8.9: Handle Date Not Set Flow

Status: ready-for-dev

## Story

As a traveler who hasn't set trip dates,
I want to bobjectse and add items without dates,
So that I can plan before committing to dates.

## Acceptance Criteria

**AC #1: Allow planning without dates**
**Given** my trip has no dates set (start_date and end_date are null)
**When** I add items to trip
**Then** all items go to "Unscheduled" section
**And** trip builder shows "Set your dates" prompt at top

**AC #2: Prompt for dates at checkout**
**When** I tap "Continue to Booking" without dates
**Then** modal prompts: "When are you traveling?"
**And** date picker with "Set Dates" and "Skip for now" buttons

**AC #3: Setting dates doesn't auto-assign items**
**When** I set dates
**Then** unscheduled items remain unscheduled (not auto-assigned)
**And** I can now drag items to specific days

## Tasks / Subtasks

### Task 1: Create "Set your dates" prompt component (AC: #1)
- [ ] Build SetDatesPrompt banner component
- [ ] Display at top of trip builder when dates are null
- [ ] Include calendar icon and "Set your dates" text
- [ ] Add "Choose dates" button opening date picker
- [ ] Style with gentle background color (yellow/sand tint)

### Task 2: Route all items to unscheduled when no dates (AC: #1)
- [ ] Check if trip.start_date and trip.end_date are null
- [ ] Display only "Unscheduled" section (no day sections)
- [ ] Show all trip items in unscheduled section
- [ ] Add helper text: "Add dates to schedule your activities"
- [ ] Disable drag-to-schedule functionality when no dates

### Task 3: Implement checkout date prompt modal (AC: #2)
- [ ] Create CheckoutDatePromptModal component
- [ ] Trigger on "Continue to Booking" click if dates are null
- [ ] Show modal heading: "When are you traveling?"
- [ ] Add DateRangePicker for date selection
- [ ] Include "Set Dates" (primary) and "Skip for now" (secondary) buttons

### Task 4: Handle "Set Dates" action (AC: #3)
- [ ] On "Set Dates": update trip.start_date and trip.end_date
- [ ] Persist date updates via useKV
- [ ] Keep all items in unscheduled section (no auto-assignment)
- [ ] Close modal and proceed to checkout
- [ ] Show success toast: "Dates saved"

### Task 5: Handle "Skip for now" action (AC: #2)
- [ ] On "Skip for now": proceed to checkout without dates
- [ ] Show warning toast: "Remember to coordinate dates with operators"
- [ ] Allow booking process to continue
- [ ] Display "Dates not set" in checkout review
- [ ] Add note in booking confirmation email about date coordination

## Dev Notes

### Technical Guidance
- Date check: `const noDates = !trip.start_date || !trip.end_date`
- Modal: use shadcn/ui Dialog component
- Date prompt should be non-blocking (allow skip)
- Unscheduled section should be prominent when no dates set
- Enable scheduling features only after dates are set

### Component Hierarchy
```
TripBuilder
├── {noDates && <SetDatesPrompt onClick={openDatePicker} />}
├── DateRangePicker (modal)
├── {noDates ? (
│   <UnscheduledSection items={trip.items} />
│ ) : (
│   <>
│     <DaySections />
│     <UnscheduledSection />
│   </>
│ )}
└── {showDatePrompt && <CheckoutDatePromptModal />}
```

### Date State Logic
```typescript
const noDatesSet = !trip.start_date || !trip.end_date;
const canScheduleItems = !noDatesSet;

// At checkout
const handleContinueToBooking = () => {
  if (noDatesSet) {
    setShowDatePromptModal(true);
  } else {
    navigateToCheckout();
  }
};
```

### Visual Specifications
- SetDatesPrompt: Golden sand background (#F4D03F20), padding 16px
- Modal: centered on screen, max-width 500px
- Date picker: calendar with range selection
- "Skip for now" button: gray/secondary styling
- Warning toast: yellow/warning color scheme

## References

- [Source: planning-artifacts/epics/epic-08.md#Epic 8, Story 8.9]
- [Source: prd/pulau-prd.md#Trip Canvas - Flexible Planning]
- [Related: Story 8.4 - Create Detailed Trip Builder Screen]
- [Related: Story 10.1 - Create Checkout Flow Navigation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
