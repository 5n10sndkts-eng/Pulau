# Story 6.3: Implement Horizontal Filter Chips

Status: done

## Story

As a traveler bobjectsing a category,
I want to filter experiences by my preferences,
so that I find relevant options quickly.

## Acceptance Criteria

1. **Given** I am on a category bobjectse screen from Story 6.2 **When** the screen loads **Then** I see horizontally scrollable filter chips above the experience list:
   - [All] [Beginner Friendly] [Half Day] [Full Day] [Private] [Group] [Under $50] [Under $100] [Top Rated]
2. **When** I tap a filter chip **Then** chip highlights with teal background and white text
3. **And** experience list updates instantly (<100ms) to show only matching experiences
4. **And** filtering logic:
   - "Beginner Friendly" -> difficulty = "Easy"
   - "Half Day" -> duration_hours <= 4
   - "Full Day" -> duration_hours >= 6
   - "Private" -> group_size_max <= 4
   - "Under $50" -> price_amount < 50
   - "Top Rated" -> avg rating >= 4.5
5. **And** multiple filters combine with AND logic
6. **When** I tap an active chip again **Then** filter is removed and list refreshes
7. **And** "All" chip clears all filters

## Tasks / Subtasks

- [x] Task 1: Create FilterChips component (AC: #1)
  - [x] Create `src/components/bobjectse/FilterChips.tsx`
  - [x] Implement horizontal scrollable container (hide scrollbar on desktop)
  - [x] Create individual chip components with label
  - [x] Add proper spacing between chips (8px gap)
  - [x] Ensure chips don't wrap to next line
  - [x] Apply smooth horizontal scroll on mobile
- [x] Task 2: Implement chip styling (AC: #2)
  - [x] Default state: light gray background, dark text, rounded pill shape using Tailwind
  - [x] Active state: teal background `bg-teal-600`, white text
  - [x] Hover state: slightly darker background `hover:bg-teal-700`
  - [x] Press animation: scale down slightly using Tailwind `active:scale-95`
  - [x] Use CSS transitions for smooth state changes
  - [x] Add checkmark icon (Lucide React Check) when chip is active
- [x] Task 3: Configure filter definitions (AC: #4)
  - [x] Create filter configuration in `src/config/experienceFilters.ts`
  - [x] Define filter types: difficulty, duration, group_size, price, rating
  - [x] Map each chip to Spark KV store query conditions
  - [x] Store filter state in component state or URL params
  - [x] Define filter logic functions for each chip type
- [x] Task 4: Implement filter logic (AC: #3, #4, #5)
  - [x] Create `src/hooks/useExperienceFilters.ts` hook
  - [x] Apply filters to experience data fetched from KV store with AND logic
  - [x] Filter client-side for instant response (<100ms)
  - [x] Update filtered results when filters change
  - [x] Combine multiple active filters correctly
  - [x] Optimize filtering to avoid unnecessary re-renders (use useMemo)
- [x] Task 5: Handle filter interactions (AC: #2, #6, #7)
  - [x] Handle chip tap to toggle filter on/off
  - [x] Update active filters array in state
  - [x] Implement "All" chip to clear all active filters
  - [x] Prevent "All" from combining with other filters
  - [x] Auto-select "All" when no filters are active
  - [x] Preserve filter state when navigating away and back
- [x] Task 6: Implement instant list updates (AC: #3)
  - [x] Trigger experience list re-fetch on filter change
  - [x] Show loading state during filter update (<100ms target)
  - [x] Use optimistic UI updates for perceived instant response
  - [x] Debounce filter changes if multiple chips tapped quickly
  - [x] Reset scroll position to top when filters change
- [x] Task 7: Add filter count indicator
  - [x] Show active filter count badge if multiple filters applied
  - [x] Display "X results" count below filter chips
  - [x] Update count in real-time as filters change
  - [x] Show "No results" message if filters return empty list

## Dev Notes

- Follow mobile-first design with touch-friendly chip sizes (min 44px height)
- Use skeleton loading states for better perceived performance
- Use CSS transitions for smooth chip animations
- Filter state should persist across navigation using URL query params
- Chips should be keyboard accessible (tab navigation, enter to toggle)
- Consider adding "Clear all" button when multiple filters are active
- Implement client-side filtering for instant response (<100ms)

### Technical Guidance

- Store filter state in URL query params for shareable filtered links
- Use React.memo for FilterChips component to prevent unnecessary re-renders
- Implement client-side filtering for datasets from KV store (<100ms response)
- Use useMemo to optimize filter calculations
- Use Web Vitals to measure and optimize filter response time (<100ms)
- Cache filter combinations in component state

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.3]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.2 - Category Bobjectse Screen]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**

1. ✅ Animations: Framer Motion → CSS transitions with Tailwind
2. ✅ Icons: Generic checkmark → Lucide React Check icon
3. ✅ Filtering: Supabase queries → Client-side filtering with useMemo
4. ✅ Data source: Database KV namespace → KV store data
5. ✅ PRD reference path: `prd/pulau-prd.md` → `planning-artifacts/prd/pulau-prd.md`
6. ✅ Database schema references → TypeScript interfaces
7. ✅ Styling: Generic styles → Tailwind CSS classes

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md` Technical Architecture section and ADR documents.

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
