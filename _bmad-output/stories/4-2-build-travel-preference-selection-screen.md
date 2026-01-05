# Story 4.2: Build Travel Preference Selection Screen

Status: ready-for-dev

## Story

As a new user going through onboarding,
I want to select my travel preferences,
so that I receive personalized experience recommendations.

## Acceptance Criteria

1. **Given** I am on onboarding Screen 2 **When** the screen loads **Then** I see three preference sections with tappable cards: Travel Style (Adventure, Relaxation, Culture, Mix of Everything), Group Type (Solo, Couple, Friends, Family), Budget Feel (Budget-Conscious, Mid-Range, Luxury)
2. **When** I tap a preference card **Then** the card highlights with teal border and checkmark icon
3. Multiple selections are allowed within each section
4. At least one selection per section is required before continuing
5. **When** I tap "Continue" with valid selections **Then** preferences are saved to user_preferences table (user_id, travel_style[], group_type, budget_level, created_at)
6. I proceed to Screen 3 (Trip Dates)
7. Progress indicator shows "2 of 3"

## Tasks / Subtasks

- [ ] Task 1: Create preference selection UI (AC: #1)
  - [ ] Create `src/screens/onboarding/PreferencesScreen.tsx`
  - [ ] Create three sections with headers: "What's your travel style?", "Who are you traveling with?", "What's your budget?"
  - [ ] Build PreferenceCard component with icon, label, and selectable state
  - [ ] Add icons for each option (e.g., Tent for Adventure, Bed for Relaxation)
  - [ ] Responsive grid: 2 columns on mobile, 4 on larger screens
- [ ] Task 2: Implement selection behavior (AC: #2, #3)
  - [ ] Track selected options state for each section
  - [ ] Allow multiple selections within Travel Style section
  - [ ] Single selection for Group Type and Budget (radio behavior)
  - [ ] Animate card highlight (teal border, scale 1.02, checkmark fade-in)
  - [ ] Add tap feedback (scale 0.98 on press)
- [ ] Task 3: Implement validation (AC: #4)
  - [ ] Validate at least one selection in each section
  - [ ] Disable "Continue" button until all sections have selections
  - [ ] Highlight incomplete sections with subtle visual cue
  - [ ] Show inline message if user taps Continue with missing selections
- [ ] Task 4: Implement data persistence (AC: #5)
  - [ ] Define UserPreferences type in `src/types/user.ts`
  - [ ] Include: user_id, travel_style (array), group_type, budget_level, created_at
  - [ ] Save preferences to Spark useKV on Continue
  - [ ] Link preferences to authenticated user
- [ ] Task 5: Handle navigation (AC: #6, #7)
  - [ ] Navigate to Screen 3 (Trip Dates) on Continue
  - [ ] Update progress indicator to "2 of 3"
  - [ ] Add Back button to return to Welcome screen
  - [ ] Preserve selections if user goes back

## Dev Notes

- Travel Style allows multiple: user might want "Adventure + Culture"
- Group Type is single select: user travels with one group type
- Budget is single select: one budget range per trip
- Preferences used by recommendation engine in Story 4.4

### References

- [Source: epics.md#Story 4.2]
- [Source: prd/pulau-prd.md#Onboarding Flow]
- [Source: prd/pulau-prd.md#Personalization]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

