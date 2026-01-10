# Story 25.4: Add Instant Confirmation Filter

Status: ready-for-dev

## Story

As a **traveler**,
I want to filter experiences by "Instant Confirmation",
So that I can find experiences that confirm immediately.

## Acceptance Criteria

1. **Given** I am browsing experiences
   **When** I enable the "Instant Confirmation" filter
   **Then** only experiences with `instant_book_enabled = true` are shown
   **And** each result shows an "Instant" badge
   **And** the filter is available on search results and category browse screens

## Tasks / Subtasks

- [ ] Add "Instant Confirmation" filter chip (AC: 1)
  - [ ] Add filter chip to horizontal filter bar component
  - [ ] Position after existing filters (difficulty/duration/price)
  - [ ] Use coral accent color for active state
  - [ ] Label: "Instant Confirmation" with lightning bolt icon
- [ ] Implement filter logic (AC: 1)
  - [ ] Add `instantBookOnly` boolean to filter state
  - [ ] Query experiences where `instant_book_enabled = true` when filter active
  - [ ] Update Supabase query in experienceService.ts
  - [ ] Combine with other active filters (difficulty, duration, price)
- [ ] Add "Instant" badge to experience cards (AC: 1)
  - [ ] Create badge component with lightning bolt icon
  - [ ] Position in top-right corner of experience card image
  - [ ] Use golden sand color: `oklch(0.87 0.12 85)` with dark text
  - [ ] Show only on experiences where `instant_book_enabled = true`
  - [ ] Animate badge entrance with subtle fade-in (200ms)
- [ ] Apply filter to all browse screens (AC: 1)
  - [ ] Add to category browse screen (e.g., "Water Sports")
  - [ ] Add to search results screen
  - [ ] Persist filter state when navigating between screens
  - [ ] Clear filter when returning to home screen

## Dev Notes

### Architecture Patterns

**Filter System:**
- Follows existing horizontal filter chip pattern from Epic 6, Story 6-3
- Filter state managed in parent browse/search component
- Passed to experienceService query as parameter
- Combined with other filters using SQL AND conditions

**Database Schema:**
- Column: `vendors.instant_book_enabled` (added in Epic 22, Story 22.4)
- Join experiences table with vendors table to check instant_book_enabled
- Query: `SELECT * FROM experiences JOIN vendors ON experiences.vendor_id = vendors.id WHERE vendors.instant_book_enabled = true`

**Badge Component:**
- Reusable component: `src/components/ui/badge.tsx` (already exists from shadcn/ui)
- Create variant: `instant` with golden sand background
- Icon: Lightning bolt from Lucide React (`Zap` icon)

### Code Quality Requirements

**TypeScript Patterns:**
- Add `instantBookOnly?: boolean` to filter interface
- Update ExperienceQueryParams type in types.ts
- Strict null checks: handle undefined filter values
- Use optional chaining when accessing vendor.instant_book_enabled

**React Patterns:**
- Use existing filter state management pattern (likely useState or useKV)
- Update filter state on chip toggle
- Re-query experiences when filter changes (useEffect dependency)
- Use TanStack Query for data fetching with proper cache invalidation

**Styling:**
- Badge: Golden sand background `bg-[oklch(0.87_0.12_85)]`, dark text `text-[oklch(0.25_0_0)]`
- Icon size: 14px, stroke width: 2
- Badge border radius: 4px
- Position: absolute top-2 right-2 on experience card

### File Structure

**Files to Modify:**
- `src/components/CategoryBrowseScreen.tsx` - Add filter chip and badge
- `src/components/SearchResultsScreen.tsx` - Add filter chip and badge
- `src/lib/experienceService.ts` - Update query to filter by instant_book_enabled
- `src/lib/types.ts` - Add instantBookOnly to ExperienceQueryParams
- `src/components/ExperienceCard.tsx` - Add "Instant" badge rendering

**Database Schema Reference:**
- Table: `vendors` - column `instant_book_enabled` (boolean)
- Table: `experiences` - join with vendors via `vendor_id` foreign key
- Use LEFT JOIN to handle vendors without instant book setting

### Testing Requirements

**Manual Testing:**
- Navigate to category browse screen
- Toggle "Instant Confirmation" filter chip
- Verify only instant-book experiences show
- Verify "Instant" badge appears on filtered results
- Test filter combination with other filters (e.g., Instant + Beginner difficulty)
- Check responsive design on mobile

**Edge Cases:**
- No results when instant book filter active (show empty state)
- All experiences are instant book (filter appears but doesn't change results)
- Filter persistence when navigating back from experience detail

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 25: Real-Time Inventory & Availability
- Implements FR-BOOK-01: Filter by "Instant Confirmation"
- Works with Epic 22 (Vendor Stripe Onboarding) which adds instant_book_enabled column

**Integration Points:**
- Uses vendor data from Epic 22 (instant_book_enabled flag)
- Integrates with existing filter system from Epic 6
- Coordin with Story 25.5 (slot availability display) for complete instant book UX

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-25-Story-25.4]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-BOOK-01]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Experience-Discovery-Filtering]
- [Source: project-context.md#Component-Styling-Patterns]
- [Source: project-context.md#Tailwind-CSS-Patterns]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
