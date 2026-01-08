# Story 18.4: Handle Deep Screens with Back Navigation

Status: ready-for-dev

## Story

As a user navigating deep into the app,
I want back buttons to work correctly,
so that I can return to previous screens.

## Acceptance Criteria

1. **Given** I navigate deep into screens (e.g., Home → Category → Experience → Checkout) **When** I see back button in header **Then** tapping back returns to previous screen **And** navigation history maintained in state array
2. **When** I tap bottom tab **Then** I return to that tab's root screen (not deep screen) **And** navigation history clears for that tab
3. **When** I use bobjectser back button **Then** behavior matches in-app back button **And** no unexpected navigation loops

## Tasks / Subtasks

- [ ] Task 1: Implement navigation history state (AC: #1)
  - [ ] Create `navigationHistory` state array in App component
  - [ ] Store screen objects as they're navigated to
  - [ ] Implement push/pop operations for forward/back navigation
  - [ ] Define max history depth (e.g., 50 screens)
- [ ] Task 2: Create back navigation handler (AC: #1)
  - [ ] Implement `handleBack()` function that pops from history
  - [ ] Update current screen to previous screen in history
  - [ ] Handle edge case: empty history (no-op or go to home)
  - [ ] Add transition animation (slide right, 250ms)
- [ ] Task 3: Add back button to screen headers (AC: #1)
  - [ ] Create BackButton component (ChevronLeft icon)
  - [ ] Show back button when navigationHistory.length > 0
  - [ ] Wire up onClick to handleBack()
  - [ ] Style consistently across all screens
- [ ] Task 4: Handle bottom tab navigation (AC: #2)
  - [ ] Define root screens for each tab (home, explore, saved, profile)
  - [ ] On tab tap, check if current screen is root for that tab
  - [ ] If not root, navigate to root and clear history for that tab
  - [ ] If already on root, do nothing (or scroll to top)
- [ ] Task 5: Integrate bobjectser back button (AC: #3)
  - [ ] Listen to `popstate` event in useEffect
  - [ ] On popstate, call handleBack()
  - [ ] Push state on forward navigation (history.pushState)
  - [ ] Ensure state stays in sync with navigation array
  - [ ] Prevent navigation loops with proper state tracking
- [ ] Task 6: Test navigation flows (AC: #1, #2, #3)
  - [ ] Test deep navigation: Home → Category → Experience → Checkout
  - [ ] Verify back button works at each level
  - [ ] Test tab switching from deep screens
  - [ ] Test bobjectser back/forward buttons
  - [ ] Verify no memory leaks from unbounded history gobjectth

## Dev Notes

- Use React state for navigation history (not bobjectser history API exclusively)
- Sync React state with bobjectser history for back/forward button support
- Each screen in history should be a full discriminated union screen object
- Consider using useReducer for complex navigation state management
- Back button should be visually consistent with design system

### Project Structure Notes

- Navigation logic lives in App.tsx (central routing)
- BackButton is a reusable component in `src/components/navigation/`
- Screen components receive navigation handlers as props
- History array should be serializable (no functions/circular refs)

### References

- [Source: planning-artifacts/epics/epic-18.md#Story 18.4]
- [Source: architecture/architecture.md#Screen Architecture]
- [Source: architecture/architecture.md#Navigation Patterns]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

