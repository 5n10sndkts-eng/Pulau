# Story 6.6: Display "What's Included" Section

Status: ready-for-dev

## Story

As a traveler viewing an experience,
I want to see what's included in the price,
so that I know what I'm paying for.

## Acceptance Criteria

1. **Given** I am on an experience detail page from Story 6.5 **When** I scroll to "What's Included" section **Then** I see two subsections:
   - "What's Included" with green checkmarks (✓)
   - "Not Included" with X marks (✗)
2. Included items load from experience_inclusions where is_included = true
3. Excluded items load from experience_inclusions where is_included = false
4. Each item displays as a list item with icon and text
5. Section has white card background with 20px padding
6. Items are displayed in the order they were added by vendor

## Tasks / Subtasks

- [ ] Task 1: Create WhatsIncluded component (AC: #1, #5)
  - [ ] Create `src/components/experience/WhatsIncluded.tsx`
  - [ ] Accept experienceId or inclusions array as prop
  - [ ] White card background with shadow
  - [ ] 20px padding, 12px border radius
  - [ ] Section header: "What's Included" (bold, 20px)
- [ ] Task 2: Build Included items list (AC: #1, #2, #4)
  - [ ] Filter inclusions where is_included = true
  - [ ] Display each item with green checkmark icon (Check)
  - [ ] Checkmark color: success green (#27AE60)
  - [ ] Item text next to icon
  - [ ] Vertical list layout
- [ ] Task 3: Build Not Included items list (AC: #1, #3, #4)
  - [ ] Add "Not Included" subheader
  - [ ] Filter inclusions where is_included = false
  - [ ] Display each item with X icon
  - [ ] X icon color: muted gray or coral
  - [ ] Clear visual separation from included items
- [ ] Task 4: Handle data and ordering (AC: #2, #3, #6)
  - [ ] Fetch experience_inclusions by experience_id
  - [ ] Separate into included/excluded arrays
  - [ ] Maintain order from created_at or display_order
  - [ ] Handle empty states (no inclusions/exclusions)
- [ ] Task 5: Style and layout
  - [ ] Vertical spacing between items (12px)
  - [ ] Divider between included and not included sections
  - [ ] Icon aligned left, text wraps as needed
  - [ ] Responsive padding on mobile

## Dev Notes

- This section appears on experience detail page after About
- Green checks and red X's are universally understood
- Keep list scannable - short item descriptions work best
- Handle case when vendor hasn't added any inclusions

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.6]
- [Source: prd/pulau-prd.md#Experience Details]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

