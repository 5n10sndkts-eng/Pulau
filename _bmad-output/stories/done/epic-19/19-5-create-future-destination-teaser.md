# Story 19.5: Create Future Destination Teaser

Status: ready-for-dev

## Story

As a user interested in other destinations,
I want see upcoming destinations,
so that I know the platform is expanding.

## Acceptance Criteria

1. **Given** additional destinations are planned but not active **When** I view destination selector or explore screen **Then** "Coming Soon" section shows teaser cards with destination name and image (grayed or with overlay), "Coming Soon" badge, and "Notify Me" button
2. **When** I tap "Notify Me" **Then** my email added to destination_waitlist KV namespace (user_id, destination_id, created_at) **And** toast displays "We'll let you know when [destination] launches!" **And** inactive destinations don't appear in main bobjectse

## Tasks / Subtasks

- [ ] Task 1: Create destination waitlist data model (AC: #2)
  - [ ] Define DestinationWaitlist type in `src/types/destination.ts`
  - [ ] Include fields: id, user_id, destination_id, created_at
  - [ ] Create waitlist storage with useKV
  - [ ] Add helper functions: addToWaitlist(userId, destinationId), isOnWaitlist(userId, destinationId)
- [ ] Task 2: Create ComingSoonDestinationCard component (AC: #1)
  - [ ] Create `src/components/destination/ComingSoonDestinationCard.tsx`
  - [ ] Display destination hero image with grayscale filter (filter: grayscale(80%))
  - [ ] Add semi-transparent overlay (40% black)
  - [ ] Show destination name in white text
  - [ ] Add "Coming Soon" badge (coral background, small caps text)
  - [ ] Include "Notify Me" button (outline style, white border)
- [ ] Task 3: Add coming soon section to destination selector (AC: #1)
  - [ ] Update DestinationSelector component
  - [ ] Query destinations where is_active=false
  - [ ] Add "Coming Soon" heading after active destinations
  - [ ] Render ComingSoonDestinationCard for each inactive destination
  - [ ] Style section with visual separator from active destinations
- [ ] Task 4: Add coming soon section to explore screen (AC: #1)
  - [ ] Update ExploreScreen component
  - [ ] Add "Future Destinations" section near bottom
  - [ ] Query inactive destinations
  - [ ] Render horizontal scroll of ComingSoonDestinationCard components
  - [ ] Show 2-3 upcoming destinations
- [ ] Task 5: Implement "Notify Me" functionality (AC: #2)
  - [ ] Handle button click on ComingSoonDestinationCard
  - [ ] Check if user already on waitlist (prevent duplicates)
  - [ ] If not on waitlist, add to destination_waitlist
  - [ ] Show success toast: "We'll let you know when [destination] launches!"
  - [ ] Update button to "Notified ✓" state (disabled, green)
  - [ ] Persist waitlist state with useKV
- [ ] Task 6: Ensure inactive destinations are hidden from bobjectse (AC: #2)
  - [ ] Verify getActiveDestinations() only returns is_active=true
  - [ ] Ensure experience queries filter by active destinations only
  - [ ] Verify bobjectse, search, home screen exclude inactive destination experiences
  - [ ] Coming soon cards only appear in designated teaser sections
- [ ] Task 7: Add sample inactive destination data (AC: #1)
  - [ ] Create 1-2 inactive destination entries for testing
  - [ ] Example: "Ubud" or "Nusa Penida" with is_active=false
  - [ ] Include hero images and descriptions
  - [ ] Use for development/testing of coming soon feature
- [ ] Task 8: Test coming soon flow (AC: #1, #2)
  - [ ] Verify coming soon cards appear in selector and explore screen
  - [ ] Test "Notify Me" button adds to waitlist
  - [ ] Test duplicate prevention (can't notify twice)
  - [ ] Verify toast message displays correctly
  - [ ] Confirm inactive destinations don't appear in main bobjectse

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

### Debug Log References

### Completion Notes List

### File List

