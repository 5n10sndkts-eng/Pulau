# Story 4.3: Add Optional Trip Dates Screen

Status: ready-for-dev

## Story

As a user completing onboarding,
I want to optionally set my trip dates,
so that the app can filter experiences by availability.

## Acceptance Criteria

1. **Given** I am on onboarding Screen 3 **When** the screen loads **Then** I see two date pickers: "Arrival Date" and "Departure Date"
2. Date pickers default to empty (no dates selected)
3. I see "Skip for now - Just browsing" link at bottom
4. **When** I select an arrival date **Then** departure date picker minimum is set to arrival date + 1 day
5. **When** I select valid dates **Then** dates are saved to user_preferences table (trip_start_date, trip_end_date)
6. **When** I tap "Continue" OR "Skip for now" **Then** onboarding flow completes
7. User is redirected to Home screen (/home)
8. onboarding_completed flag is set to true in user record
9. If skipped, trip_start_date and trip_end_date remain null

## Tasks / Subtasks

- [ ] Task 1: Create trip dates UI (AC: #1, #2, #3)
  - [ ] Create `src/screens/onboarding/TripDatesScreen.tsx`
  - [ ] Add date picker for "Arrival Date" with calendar icon
  - [ ] Add date picker for "Departure Date" with calendar icon
  - [ ] Default both to empty/null state
  - [ ] Add "Skip for now - Just browsing" link styled as text button
  - [ ] Progress indicator shows "3 of 3"
- [ ] Task 2: Implement date picker component (AC: #4)
  - [ ] Create DatePickerInput component (or use Radix date picker)
  - [ ] Show calendar modal on tap
  - [ ] Disable dates in the past
  - [ ] When arrival set, departure min = arrival + 1 day
  - [ ] Format selected dates as "Mon, Jan 15, 2026"
- [ ] Task 3: Implement date validation (AC: #4, #5)
  - [ ] Validate departure > arrival
  - [ ] Allow both empty OR both filled
  - [ ] Clear departure if arrival changes to later date
  - [ ] Show helpful error for invalid combinations
- [ ] Task 4: Handle date persistence (AC: #5, #9)
  - [ ] Save dates to user_preferences on Continue
  - [ ] Keep dates null if skipped
  - [ ] Update existing preferences (from Screen 2)
- [ ] Task 5: Complete onboarding flow (AC: #6, #7, #8)
  - [ ] Set onboarding_completed = true in user record
  - [ ] Navigate to Home screen
  - [ ] Show welcome toast "You're all set! Start exploring."
  - [ ] Clear onboarding state to prevent re-showing
  - [ ] Handle both Continue and Skip paths

## Dev Notes

- Dates are optional - many users browse before booking
- Skip flow should be prominent (not hidden)
- Date range will be used for availability filtering in browse
- If dates skipped, user can set them later in trip builder

### References

- [Source: epics.md#Story 4.3]
- [Source: prd/pulau-prd.md#Onboarding Flow]
- [Source: prd/pulau-prd.md#Trip Planning]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

