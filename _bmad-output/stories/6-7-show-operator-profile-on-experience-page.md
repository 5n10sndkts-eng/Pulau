# Story 6.7: Show Operator Profile on Experience Page

Status: ready-for-dev

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
   - Badge row: "Local Business", "Verified Partner" (if vendors.verified = true), "Responds in X hours" (from vendors.avg_response_time)
3. "Message Operator" button (secondary coral outline)
4. **When** I tap vendor name or photo **Then** vendor full profile modal opens with complete bio and all their experiences

## Tasks / Subtasks

- [ ] Task 1: Create OperatorProfile component (AC: #1)
  - [ ] Create `src/components/experience/OperatorProfile.tsx`
  - [ ] Accept vendorId or vendor object as prop
  - [ ] Warm coral background card (10% opacity)
  - [ ] 16px border radius, 20px padding
  - [ ] Section header: "Meet Your Local Operator"
- [ ] Task 2: Build operator display (AC: #2)
  - [ ] Circular photo (80px diameter) or placeholder avatar
  - [ ] Business name (bold, 18px)
  - [ ] Tagline: "Family operated since {since_year}"
  - [ ] Bio text (max 300 chars, truncated with "read more")
  - [ ] Bio expansion on tap
- [ ] Task 3: Add operator badges (AC: #2)
  - [ ] Create OperatorBadge component
  - [ ] "Local Business" badge (always shown)
  - [ ] "Verified Partner" badge (if verified = true)
  - [ ] "Responds in X hours" badge (if avg_response_time exists)
  - [ ] Badge styling: pill shape, teal border
- [ ] Task 4: Add Message button (AC: #3)
  - [ ] "Message Operator" button
  - [ ] Secondary style: coral outline, coral text
  - [ ] Navigate to messaging (Story 15.5)
  - [ ] Position below badges
- [ ] Task 5: Implement vendor profile modal (AC: #4)
  - [ ] Create VendorProfileModal component
  - [ ] Show on tap of name/photo
  - [ ] Display full bio (no truncation)
  - [ ] List all operator's experiences
  - [ ] Include total reviews and average rating

## Dev Notes

- Builds trust by showing local operator details
- "since_year" humanizes the business
- Response time badge sets expectations for messaging
- Modal allows exploring operator without leaving page

### References

- [Source: epics.md#Story 6.7]
- [Source: prd/pulau-prd.md#Vendor Display]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

