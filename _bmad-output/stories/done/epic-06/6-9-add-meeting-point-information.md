# Story 6.9: Add Meeting Point Information

Status: ready-for-dev

## Story

As a traveler,
I want to know where to meet for the experience,
so that I can plan my arrival.

## Acceptance Criteria

1. **Given** I am on an experience detail page **When** I scroll to "Where You'll Meet" section **Then** I see:
   - Embedded static map image showing meeting location (via Google Maps Static API or Mapbox)
   - Meeting point name (from experiences.meeting_point_name)
   - Full address (from experiences.meeting_point_address)
   - Copy icon button next to address (copies to clipboard on tap)
   - "Get Directions" link (opens default maps app with coordinates)
   - Additional instructions (from experiences.meeting_instructions) if provided
2. Map marker shows at experiences.meeting_point_lat, meeting_point_lng
3. **When** I tap "Get Directions" **Then** deep link opens to: Google Maps on Android, Apple Maps on iOS with destination pre-filled

## Tasks / Subtasks

- [ ] Task 1: Create MeetingPoint component (AC: #1)
  - [ ] Create `src/components/experience/MeetingPoint.tsx`
  - [ ] Accept meeting point data as props
  - [ ] Section header: "Where You'll Meet"
  - [ ] White card background with padding
- [ ] Task 2: Add static map image (AC: #1, #2)
  - [ ] Generate static map URL (Mapbox or Google Maps Static API)
  - [ ] Display map with marker at lat/lng
  - [ ] Map size: full width, ~150px height
  - [ ] 8px border radius on map
  - [ ] Handle missing coordinates gracefully
- [ ] Task 3: Display meeting point details (AC: #1)
  - [ ] Meeting point name (bold, 16px)
  - [ ] Full address (regular, 14px, gray)
  - [ ] Additional instructions (if meeting_instructions exists)
  - [ ] Instructions in subtle callout box
- [ ] Task 4: Implement copy to clipboard (AC: #1)
  - [ ] Add copy icon next to address
  - [ ] Copy full address on tap
  - [ ] Show toast "Address copied"
  - [ ] Use clipboard API
- [ ] Task 5: Implement Get Directions (AC: #1, #3)
  - [ ] "Get Directions" button/link
  - [ ] Create deep link to maps app
  - [ ] iOS: open Apple Maps with coordinates
  - [ ] Android/Web: open Google Maps with coordinates
  - [ ] Use geo: or maps: URL schemes

## Dev Notes

- Static map avoids heavy JavaScript map library
- Consider caching map images for offline
- Get Directions is high-value for day-of use
- Copy button saves typing long addresses

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.9]
- [Source: prd/pulau-prd.md#Meeting Point]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

