# Story 8.9: Handle Date Not Set Flow

Status: done

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
- [x] Build SetDatesPrompt banner component
- [x] Display at top of trip builder when dates are null
- [x] Include calendar icon and "Set your dates" text
- [x] Add "Choose dates" button opening date picker
- [x] Style with gentle background color (yellow/sand tint)

### Task 2: Route all items to unscheduled when no dates (AC: #1)
- [x] Check if trip.start_date and trip.end_date are null
- [x] Display only "Unscheduled" section (no day sections)
- [x] Show all trip items in unscheduled section
- [x] Add helper text: "Add dates to schedule your activities"
- [x] Disable drag-to-schedule functionality when no dates

### Task 3: Implement checkout date prompt modal (AC: #2)
- [x] Create CheckoutDatePromptModal component
- [x] Trigger on "Continue to Booking" click if dates are null
- [x] Show modal heading: "When are you traveling?"
- [x] Add DateRangePicker for date selection
- [x] Include "Set Dates" (primary) and "Skip for now" (secondary) buttons

### Task 4: Handle "Set Dates" action (AC: #3)
- [x] On "Set Dates": update trip.start_date and trip.end_date
- [x] Persist date updates via useKV
- [x] Keep all items in unscheduled section (no auto-assignment)
- [x] Close modal and proceed to checkout
- [x] Show success toast: "Dates saved"

### Task 5: Handle "Skip for now" action (AC: #2)
- [x] On "Skip for now": proceed to checkout without dates
- [x] Show warning toast: "Remember to coordinate dates with operators"
- [x] Allow booking process to continue
- [x] Display "Dates not set" in checkout review
- [x] Add note in booking confirmation email about date coordination

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

