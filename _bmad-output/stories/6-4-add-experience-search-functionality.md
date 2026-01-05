# Story 6.4: Add Experience Search Functionality

Status: ready-for-dev

## Story

As a traveler,
I want to search for experiences by keyword,
so that I can quickly find specific activities.

## Acceptance Criteria

1. **Given** I am on any category browse screen **When** I tap the search icon in header **Then** a search input field expands below header
2. **When** I type a search query (e.g., "snorkeling", "temple", "cooking") **Then** experiences are filtered in real-time as I type (debounced 300ms)
3. **And** search matches against: experience title, description, subcategory, vendor business_name, tags
4. **And** results display with search terms highlighted
5. **When** no results match **Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Browse All]"
6. **When** I clear search or tap back **Then** full experience list returns
7. **And** search queries log to search_log table (user_id, query, results_count, searched_at) for analytics

## Tasks / Subtasks

- [ ] Task 1: Create search input component (AC: #1)
  - [ ] Create `src/components/browse/SearchBar.tsx`
  - [ ] Implement expandable search input below header
  - [ ] Add search icon on left, clear button (X) on right
  - [ ] Apply smooth expand/collapse animation (200ms)
  - [ ] Auto-focus input when expanded
  - [ ] Use controlled input component for React state management
- [ ] Task 2: Implement search UI interactions (AC: #1, #6)
  - [ ] Handle search icon tap to expand input
  - [ ] Show cancel/back button when search is active
  - [ ] Handle clear button tap to empty input
  - [ ] Handle back/cancel to collapse search and restore list
  - [ ] Preserve filter chips state during search
  - [ ] Add keyboard shortcuts (Cmd+K or Ctrl+K to open search)
- [ ] Task 3: Implement real-time search (AC: #2, #3)
  - [ ] Create `src/hooks/useExperienceSearch.ts` hook
  - [ ] Debounce search input changes by 300ms
  - [ ] Query experiences table with text search
  - [ ] Search fields: title, description, subcategory, vendor.business_name, tags
  - [ ] Use Supabase full-text search or ILIKE queries
  - [ ] Combine search with active filters (AND logic)
  - [ ] Handle loading state during search
- [ ] Task 4: Add search highlighting (AC: #4)
  - [ ] Create `src/components/browse/HighlightedText.tsx` component
  - [ ] Highlight matching terms in experience title
  - [ ] Highlight matching terms in description preview
  - [ ] Use yellow/teal background for highlights
  - [ ] Handle multiple search terms (split by space)
  - [ ] Case-insensitive highlighting
- [ ] Task 5: Implement empty state (AC: #5)
  - [ ] Create `src/components/browse/SearchEmptyState.tsx`
  - [ ] Display friendly illustration (no results icon)
  - [ ] Show message: "No experiences match 'query'"
  - [ ] Add suggestion text: "Try different keywords"
  - [ ] Include "Browse All" button to clear search
  - [ ] Show popular search suggestions if available
- [ ] Task 6: Add search analytics logging (AC: #7)
  - [ ] Create search_log table in Supabase if not exists
  - [ ] Log each search query after debounce completes
  - [ ] Record: user_id, query, results_count, searched_at, category_id
  - [ ] Handle anonymous users (null user_id)
  - [ ] Use background async logging (don't block UI)
  - [ ] Add error handling for failed logs
- [ ] Task 7: Optimize search performance (AC: #2)
  - [ ] Implement client-side caching of search results
  - [ ] Use search result cache for repeated queries
  - [ ] Add loading indicator during search
  - [ ] Cancel pending requests when new query is entered
  - [ ] Implement minimum query length (2-3 characters)
  - [ ] Show "Type at least 2 characters" hint

## Dev Notes

- Follow mobile-first design with responsive search bar
- Use debounced search (300ms) to reduce API calls
- Implement with Framer Motion for smooth animations
- Search should work across all categories or within current category
- Consider implementing search suggestions/autocomplete (future enhancement)
- Cache recent searches in localStorage for quick access

### Technical Guidance

- Use Supabase full-text search (textsearch column) for better performance
- Create GIN index on search fields for faster queries
- Implement search ranking/relevance scoring
- Use AbortController to cancel pending search requests
- Consider implementing search history (store last 10 searches)
- Add telemetry to track search performance and popular queries
- Use React Query with staleTime for search result caching

### References

- [Source: epics.md#Story 6.4]
- [Source: prd/pulau-prd.md#Experience Discovery]
- [Source: prd/pulau-prd.md#Design System]
- [Database: experiences table schema]
- [Database: search_log table schema]
- [Related: Story 6.2 - Category Browse Screen]
- [Related: Story 6.3 - Filter Chips]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
