# Story 6.3: Implement Horizontal Filter Chips

Status: ready-for-dev

## Story

As a traveler browsing a category,
I want to filter experiences by my preferences,
so that I find relevant options quickly.

## Acceptance Criteria

1. **Given** I am on a category browse screen from Story 6.2 **When** the screen loads **Then** I see horizontally scrollable filter chips above the experience list:
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

- [ ] Task 1: Create FilterChips component (AC: #1)
  - [ ] Create `src/components/browse/FilterChips.tsx`
  - [ ] Implement horizontal scrollable container (hide scrollbar on desktop)
  - [ ] Create individual chip components with label
  - [ ] Add proper spacing between chips (8px gap)
  - [ ] Ensure chips don't wrap to next line
  - [ ] Apply smooth horizontal scroll on mobile
- [ ] Task 2: Implement chip styling (AC: #2)
  - [ ] Default state: light gray background, dark text, rounded pill shape
  - [ ] Active state: teal background (#0D9488), white text
  - [ ] Hover state: slightly darker background
  - [ ] Press animation: scale down slightly (0.95)
  - [ ] Use Framer Motion for smooth transitions
  - [ ] Add checkmark icon when chip is active
- [ ] Task 3: Configure filter definitions (AC: #4)
  - [ ] Create filter configuration in `src/config/experienceFilters.ts`
  - [ ] Define filter types: difficulty, duration, group_size, price, rating
  - [ ] Map each chip to database query conditions
  - [ ] Store filter state in component state or URL params
  - [ ] Define filter logic functions for each chip type
- [ ] Task 4: Implement filter logic (AC: #3, #4, #5)
  - [ ] Create `src/hooks/useExperienceFilters.ts` hook
  - [ ] Apply filters to experience query with AND logic
  - [ ] Update query when filters change
  - [ ] Combine multiple active filters correctly
  - [ ] Optimize query to avoid unnecessary database calls
  - [ ] Use Supabase query builder for efficient filtering
- [ ] Task 5: Handle filter interactions (AC: #2, #6, #7)
  - [ ] Handle chip tap to toggle filter on/off
  - [ ] Update active filters array in state
  - [ ] Implement "All" chip to clear all active filters
  - [ ] Prevent "All" from combining with other filters
  - [ ] Auto-select "All" when no filters are active
  - [ ] Preserve filter state when navigating away and back
- [ ] Task 6: Implement instant list updates (AC: #3)
  - [ ] Trigger experience list re-fetch on filter change
  - [ ] Show loading state during filter update (<100ms target)
  - [ ] Use optimistic UI updates for perceived instant response
  - [ ] Debounce filter changes if multiple chips tapped quickly
  - [ ] Reset scroll position to top when filters change
- [ ] Task 7: Add filter count indicator
  - [ ] Show active filter count badge if multiple filters applied
  - [ ] Display "X results" count below filter chips
  - [ ] Update count in real-time as filters change
  - [ ] Show "No results" message if filters return empty list

## Dev Notes

- Follow mobile-first design with touch-friendly chip sizes (min 44px height)
- Use skeleton loading states for better perceived performance
- Implement with Framer Motion for smooth animations
- Filter state should persist across navigation (use URL params or session storage)
- Chips should be keyboard accessible (tab navigation, enter to toggle)
- Consider adding "Clear all" button when multiple filters are active

### Technical Guidance

- Store filter state in URL query params for shareable filtered links
- Use React.memo for FilterChips component to prevent unnecessary re-renders
- Implement filter logic on backend (Supabase query) for better performance
- Consider client-side filtering for small datasets (<100 items) to improve responsiveness
- Use Web Vitals to measure and optimize filter response time (<100ms)
- Cache filter combinations to reduce database load

### References

- [Source: epics.md#Story 6.3]
- [Source: prd/pulau-prd.md#Experience Discovery]
- [Source: prd/pulau-prd.md#Design System]
- [Database: experiences table schema]
- [Related: Story 6.2 - Category Browse Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
