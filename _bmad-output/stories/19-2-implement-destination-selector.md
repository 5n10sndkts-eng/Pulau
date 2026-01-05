# Story 19.2: Implement Destination Selector

Status: ready-for-dev

## Story

As a traveler,
I want select my destination,
so that I see relevant experiences.

## Acceptance Criteria

1. **Given** multiple destinations exist **When** I open the app **Then** if only one active destination, auto-select it
2. **When** multiple destinations are active **Then** destination selector displays in header or splash **And** selector shows destination cards with image, name, tagline
3. **When** I select a destination **Then** user_preferences.destination_id updates **And** all experience queries filter by destination_id **And** home screen shows destination-specific content **And** destination name shows in header (e.g., "Explore Bali")

## Tasks / Subtasks

- [ ] Task 1: Create destination selection state (AC: #1, #3)
  - [ ] Add selectedDestinationId to app state
  - [ ] Store selection in useKV for persistence
  - [ ] Create context/provider for destination state
  - [ ] Add getSelectedDestination() helper function
- [ ] Task 2: Implement auto-selection logic (AC: #1)
  - [ ] On app load, check number of active destinations
  - [ ] If exactly 1 active destination, auto-select it
  - [ ] Store auto-selection in user preferences
  - [ ] Skip destination selector UI if auto-selected
- [ ] Task 3: Create DestinationSelector component (AC: #2)
  - [ ] Create `src/components/destination/DestinationSelector.tsx`
  - [ ] Display as modal/splash screen on first load
  - [ ] Show grid of destination cards (1 or 2 columns)
  - [ ] Each card shows: hero image, destination name, tagline
  - [ ] Style cards with hover/tap states (scale up 1.05)
- [ ] Task 4: Design destination card (AC: #2)
  - [ ] Use destination hero_image_url as background
  - [ ] Overlay gradient for text readability
  - [ ] Display destination name (h2, font-heading)
  - [ ] Display tagline/description (truncated to 2 lines)
  - [ ] Add "Explore" button or make entire card tappable
- [ ] Task 5: Handle destination selection (AC: #3)
  - [ ] On card tap, set selectedDestinationId
  - [ ] Update user_preferences.destination_id in useKV
  - [ ] Close selector modal
  - [ ] Navigate to home screen
- [ ] Task 6: Filter experiences by destination (AC: #3)
  - [ ] Update all experience queries to filter by destination_id
  - [ ] Modify getExperiences() to accept destinationId param
  - [ ] Update home screen, category browse, search to use filter
  - [ ] Ensure no experiences from other destinations appear
- [ ] Task 7: Display destination in header (AC: #3)
  - [ ] Add destination name to app header
  - [ ] Format as "Explore [Destination]" (e.g., "Explore Bali")
  - [ ] Make header tappable to change destination (if multiple available)
  - [ ] Show destination switcher icon if multiple destinations
- [ ] Task 8: Test destination selection flow (AC: #1-3)
  - [ ] Test single destination: auto-selects, no selector shown
  - [ ] Test multiple destinations: selector appears, card selection works
  - [ ] Verify experiences filter correctly by destination
  - [ ] Test destination persistence across app reloads

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

- [Source: epics.md#Story 19.2]
- [Source: architecture/architecture.md#State Management]
- [Source: architecture/architecture.md#User Preferences]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

