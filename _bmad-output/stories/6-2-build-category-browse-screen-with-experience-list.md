# Story 6.2: Build Category Browse Screen with Experience List

Status: ready-for-dev

## Story

As a traveler,
I want to browse all experiences in a category,
so that I can see what's available.

## Acceptance Criteria

1. **Given** I tapped a category from Story 6.1 **When** the category browse screen loads **Then** header shows: back arrow, category title (e.g., "Water Adventures"), search icon
2. **And** experiences load from experiences table filtered by category and status = "active"
3. **And** each experience card displays:
   - Hero image (16:9 ratio, rounded corners 12px)
   - Provider badge overlay (vendor business_name)
   - Experience title below image
   - Quick stats: Duration icon + hours, Group size icon + max people, Star icon + rating (avg)
   - Price: "From $XX / person" (formatted with currency)
   - Two buttons: "+ Quick Add" (primary teal), "See Details" (text link)
4. **And** cards are in vertical scrolling list
5. **And** list shows skeleton loading state while fetching
6. **And** infinite scroll loads more experiences as I scroll down (20 per page)

## Tasks / Subtasks

- [ ] Task 1: Create category browse screen layout (AC: #1, #4)
  - [ ] Create `src/screens/browse/CategoryBrowseScreen.tsx`
  - [ ] Build header with back arrow, dynamic category title, search icon
  - [ ] Implement vertical scrolling container
  - [ ] Add sticky header that remains visible on scroll
  - [ ] Use SafeAreaView for proper spacing on mobile devices
- [ ] Task 2: Create ExperienceCard component (AC: #3)
  - [ ] Create `src/components/browse/ExperienceCard.tsx`
  - [ ] Display hero image with 16:9 aspect ratio, 12px rounded corners
  - [ ] Add provider badge overlay (semi-transparent dark background, white text)
  - [ ] Show experience title (bold, 16px, 2-line max with ellipsis)
  - [ ] Create quick stats row with icons (Phosphor): Clock (duration), Users (group size), Star (rating)
  - [ ] Format price as "From $XX / person" with currency formatting
  - [ ] Add "+ Quick Add" button (primary teal, rounded)
  - [ ] Add "See Details" text link (teal color, underlined on hover)
  - [ ] Apply card shadow and hover state animation
- [ ] Task 3: Implement data fetching (AC: #2, #6)
  - [ ] Create `src/hooks/useExperiences.ts` hook
  - [ ] Fetch experiences from Supabase experiences table
  - [ ] Filter by category_id and status = "active"
  - [ ] Include vendor business_name via join with vendors table
  - [ ] Calculate average rating from reviews table
  - [ ] Implement pagination (20 experiences per page)
  - [ ] Use cursor-based pagination for infinite scroll
  - [ ] Handle loading, error, and empty states
- [ ] Task 4: Add infinite scroll (AC: #6)
  - [ ] Detect when user scrolls near bottom (threshold: 200px from bottom)
  - [ ] Automatically load next page of experiences
  - [ ] Show loading spinner at bottom while fetching more
  - [ ] Prevent duplicate requests while loading
  - [ ] Handle end of list (no more experiences to load)
- [ ] Task 5: Implement skeleton loading state (AC: #5)
  - [ ] Create `src/components/browse/ExperienceCardSkeleton.tsx`
  - [ ] Show 3-5 skeleton cards while initial data loads
  - [ ] Animate skeleton with shimmer effect
  - [ ] Use same dimensions as actual experience cards
- [ ] Task 6: Add Quick Add functionality (AC: #3)
  - [ ] Handle "+ Quick Add" button tap
  - [ ] Add experience to trip itinerary (default to first available date)
  - [ ] Show success toast notification
  - [ ] Update button to "Added" with checkmark icon
  - [ ] Disable button after adding to prevent duplicates
- [ ] Task 7: Implement navigation (AC: #3)
  - [ ] Handle "See Details" tap to navigate to experience detail page
  - [ ] Pass experience_id to detail screen
  - [ ] Use slide-in transition animation (300ms)
  - [ ] Handle back navigation to return to browse screen

## Dev Notes

- Follow mobile-first design with responsive breakpoints
- Use skeleton loading states for better perceived performance
- Implement with Framer Motion for smooth animations
- Experience cards should have subtle hover/press animations
- Images should lazy load as they enter viewport
- Optimize image loading with srcset for different screen sizes
- Cache fetched experiences to reduce API calls on back navigation
- Handle network errors gracefully with retry option

### Technical Guidance

- Use Supabase real-time subscriptions for live updates (optional for MVP)
- Consider implementing virtual scrolling for large lists (100+ items)
- Store scroll position to restore when navigating back
- Use React Query or SWR for data fetching and caching
- Implement debounced scroll handler to improve performance

### References

- [Source: epics.md#Story 6.2]
- [Source: prd/pulau-prd.md#Experience Discovery]
- [Source: prd/pulau-prd.md#Design System]
- [Database: experiences table schema]
- [Database: vendors table schema]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
