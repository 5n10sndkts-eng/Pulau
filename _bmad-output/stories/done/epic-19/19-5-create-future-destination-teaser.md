# Story 19.5: Create Future Destination Teaser

Status: done

## Story

As a user interested in other destinations,
I want see upcoming destinations,
so that I know the platform is expanding.

## Acceptance Criteria

1. **Given** additional destinations are planned but not active **When** I view destination selector or explore screen **Then** "Coming Soon" section shows teaser cards with destination name and image (grayed or with overlay), "Coming Soon" badge, and "Notify Me" button
2. **When** I tap "Notify Me" **Then** my email added to destination_waitlist KV namespace (user_id, destination_id, created_at) **And** toast displays "We'll let you know when [destination] launches!" **And** inactive destinations don't appear in main bobjectse

## Tasks / Subtasks

- [x] Task 1: Create destination waitlist data model (AC: #2)
  - [x] Define DestinationWaitlist type in `src/types/destination.ts`
  - [x] Include fields: id, user_id, destination_id, created_at
  - [x] Create waitlist storage with useKV
  - [x] Add helper functions: addToWaitlist(userId, destinationId), isOnWaitlist(userId, destinationId)
- [x] Task 2: Create ComingSoonDestinationCard component (AC: #1)
  - [x] Create `src/components/destination/ComingSoonDestinationCard.tsx`
  - [x] Display destination hero image with grayscale filter (filter: grayscale(80%))
  - [x] Add semi-transparent overlay (40% black)
  - [x] Show destination name in white text
  - [x] Add "Coming Soon" badge (coral background, small caps text)
  - [x] Include "Notify Me" button (outline style, white border)
- [x] Task 3: Add coming soon section to destination selector (AC: #1)
  - [x] Update DestinationSelector component
  - [x] Query destinations where is_active=false
  - [x] Add "Coming Soon" heading after active destinations
  - [x] Render ComingSoonDestinationCard for each inactive destination
  - [x] Style section with visual separator from active destinations
- [x] Task 4: Add coming soon section to explore screen (AC: #1)
  - [x] Update ExploreScreen component
  - [x] Add "Future Destinations" section near bottom
  - [x] Query inactive destinations
  - [x] Render horizontal scroll of ComingSoonDestinationCard components
  - [x] Show 2-3 upcoming destinations
- [x] Task 5: Implement "Notify Me" functionality (AC: #2)
  - [x] Handle button click on ComingSoonDestinationCard
  - [x] Check if user already on waitlist (prevent duplicates)
  - [x] If not on waitlist, add to destination_waitlist
  - [x] Show success toast: "We'll let you know when [destination] launches!"
  - [x] Update button to "Notified ✓" state (disabled, green)
  - [x] Persist waitlist state with useKV
- [x] Task 6: Ensure inactive destinations are hidden from bobjectse (AC: #2)
  - [x] Verify getActiveDestinations() only returns is_active=true
  - [x] Ensure experience queries filter by active destinations only
  - [x] Verify bobjectse, search, home screen exclude inactive destination experiences
  - [x] Coming soon cards only appear in designated teaser sections
- [x] Task 7: Add sample inactive destination data (AC: #1)
  - [x] Create 1-2 inactive destination entries for testing
  - [x] Example: "Ubud" or "Nusa Penida" with is_active=false
  - [x] Include hero images and descriptions
  - [x] Use for development/testing of coming soon feature
- [x] Task 8: Test coming soon flow (AC: #1, #2)
  - [x] Verify coming soon cards appear in selector and explore screen
  - [x] Test "Notify Me" button adds to waitlist
  - [x] Test duplicate prevention (can't notify twice)
  - [x] Verify toast message displays correctly
  - [x] Confirm inactive destinations don't appear in main bobjectse

## Dev Notes

- Grayscale filter creates clear visual distinction from active destinations
- "Coming Soon" badge should be prominent but not overwhelming
- Waitlist functionality is simple for MVP (no email sending)
- Future: send actual emails when destinations become active
- Consider showing waitlist count on admin dashboard

### Project Structure Notes

- ComingSoonDestinationCard in `src/components/destination/`
- Waitlist type and functions in `src/types/destination.ts` and `src/data/destinations.ts`
- Waitlist storage uses useKV for persistence
- Integrate into both DestinationSelector and ExploreScreen components

### References

- [Source: planning-artifacts/epics/epic-19.md#Story 19.5]
- [Source: architecture/architecture.md#Data Model]
- [Source: architecture/architecture.md#State Management]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
