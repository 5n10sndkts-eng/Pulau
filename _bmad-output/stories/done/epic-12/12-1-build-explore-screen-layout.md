# Story 12.1: Build Explore Screen Layout

Status: done

## Story

As a traveler looking for inspiration,
I want a discovery-focused explore screen,
So that I can find interesting experiences beyond categories.

## Acceptance Criteria

### AC 1: Navigation Access

**Given** I am using the app
**When** I tap "Explore" in bottom navigation (Compass icon)
**Then** the Explore screen loads
**And** the screen is accessible from any part of the app

### AC 2: Vertically Scrolling Sections

**Given** the Explore screen has loaded
**When** I view the screen
**Then** I see vertically scrolling sections in this order:

- Search bar at top (sticky)
- "Trending in Bali" horizontal carousel
- "Hidden Gems" horizontal carousel
- "Limited Availability" horizontal carousel
- "Destination Guides" grid (2 columns)
- "Stories from Travelers" vertical list
  **And** all sections are properly spaced and styled

### AC 3: Sticky Search Bar

**Given** I am viewing the Explore screen
**When** I scroll down through sections
**Then** the search bar at top remains sticky (visible)
**And** the search bar doesn't scroll off screen

### AC 4: See All Links

**Given** each section is displayed
**When** I view a section header
**Then** each section has "See All" link
**And** tapping "See All" navigates to full section view

### AC 5: Pull-to-Refresh

**Given** I am on the Explore screen
**When** I pull down from the top
**Then** pull-to-refresh triggers content refresh
**And** all sections reload with fresh data

### AC 6: Loading States

**Given** the Explore screen is loading
**When** data is being fetched
**Then** skeleton loading states display while data loads
**And** skeleton placeholders match the layout of actual content

## Tasks / Subtasks

### Task 1: Create ExploreScreen Component (AC: #1, #2)

- [x] Create ExploreScreen component in `src/pages/Explore.tsx`
- [x] Set up main container with vertical scrolling (overflow-y-auto)
- [x] Add route for `/explore` in React Router configuration
- [x] Add Compass icon (Lucide React) to navigation menu
- [x] Set page title to "Explore" using document.title
- [x] Import and configure Tailwind CSS classes for layout

### Task 2: Build Sticky Search Bar (AC: #3)

- [x] Create SearchBar component in `src/components/explore/SearchBar.tsx`
- [x] Implement sticky positioning using `className="sticky top-0 z-10"`
- [x] Add Search icon from Lucide React
- [x] Add input with placeholder "Search experiences..."
- [x] Handle click to navigate to `/search` using React Router
- [x] Style with Tailwind shadow-md and backdrop-blur-sm
- [x] Add white/dark background with proper z-index

### Task 3: Create Section Container Components (AC: #2, #4)

- [x] Create ExploreSectionContainer component in `src/components/explore/SectionContainer.tsx`
- [x] Add section header with title (h2) and "See All" link
- [x] Implement "See All" navigation using React Router Link
- [x] Apply consistent Tailwind spacing (space-y-6, py-4)
- [x] Add aria-label attributes for accessibility
- [x] Support children prop for section content

### Task 4: Build Trending Section Layout (AC: #2)

- [x] Create TrendingSection component in `src/components/explore/TrendingSection.tsx`
- [x] Implement horizontal scrollable container using `overflow-x-auto snap-x`
- [x] Add section header "Trending in Bali"
- [x] Configure for 6-10 experience cards using CSS Grid or Flexbox
- [x] Integrate with TrendingExperienceCard component (from Story 12.2)
- [x] Add smooth scrolling with snap-to-point behavior

### Task 5: Build Hidden Gems Section Layout (AC: #2)

- [x] Create HiddenGemsSection component in `src/components/explore/HiddenGemsSection.tsx`
- [x] Implement horizontal scroll container with snap points
- [x] Add section header "Hidden Gems"
- [x] Configure Tailwind classes: `flex gap-4 overflow-x-auto snap-mandatory`
- [x] Prepare for HiddenGemCard component (from Story 12.3)
- [x] Hide scrollbar using Tailwind `scrollbar-hide` or custom CSS

### Task 6: Build Limited Availability Section Layout (AC: #2)

- [x] Create LimitedAvailabilitySection component in `src/components/explore/LimitedAvailabilitySection.tsx`
- [x] Implement horizontal carousel with urgency indicators
- [x] Add section header "Limited Availability"
- [x] Style with orange/red accent colors for urgency
- [x] Prepare for LimitedAvailabilityCard component (from Story 12.4)
- [x] Add countdown or "Only X left" indicators

### Task 7: Build Destination Guides Grid (AC: #2)

- [x] Create DestinationGuidesSection component in `src/components/explore/DestinationGuidesSection.tsx`
- [x] Implement 2-column grid using `grid grid-cols-2 gap-4`
- [x] Add section header "Destination Guides"
- [x] Make grid responsive: `md:grid-cols-3 lg:grid-cols-4`
- [x] Prepare for DestinationGuideCard component (from Story 12.5)
- [x] Add proper aspect ratios for guide images

### Task 8: Build Traveler Stories List (AC: #2)

- [x] Create TravelerStoriesSection component in `src/components/explore/TravelerStoriesSection.tsx`
- [x] Implement vertical list using `space-y-4` instead of carousel
- [x] Add section header "Stories from Travelers"
- [x] Configure card stacking with proper spacing
- [x] Prepare for TravelerStoryCard component (from Story 12.6)
- [x] Limit initial render to 5 stories with "Load More" button

### Task 9: Implement Pull-to-Refresh (AC: #5)

- [x] Create custom pull-to-refresh hook using pointer events
- [x] Detect pull-down gesture on desktop (mouse) and mobile (touch)
- [x] Create `refreshExploreData` function to refetch all section data
- [x] Show loading spinner indicator during refresh
- [x] Handle refresh errors with toast notifications (Sonner)
- [x] Alternative: Use bobjectser's native pull-to-refresh on mobile web

### Task 10: Create Skeleton Loading States (AC: #6)

- [x] Create ExploreScreenSkeleton component in `src/components/explore/ExploreScreenSkeleton.tsx`
- [x] Build skeleton placeholders for each section using Tailwind
- [x] Use `animate-pulse` class for shimmer effect
- [x] Match skeleton layout dimensions to actual content
- [x] Display skeleton while initial data loads (conditional rendering)
- [x] Add skeleton for search bar, carousels, and grid sections

## Dev Notes

### Screen Structure

```typescript
// src/pages/Explore.tsx
import { useState } from 'react';
import { SearchBar } from '@/components/explore/SearchBar';
import { ExploreSectionContainer } from '@/components/explore/SectionContainer';
import { TrendingSection } from '@/components/explore/TrendingSection';
// ... other imports

export function ExplorePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refetch all section data
    await Promise.all([
      fetchTrending(),
      fetchHiddenGems(),
      fetchLimitedAvailability()
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky search bar */}
      <SearchBar className="sticky top-0 z-10" />

      {/* Scrollable content */}
      <div className="space-y-8 pb-8">
        <ExploreSectionContainer
          title="Trending in Bali"
          onSeeAll={() => navigate('/explore/trending')}
        >
          <TrendingSection />
        </ExploreSectionContainer>

        <ExploreSectionContainer
          title="Hidden Gems"
          onSeeAll={() => navigate('/explore/hidden-gems')}
        >
          <HiddenGemsSection />
        </ExploreSectionContainer>

        <ExploreSectionContainer
          title="Limited Availability"
          onSeeAll={() => navigate('/explore/limited')}
        >
          <LimitedAvailabilitySection />
        </ExploreSectionContainer>

        <ExploreSectionContainer
          title="Destination Guides"
          onSeeAll={() => navigate('/explore/guides')}
        >
          <DestinationGuidesSection />
        </ExploreSectionContainer>

        <ExploreSectionContainer
          title="Stories from Travelers"
          onSeeAll={() => navigate('/explore/stories')}
        >
          <TravelerStoriesSection />
        </ExploreSectionContainer>
      </div>
    </div>
  );
}
```

### Horizontal Carousel Pattern

```typescript
// src/components/explore/HorizontalCarousel.tsx
interface HorizontalCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  cardWidth?: number;
}

export function HorizontalCarousel<T>({ items, renderItem }: HorizontalCarouselProps<T>) {
  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4">
      {items.map((item, index) => (
        <div key={index} className="snap-start flex-shrink-0">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

### Sticky Search Bar

```typescript
// src/components/explore/SearchBar.tsx
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchBar({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div
          onClick={() => navigate('/search')}
          className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search experiences..."
            className="bg-transparent border-none outline-none flex-1 text-gray-700 dark:text-gray-200"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
```

### Performance Considerations

- Use React.lazy() and Suspense for code-splitting section components
- Implement intersection observer for lazy loading sections as user scrolls
- Cache section data using React Query or SWR to avoid unnecessary refetches
- Optimize images with proper sizing, lazy loading, and WebP format
- Use CSS containment for better rendering performance
- Consider virtual scrolling for very long lists

### Responsive Design

```typescript
// Responsive grid example
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {guides.map(guide => <DestinationGuideCard key={guide.id} guide={guide} />)}
</div>

// Responsive card sizing
<div className="w-72 sm:w-80 md:w-96 flex-shrink-0">
  <ExperienceCard />
</div>
```

### Testing Considerations

- Test sticky search bar behavior on scroll (e.g., Cypress, Playwright)
- Verify all "See All" links navigate to correct routes
- Test pull-to-refresh gesture detection on touch devices
- Validate skeleton loading states render correctly
- Test with slow network using Chrome DevTools throttling
- Verify smooth horizontal scrolling on different bobjectsers
- Test keyboard navigation for accessibility
- Validate responsive breakpoints (mobile, KV namespacet, desktop)

## References

- [Source: planning-artifacts/epics/epic-12.md#Epic 12 - Story 12.1]
- [Source: planning-artifacts/prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.2 - Create Trending Experiences Section]
- [Related: Story 12.3 - Create Hidden Gems Section]
- [Related: Story 12.4 - Create Limited Availability Alerts]
- [Related: Story 12.5 - Create Destination Guides Section]
- [Related: Story 12.6 - Create Traveler Stories Section]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**

1. ✅ File paths updated (`app/(tabs)/` → `src/pages/`, `src/components/`)
2. ✅ React Native components → React Web (ScrollView → div, FlatList → CSS)
3. ✅ Navigation updated (tab navigation → React Router)
4. ✅ Sticky positioning (React Native API → CSS sticky)
5. ✅ Pull-to-refresh (RefreshControl → custom hook or bobjectser native)
6. ✅ Horizontal scrolling (FlatList → CSS overflow-x-auto with snap)
7. ✅ Grid layout (numColumns → CSS Grid with Tailwind)
8. ✅ Icons (generic → Lucide React with specific imports)
9. ✅ Responsive design (platform checks → Tailwind breakpoints)
10. ✅ Testing guidance (mobile-specific → cross-bobjectser web testing)

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md`.
