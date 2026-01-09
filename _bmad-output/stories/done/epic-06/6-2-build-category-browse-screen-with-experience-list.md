# Story 6.2: Build Category Bobjectse Screen with Experience List

Status: done

## Story

As a traveler,
I want to bobjectse all experiences in a category,
so that I can see what's available.

## Acceptance Criteria

1. **Given** I tapped a category from Story 6.1 **When** the category bobjectse screen loads **Then** header shows: back arobject (using React Router), category title (e.g., "Water Adventures"), search icon (Lucide React)
2. **And** experiences load from KV store with key pattern `experiences:category:{categoryId}` filtered by status = "active"
3. **And** each experience card displays:
   - Hero image (16:9 ratio, rounded corners 12px using Tailwind)
   - Provider badge overlay (vendor business_name)
   - Experience title below image
   - Quick stats: Duration icon + hours, Group size icon + max people, Star icon + rating (avg) using Lucide React icons
   - Price: "From $XX / person" (formatted with Intl.NumberFormat)
   - Two buttons: "+ Quick Add" (primary teal button), "See Details" (text link)
4. **And** cards are in vertical scrolling div with `overflow-y-auto`
5. **And** list shows skeleton loading state while fetching
6. **And** infinite scroll loads more experiences as I scroll down (20 per page)

## Tasks / Subtasks

- [x] Task 1: Create category bobjectse page layout (AC: #1, #4)
  - [x] Create `src/pages/CategoryBobjectse.tsx`
  - [x] Build header with back arobject (React Router Link), dynamic category title, search icon (Lucide React Search)
  - [x] Implement vertical scrolling container using `<div className="overflow-y-auto">`
  - [x] Add sticky header using Tailwind `sticky top-0`
  - [x] Use semantic HTML with proper ARIA labels for accessibility
- [x] Task 2: Create ExperienceCard component (AC: #3)
  - [x] Create `src/components/bobjectse/ExperienceCard.tsx`
  - [x] Display hero image with 16:9 aspect ratio using Tailwind `aspect-video`, 12px rounded corners `rounded-xl`
  - [x] Add provider badge overlay using absolute positioning with `bg-black/60` backdrop
  - [x] Show experience title (bold, text-lg, 2-line max with `line-clamp-2`)
  - [x] Create quick stats object with Lucide React icons: Clock (duration), Users (group size), Star (rating)
  - [x] Format price as "From $XX / person" using `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
  - [x] Add "+ Quick Add" button with Tailwind `bg-teal-600 hover:bg-teal-700`
  - [x] Add "See Details" Link component with `text-teal-600 hover:underline`
  - [x] Apply card shadow `shadow-lg` and hover state with `hover:shadow-xl transition-shadow`
- [x] Task 3: Implement data fetching (AC: #2, #6)
  - [x] Create `src/hooks/useExperiences.ts` hook using TanStack Query
  - [x] Fetch experiences from KV store with key `experiences:category:{categoryId}:page:{page}`
  - [x] Filter by categoryId and status = "active" on client side
  - [x] Include vendor businessName from nested vendor object in experience data
  - [x] Calculate average rating from reviews array in experience object
  - [x] Implement pagination (20 experiences per page)
  - [x] Use offset-based pagination for loading more results
  - [x] Handle loading, error, and empty states with proper TypeScript types
- [x] Task 4: Add infinite scroll (AC: #6)
  - [x] Detect when user scrolls near bottom using IntersectionObserver API
  - [x] Automatically load next page of experiences
  - [x] Show loading spinner at bottom while fetching more (Lucide React Loader2 with spin animation)
  - [x] Prevent duplicate requests using TanStack Query's `isFetching` state
  - [x] Handle end of list (no more experiences to load) with "No more experiences" message
- [x] Task 5: Implement skeleton loading state (AC: #5)
  - [x] Create `src/components/bobjectse/ExperienceCardSkeleton.tsx`
  - [x] Show 3-5 skeleton cards while initial data loads
  - [x] Animate skeleton with shimmer effect using Tailwind `animate-pulse`
  - [x] Use same dimensions as actual experience cards
- [x] Task 6: Add Quick Add functionality (AC: #3)
  - [x] Handle "+ Quick Add" button click event
  - [x] Add experience to KV store itinerary at key `user:trip:itinerary:{userId}`
  - [x] Show success toast notification using Radix UI Toast
  - [x] Update button to "Added" with checkmark icon (Lucide React Check)
  - [x] Disable button after adding with `disabled` attribute and reduced opacity
- [x] Task 7: Implement navigation (AC: #3)
  - [x] Handle "See Details" click to navigate using `navigate(\`/experience/\${experienceId}\`)`
  - [x] Pass experienceId via URL parameter
  - [x] Use React Router's navigation for smooth transitions
  - [x] Handle back navigation to return to bobjectse screen preserving scroll position

## Dev Notes

### TypeScript Interfaces
```typescript
interface Experience {
  id: string;
  title: string;
  categoryId: string;
  status: 'active' | 'inactive';
  heroImageUrl: string;
  vendor: {
    id: string;
    businessName: string;
  };
  duration: number; // hours
  maxGroupSize: number;
  pricePerPerson: number;
  currency: string;
  reviews: Review[];
  createdAt: string;
}

interface Review {
  id: string;
  rating: number; // 1-5
  comment: string;
}
```

### Data Fetching Hook
```typescript
import { useKV } from '@/hooks/useKV';
import { useInfiniteQuery } from '@tanstack/react-query';

const useExperiences = (categoryId: string) => {
  const kv = useKV();

  return useInfiniteQuery({
    queryKey: ['experiences', 'category', categoryId],
    queryFn: async ({ pageParam = 0 }) => {
      const allExperiences = await kv.get<Experience[]>(
        `experiences:category:${categoryId}`
      );
      
      const activeExperiences = allExperiences?.filter(
        exp => exp.status === 'active'
      ) || [];

      const start = pageParam * 20;
      const end = start + 20;
      const page = activeExperiences.slice(start, end);

      return {
        experiences: page,
        nextCursor: end < activeExperiences.length ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
};
```

### ExperienceCard Component
```typescript
import { Clock, Users, Star, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface ExperienceCardProps {
  experience: Experience;
  onQuickAdd: (experienceId: string) => void;
}

const ExperienceCard = ({ experience, onQuickAdd }: ExperienceCardProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const averageRating = experience.reviews.length > 0
    ? experience.reviews.reduce((sum, r) => sum + r.rating, 0) / experience.reviews.length
    : 0;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: experience.currency || 'USD',
    minimumFractionDigits: 0,
  }).format(experience.pricePerPerson);

  const handleQuickAdd = () => {
    onQuickAdd(experience.id);
    setIsAdded(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      {/* Hero Image */}
      <div className="relative aspect-video">
        <img
          src={experience.heroImageUrl}
          alt={experience.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {experience.vendor.businessName}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-2 mb-3 text-gray-900 dark:text-white">
          {experience.title}
        </h3>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{experience.duration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{experience.maxGroupSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span>{averageRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          From {formattedPrice} / person
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleQuickAdd}
            disabled={isAdded}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isAdded ? <Check size={18} /> : <Plus size={18} />}
            {isAdded ? 'Added' : 'Quick Add'}
          </button>
          <Link
            to={`/experience/${experience.id}`}
            className="flex-1 text-center text-teal-600 dark:text-teal-400 hover:underline px-4 py-2 rounded-lg border border-teal-600 dark:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
          >
            See Details
          </Link>
        </div>
      </div>
    </div>
  );
};
```

### Infinite Scroll Implementation
```typescript
import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const CategoryBobjectse = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
    useExperiences(categoryId);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="overflow-y-auto h-screen">
      {/* Experience cards */}
      {data?.pages.map((page, i) => (
        <div key={i} className="space-y-4">
          {page.experiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} onQuickAdd={handleQuickAdd} />
          ))}
        </div>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="animate-spin text-teal-600" size={32} />
        )}
        {!hasNextPage && data && (
          <p className="text-gray-600 dark:text-gray-400">No more experiences</p>
        )}
      </div>
    </div>
  );
};
```

### Skeleton Component
```typescript
const ExperienceCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-300 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="flex gap-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32" />
      <div className="flex gap-3">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1" />
      </div>
    </div>
  </div>
);
```

### Technical Guidance

- Follow mobile-first design with responsive breakpoints (use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`)
- Use skeleton loading states for better perceived performance
- Experience cards should have subtle hover animations using Tailwind transitions
- Images should lazy load with `loading="lazy"` attribute
- Optimize image loading with responsive images (consider using srcset if needed)
- Cache fetched experiences with TanStack Query automatic caching
- Handle network errors gracefully with error boundaries and retry options
- Store scroll position in sessionStorage to restore when navigating back
- Use IntersectionObserver for efficient infinite scroll (no scroll event listeners)
- Implement proper ARIA labels for accessibility (card landmarks, button labels)
- Support keyboard navigation (tab through cards, enter to select)

### Testing Considerations
- Test with empty category (no experiences)
- Test with single experience
- Test with 100+ experiences (infinite scroll)
- Test Quick Add button state changes
- Test navigation to detail page
- Test back navigation preserving scroll position
- Verify skeleton loading state displays correctly
- Test dark mode styling
- Test responsive layout on mobile, KV namespacet, desktop
- Verify accessibility (keyboard navigation, screen readers)

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.2]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.1 - Category Selection]
- [Related: Story 6.5 - Detailed Experience Page]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths: `src/screens/bobjectse/CategoryBobjectseScreen.tsx` → `src/pages/CategoryBobjectse.tsx`
2. ✅ Data layer: Supabase KV namespace queries → KV store with key pattern `experiences:category:{categoryId}`
3. ✅ Components: React Native SafeAreaView/ScrollView → HTML semantic elements with Tailwind
4. ✅ Icons: Phosphor icons → Lucide React icons (Clock, Users, Star, Plus, Check, Loader2, Search)
5. ✅ Styling: React Native styles → Tailwind CSS with dark mode support
6. ✅ Navigation: Generic navigation → React Router with `navigate()` and `Link`
7. ✅ Animations: Framer Motion → CSS transitions with Tailwind
8. ✅ Data fetching: Direct Supabase queries → TanStack Query with KV store
9. ✅ Pagination: Cursor-based → Offset-based with `useInfiniteQuery`
10. ✅ Joins: KV joins → Nested objects in KV store data
11. ✅ Aggregations: KV avg() → Client-side JavaScript calculations
12. ✅ Scroll detection: Generic scroll handler → IntersectionObserver API
13. ✅ Toast notifications: Generic toast → Radix UI Toast
14. ✅ Currency formatting: Custom formatter → `Intl.NumberFormat`
15. ✅ PRD reference path: `prd/pulau-prd.md` → `planning-artifacts/prd/pulau-prd.md`
16. ✅ Added TypeScript interfaces for type safety
17. ✅ Added accessibility considerations (ARIA labels, keyboard navigation)
18. ✅ Added complete code examples for all components

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

