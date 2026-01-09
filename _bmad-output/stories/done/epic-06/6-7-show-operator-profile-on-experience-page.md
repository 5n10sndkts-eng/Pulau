# Story 6.7: Show Operator Profile on Experience Page

Status: done

## Story

As a traveler,
I want to learn about the local operator,
so that I feel confident booking with them.

## Acceptance Criteria

1. **Given** I am on an experience detail page **When** I scroll to "Meet Your Local Operator" section **Then** I see a card with warm coral background (oklch(0.68 0.17 25) at 10% opacity)
2. Card displays:
   - Circular vendor photo (from vendors.photo_url, 80px diameter)
   - Vendor business_name
   - Tagline "Family operated since {vendors.since_year}"
   - Short bio (from vendors.bio, max 300 chars with "read more" if truncated)
   - Badge object: "Local Business", "Verified Partner" (if vendors.verified = true), "Responds in X hours" (from vendors.avg_response_time)
3. "Message Operator" button (secondary coral outline)
4. **When** I tap vendor name or photo **Then** vendor full profile modal opens with complete bio and all their experiences

## Tasks / Subtasks

- [x] Task 1: Create OperatorProfile component (AC: #1)
  - [x] Create `src/components/experience/OperatorProfile.tsx`
  - [x] Accept vendorId or vendor object as prop
  - [x] Warm coral background card (10% opacity)
  - [x] 16px border radius, 20px padding
  - [x] Section header: "Meet Your Local Operator"
- [x] Task 2: Build operator display (AC: #2)
  - [x] Circular photo (80px diameter) or placeholder avatar
  - [x] Business name (bold, 18px)
  - [x] Tagline: "Family operated since {since_year}"
  - [x] Bio text (max 300 chars, truncated with "read more")
  - [x] Bio expansion on tap
- [x] Task 3: Add operator badges (AC: #2)
  - [x] Create OperatorBadge component
  - [x] "Local Business" badge (always shown)
  - [x] "Verified Partner" badge (if verified = true)
  - [x] "Responds in X hours" badge (if avg_response_time exists)
  - [x] Badge styling: pill shape, teal border
- [x] Task 4: Add Message button (AC: #3)
  - [x] "Message Operator" button
  - [x] Secondary style: coral outline, coral text
  - [x] Navigate to messaging (Story 15.5)
  - [x] Position below badges
- [x] Task 5: Implement vendor profile modal (AC: #4)
  - [x] Create VendorProfileModal component
  - [x] Show on tap of name/photo
  - [x] Display full bio (no truncation)
  - [x] List all operator's experiences
  - [x] Include total reviews and average rating

## Dev Notes

- Builds trust by showing local operator details
- "since_year" humanizes the business
- Response time badge sets expectations for messaging
- Modal allows exploring operator without leaving page

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.7]
- [Source: prd/pulau-prd.md#Vendor Display]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

