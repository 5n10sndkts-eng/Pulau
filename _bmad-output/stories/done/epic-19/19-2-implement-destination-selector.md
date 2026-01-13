# Story 19.2: Implement Destination Selector

Status: done

## Story

As a traveler,
I want select my destination,
so that I see relevant experiences.

## Acceptance Criteria

1. **Given** multiple destinations exist **When** I open the app **Then** if only one active destination, auto-select it
2. **When** multiple destinations are active **Then** destination selector displays in header or splash **And** selector shows destination cards with image, name, tagline
3. **When** I select a destination **Then** user_preferences.destination_id updates **And** all experience queries filter by destination_id **And** home screen shows destination-specific content **And** destination name shows in header (e.g., "Explore Bali")

## Tasks / Subtasks

- [x] Task 1: Create destination selection state (AC: #1, #3)
  - [x] Add selectedDestinationId to app state
  - [x] Store selection in useKV for persistence
  - [x] Create context/provider for destination state
  - [x] Add getSelectedDestination() helper function
- [x] Task 2: Implement auto-selection logic (AC: #1)
  - [x] On app load, check number of active destinations
  - [x] If exactly 1 active destination, auto-select it
  - [x] Store auto-selection in user preferences
  - [x] Skip destination selector UI if auto-selected
- [x] Task 3: Create DestinationSelector component (AC: #2)
  - [x] Create `src/components/destination/DestinationSelector.tsx`
  - [x] Display as modal/splash screen on first load
  - [x] Show grid of destination cards (1 or 2 columns)
  - [x] Each card shows: hero image, destination name, tagline
  - [x] Style cards with hover/tap states (scale up 1.05)
- [x] Task 4: Design destination card (AC: #2)
  - [x] Use destination hero_image_url as background
  - [x] Overlay gradient for text readability
  - [x] Display destination name (h2, font-heading)
  - [x] Display tagline/description (truncated to 2 lines)
  - [x] Add "Explore" button or make entire card tappable
- [x] Task 5: Handle destination selection (AC: #3)
  - [x] On card tap, set selectedDestinationId
  - [x] Update user_preferences.destination_id in useKV
  - [x] Close selector modal
  - [x] Navigate to home screen
- [x] Task 6: Filter experiences by destination (AC: #3)
  - [x] Update all experience queries to filter by destination_id
  - [x] Modify getExperiences() to accept destinationId param
  - [x] Update home screen, category bobjectse, search to use filter
  - [x] Ensure no experiences from other destinations appear
- [x] Task 7: Display destination in header (AC: #3)
  - [x] Add destination name to app header
  - [x] Format as "Explore [Destination]" (e.g., "Explore Bali")
  - [x] Make header tappable to change destination (if multiple available)
  - [x] Show destination switcher icon if multiple destinations
- [x] Task 8: Test destination selection flow (AC: #1-3)
  - [x] Test single destination: auto-selects, no selector shown
  - [x] Test multiple destinations: selector appears, card selection works
  - [x] Verify experiences filter correctly by destination
  - [x] Test destination persistence across app reloads

## Dev Notes

- Destination selector should be visually compelling (hero images)
- Consider splash screen approach for better UX on first load
- Use framer-motion for smooth card animations
- Ensure destination selection is cached for fast subsequent loads
- Header destination name should be prominent but not overwhelming

### Project Structure Notes

- DestinationSelector is a modal component shown conditionally in App.tsx
- Destination state managed via React Context or app-level state
- Experience filtering happens at data layer, not UI layer
- Header component receives selectedDestination as prop

### References

- [Source: planning-artifacts/epics/epic-19.md#Story 19.2]
- [Source: architecture/architecture.md#State Management]
- [Source: architecture/architecture.md#User Preferences]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
