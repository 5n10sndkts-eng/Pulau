# Story 6.6: Display "What's Included" Section

Status: done

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

- [x] Task 1: Create WhatsIncluded component (AC: #1, #5)
  - [x] Create `src/components/experience/WhatsIncluded.tsx`
  - [x] Accept experienceId or inclusions array as prop
  - [x] White card background with shadow
  - [x] 20px padding, 12px border radius
  - [x] Section header: "What's Included" (bold, 20px)
- [x] Task 2: Build Included items list (AC: #1, #2, #4)
  - [x] Filter inclusions where is_included = true
  - [x] Display each item with green checkmark icon (Check)
  - [x] Checkmark color: success green (#27AE60)
  - [x] Item text next to icon
  - [x] Vertical list layout
- [x] Task 3: Build Not Included items list (AC: #1, #3, #4)
  - [x] Add "Not Included" subheader
  - [x] Filter inclusions where is_included = false
  - [x] Display each item with X icon
  - [x] X icon color: muted gray or coral
  - [x] Clear visual separation from included items
- [x] Task 4: Handle data and ordering (AC: #2, #3, #6)
  - [x] Fetch experience_inclusions by experience_id
  - [x] Separate into included/excluded arrays
  - [x] Maintain order from created_at or display_order
  - [x] Handle empty states (no inclusions/exclusions)
- [x] Task 5: Style and layout
  - [x] Vertical spacing between items (12px)
  - [x] Divider between included and not included sections
  - [x] Icon aligned left, text wraps as needed
  - [x] Responsive padding on mobile

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

