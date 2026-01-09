# Story 6.9: Add Meeting Point Information

Status: done

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

- [x] Task 1: Create MeetingPoint component (AC: #1)
  - [x] Create `src/components/experience/MeetingPoint.tsx`
  - [x] Accept meeting point data as props
  - [x] Section header: "Where You'll Meet"
  - [x] White card background with padding
- [x] Task 2: Add static map image (AC: #1, #2)
  - [x] Generate static map URL (Mapbox or Google Maps Static API)
  - [x] Display map with marker at lat/lng
  - [x] Map size: full width, ~150px height
  - [x] 8px border radius on map
  - [x] Handle missing coordinates gracefully
- [x] Task 3: Display meeting point details (AC: #1)
  - [x] Meeting point name (bold, 16px)
  - [x] Full address (regular, 14px, gray)
  - [x] Additional instructions (if meeting_instructions exists)
  - [x] Instructions in subtle callout box
- [x] Task 4: Implement copy to clipboard (AC: #1)
  - [x] Add copy icon next to address
  - [x] Copy full address on tap
  - [x] Show toast "Address copied"
  - [x] Use clipboard API
- [x] Task 5: Implement Get Directions (AC: #1, #3)
  - [x] "Get Directions" button/link
  - [x] Create deep link to maps app
  - [x] iOS: open Apple Maps with coordinates
  - [x] Android/Web: open Google Maps with coordinates
  - [x] Use geo: or maps: URL schemes

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

