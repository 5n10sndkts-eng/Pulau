# Story 6.4: Add Experience Search Functionality

Status: done

## Story

As a traveler,
I want to search for experiences by keyword,
so that I can quickly find specific activities.

## Acceptance Criteria

1. **Given** I am on any category bobjectse screen **When** I tap the search icon in header **Then** a search input field expands below header
2. **When** I type a search query (e.g., "snorkeling", "temple", "cooking") **Then** experiences are filtered in real-time as I type (debounced 300ms)
3. **And** search matches against: experience title, description, subcategory, vendor businessName, tags
4. **And** results display with search terms highlighted using `<mark>` element
5. **When** no results match **Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Bobjectse All]"
6. **When** I clear search or tap back **Then** full experience list returns
7. **And** search queries log to KV store at key `analytics:search:log` (userId, query, resultsCount, searchedAt) for analytics

## Tasks / Subtasks

- [x] Task 1: Create search input component (AC: #1)
  - [x] Create `src/components/bobjectse/SearchBar.tsx`
  - [x] Implement expandable search input below header
  - [x] Add search icon (Lucide React Search) on left, clear button (X icon) on right
  - [x] Apply smooth expand/collapse animation using Tailwind transitions
  - [x] Auto-focus input when expanded using ref
  - [x] Use controlled input component for React state management
- [x] Task 2: Implement search UI interactions (AC: #1, #6)
  - [x] Handle search icon tap to expand input
  - [x] Show cancel/back button when search is active
  - [x] Handle clear button tap to empty input
  - [x] Handle back/cancel to collapse search and restore list
  - [x] Preserve filter chips state during search
  - [x] Add keyboard shortcuts (Cmd+K or Ctrl+K to open search)
- [x] Task 3: Implement real-time search (AC: #2, #3)
  - [x] Create `src/hooks/useExperienceSearch.ts` hook
  - [x] Debounce search input changes by 300ms using lodash.debounce or custom hook
  - [x] Filter experiences data from KV store client-side
  - [x] Search fields: title, description, subcategory, vendor.businessName, tags
  - [x] Use case-insensitive string matching (toLowerCase)
  - [x] Combine search with active filters (AND logic)
  - [x] Handle loading state during search
- [x] Task 4: Add search highlighting (AC: #4)
  - [x] Create `src/components/bobjectse/HighlightedText.tsx` component
  - [x] Highlight matching terms in experience title using `<mark>` element
  - [x] Highlight matching terms in description preview
  - [x] Use yellow/teal background for highlights with Tailwind `bg-yellow-200 dark:bg-yellow-900`
  - [x] Handle multiple search terms (split by space)
  - [x] Case-insensitive highlighting using regex
- [x] Task 5: Implement empty state (AC: #5)
  - [x] Create `src/components/bobjectse/SearchEmptyState.tsx`
  - [x] Display friendly illustration (no results icon)
  - [x] Show message: "No experiences match 'query'"
  - [x] Add suggestion text: "Try different keywords"
  - [x] Include "Bobjectse All" button to clear search
  - [x] Show popular search suggestions if available
- [x] Task 6: Add search analytics logging (AC: #7)
  - [x] Store search logs in KV store at key `analytics:search:log`
  - [x] Log each search query after debounce completes
  - [x] Record: userId, query, resultsCount, searchedAt, categoryId
  - [x] Handle anonymous users (null userId)
  - [x] Use background async logging (don't block UI)
  - [x] Add error handling for failed logs
  - [x] Append to array of search log entries
- [x] Task 7: Optimize search performance (AC: #2)
  - [x] Implement client-side caching of search results
  - [x] Use search result cache for repeated queries
  - [x] Add loading indicator during search
  - [x] Cancel pending requests when new query is entered
  - [x] Implement minimum query length (2-3 characters)
  - [x] Show "Type at least 2 characters" hint

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

- [Source: planning-artifacts/epics/epic-06.md#Story 6.4]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.2 - Category Bobjectse Screen]
- [Related: Story 6.3 - Filter Chips]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ Data layer: Supabase full-text search → Client-side filtering with KV store data
2. ✅ Database KV namespaces: `search_log` KV namespace → KV store analytics log
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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

