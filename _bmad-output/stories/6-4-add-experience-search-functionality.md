# Story 6.4: Add Experience Search Functionality

Status: ready-for-dev

## Story

As a traveler,
I want to search for experiences by keyword,
so that I can quickly find specific activities.

## Acceptance Criteria

1. **Given** I am on any category browse screen **When** I tap the search icon in header **Then** a search input field expands below header
2. **When** I type a search query (e.g., "snorkeling", "temple", "cooking") **Then** experiences are filtered in real-time as I type (debounced 300ms)
3. **And** search matches against: experience title, description, subcategory, vendor businessName, tags
4. **And** results display with search terms highlighted using `<mark>` element
5. **When** no results match **Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Browse All]"
6. **When** I clear search or tap back **Then** full experience list returns
7. **And** search queries log to KV store at key `analytics:search:log` (userId, query, resultsCount, searchedAt) for analytics

## Tasks / Subtasks

- [ ] Task 1: Create search input component (AC: #1)
  - [ ] Create `src/components/browse/SearchBar.tsx`
  - [ ] Implement expandable search input below header
  - [ ] Add search icon (Lucide React Search) on left, clear button (X icon) on right
  - [ ] Apply smooth expand/collapse animation using Tailwind transitions
  - [ ] Auto-focus input when expanded using ref
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
  - [ ] Debounce search input changes by 300ms using lodash.debounce or custom hook
  - [ ] Filter experiences data from KV store client-side
  - [ ] Search fields: title, description, subcategory, vendor.businessName, tags
  - [ ] Use case-insensitive string matching (toLowerCase)
  - [ ] Combine search with active filters (AND logic)
  - [ ] Handle loading state during search
- [ ] Task 4: Add search highlighting (AC: #4)
  - [ ] Create `src/components/browse/HighlightedText.tsx` component
  - [ ] Highlight matching terms in experience title using `<mark>` element
  - [ ] Highlight matching terms in description preview
  - [ ] Use yellow/teal background for highlights with Tailwind `bg-yellow-200 dark:bg-yellow-900`
  - [ ] Handle multiple search terms (split by space)
  - [ ] Case-insensitive highlighting using regex
- [ ] Task 5: Implement empty state (AC: #5)
  - [ ] Create `src/components/browse/SearchEmptyState.tsx`
  - [ ] Display friendly illustration (no results icon)
  - [ ] Show message: "No experiences match 'query'"
  - [ ] Add suggestion text: "Try different keywords"
  - [ ] Include "Browse All" button to clear search
  - [ ] Show popular search suggestions if available
- [ ] Task 6: Add search analytics logging (AC: #7)
  - [ ] Store search logs in KV store at key `analytics:search:log`
  - [ ] Log each search query after debounce completes
  - [ ] Record: userId, query, resultsCount, searchedAt, categoryId
  - [ ] Handle anonymous users (null userId)
  - [ ] Use background async logging (don't block UI)
  - [ ] Add error handling for failed logs
  - [ ] Append to array of search log entries
- [ ] Task 7: Optimize search performance (AC: #2)
  - [ ] Implement client-side caching of search results
  - [ ] Use search result cache for repeated queries
  - [ ] Add loading indicator during search
  - [ ] Cancel pending requests when new query is entered
  - [ ] Implement minimum query length (2-3 characters)
  - [ ] Show "Type at least 2 characters" hint

## Dev Notes

- Follow mobile-first design with responsive search bar
- Use debounced search (300ms) to reduce unnecessary filtering
- Use CSS transitions for smooth expand/collapse animations
- Search should work across all categories or within current category
- Consider implementing search suggestions/autocomplete (future enhancement)
- Cache recent searches in localStorage for quick access

### Technical Guidance

- Implement client-side search for instant results from KV store data
- Use fuzzy matching for better search results (optional: use fuse.js)
- Implement search ranking/relevance scoring
- Use AbortController pattern for cleanup if needed
- Consider implementing search history (store last 10 searches in localStorage)
- Add telemetry to track search performance and popular queries
- Use React Query or useMemo for search result caching

### References

- [Source: epics.md#Story 6.4]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.2 - Category Browse Screen]
- [Related: Story 6.3 - Filter Chips]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ Data layer: Supabase full-text search → Client-side filtering with KV store data
2. ✅ Database tables: `search_log` table → KV store analytics log
3. ✅ Search implementation: ILIKE queries → JavaScript string matching
4. ✅ Icons: Generic icons → Lucide React Search and X icons
5. ✅ Animations: Generic animations → Tailwind CSS transitions
6. ✅ Highlighting: Generic background → `<mark>` element with Tailwind classes
7. ✅ Database schema references → TypeScript interfaces and KV store patterns
8. ✅ PRD reference path: `prd/pulau-prd.md` → `planning-artifacts/prd/pulau-prd.md`
9. ✅ Column names: snake_case → camelCase (business_name → businessName)

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md` Technical Architecture section and ADR documents.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
