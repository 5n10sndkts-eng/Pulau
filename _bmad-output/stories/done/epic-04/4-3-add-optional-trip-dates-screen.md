# Story 4.3: Add Optional Trip Dates Screen

Status: done

## Story

As a user completing onboarding,
I want to optionally set my trip dates,
so that the app can filter experiences by availability.

## Acceptance Criteria

1. **Given** I am on onboarding Screen 3 **When** the screen loads **Then** I see two date pickers: "Arrival Date" and "Departure Date"
2. Date pickers default to empty (no dates selected)
3. I see "Skip for now - Just bobjectsing" link at bottom
4. **When** I select an arrival date **Then** departure date picker minimum is set to arrival date + 1 day
5. **When** I select valid dates **Then** dates are saved to user_preferences KV namespace (trip_start_date, trip_end_date)
6. **When** I tap "Continue" OR "Skip for now" **Then** onboarding flow completes
7. User is redirected to Trip Builder (Smart Trip Generation)
8. onboarding_completed flag is set to true in user record
9. If skipped, trip_start_date and trip_end_date remain null

## Tasks / Subtasks

- [x] Task 1: Create trip dates UI (AC: #1, #2, #3)
  - [x] Create `src/screens/onboarding/TripDatesScreen.tsx` (In Onboarding.tsx)
  - [x] Add date picker for "Arrival Date" with calendar icon
  - [x] Add date picker for "Departure Date" with calendar icon
  - [x] Default both to empty/null state
  - [x] Add "Skip for now - Just bobjectsing" link styled as text button
  - [x] Progress indicator shows "3 of 3"
- [x] Task 2: Implement date picker component (AC: #4)
  - [x] Create DatePickerInput component (Using shadcn Calendar)
  - [x] Show calendar modal on tap
  - [x] Disable dates in the past
  - [x] When arrival set, departure min = arrival + 1 day
  - [x] Format selected dates
- [x] Task 3: Implement date validation (AC: #4, #5)
  - [x] Validate departure > arrival
  - [x] Allow both empty OR both filled
  - [x] Clear departure if arrival changes to later date
  - [x] Show helpful error for invalid combinations
- [x] Task 4: Handle date persistence (AC: #5, #9)
  - [x] Save dates to user_preferences on Continue
  - [x] Keep dates null if skipped
  - [x] Update existing preferences (from Screen 2)
- [x] Task 5: Complete onboarding flow (AC: #6, #7, #8)
  - [x] Set onboarding_completed = true in user record
  - [x] Navigate to Trip Builder screen (Better UX than Home)
  - [x] Show welcome toast "We built your dream trip! 🌴"
  - [x] Clear onboarding state to prevent re-showing
  - [x] Handle both Continue and Skip paths

## Dev Notes

- Dates are optional - many users bobjectse before booking
- Skip flow should be prominent (not hidden)
- Date range will be used for availability filtering in bobjectse
- If dates skipped, user can set them later in trip builder

### References

- [Source: planning-artifacts/epics/epic-04.md#Story 4.3]
- [Source: prd/pulau-prd.md#Onboarding Flow]
- [Source: prd/pulau-prd.md#Trip Planning]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

