# Story 12.4: Create Limited Availability Alerts

Status: done

## Story

As a traveler,
I want to see experiences with limited spots,
So that I can book before they sell out.

## Acceptance Criteria

### AC 1: Section Display
**Given** I am on the Explore screen
**When** "Limited Availability" section loads
**Then** I see experiences with low remaining slots
**And** the section creates urgency

### AC 2: Limited Availability Criteria
**Given** experiences are being filtered for limited availability
**When** the selection algorithm runs
**Then** limited = experience_availability.slots_available <= 5 for next 7 days
**And** only experiences meeting criteria are shown

### AC 3: Card Content Display
**Given** limited availability cards are displayed
**When** I view a card
**Then** cards display: image, title, "Only X spots left!" badge (red/coral), date, price
**And** the urgency is visually communicated

### AC 4: Urgency Styling
**Given** a limited availability card is rendered
**When** the card styling is applied
**Then** urgency styling includes: coral border, pulsing badge animation
**And** the visual design creates FOMO (fear of missing out)

### AC 5: Dynamic Availability Updates
**Given** availability data changes over time
**When** availability updates (spots fill)
**Then** section content refreshes on next load
**And** fully booked experiences move to "Sold Out" state

### AC 6: Sold Out State
**Given** an experience becomes fully booked
**When** slots_available reaches 0
**Then** the experience shows "Sold Out" state
**And** is removed from limited availability section or marked as unavailable

## Tasks / Subtasks

### Task 1: Create Limited Availability Query (AC: #2)
- [x] Create `useLimitedAvailability` hook in `src/hooks/useLimitedAvailability.ts`
- [x] Query KV store for experiences with low availability (slots_available <= 5)
- [x] Filter experiences with dates between today and today+7 days
- [x] Sort by slots_available ascending (most urgent first)
- [x] Limit to 8-10 experiences
- [x] Cache data for 5 minutes using React Query or SWR
- [x] Add TypeScript interface for `LimitedAvailabilityExperience`

### Task 2: Build LimitedAvailabilityCard Component (AC: #3, #4)
- [x] Create `LimitedAvailabilityCard` component in `src/components/explore/LimitedAvailabilityCard.tsx`
- [x] Display experience image with proper aspect ratio
- [x] Add "Only X spots left!" badge with Tailwind: `bg-red-500 text-white`
- [x] Show specific date using date-fns formatting
- [x] Display price prominently with currency formatting
- [x] Apply coral border: `border-2 border-red-500 dark:border-red-400`
- [x] Set card dimensions with Tailwind: `w-56 h-72 md:w-64 md:h-80`

### Task 3: Implement Urgency Badge with Animation (AC: #4)
- [x] Create `UrgencyBadge` component in `src/components/explore/UrgencyBadge.tsx`
- [x] Add pulsing animation using Tailwind: `animate-pulse` or custom CSS keyframes
- [x] Display "Only X spots left!" text dynamically
- [x] Use Tailwind classes: `bg-red-500 text-white px-3 py-1 rounded-full`
- [x] Add AlertCircle icon from Lucide React
- [x] Ensure animation is smooth at 60fps

### Task 4: Add Urgency Visual Styling (AC: #4)
- [x] Apply red/coral border to card container
- [x] Add Tailwind shadow: `shadow-red-500/50 shadow-lg`
- [x] Use urgent color palette with dark mode support
- [x] Consider adding countdown timer component if date is within 24 hours
- [x] Ensure WCAG AA contrast for text on red background
- [x] Add aria-live="polite" for screen reader urgency announcements

### Task 5: Implement Real-Time Updates (AC: #5, #6)
- [x] Create `useAvailabilityUpdates` hook to poll KV store every 5 minutes
- [x] Update card data when slots_available changes in KV store
- [x] Remove experiences from carousel when slots_available reaches 0
- [x] Show "Sold Out" overlay with semi-transparent background if booked
- [x] Add toast notification using Sonner: "This experience just sold out!"
- [x] Implement optimistic updates for better UX

### Task 6: Build Horizontal Carousel (AC: #1)
- [x] Implement horizontal scroll container with Tailwind: `flex gap-4 overflow-x-auto snap-x snap-mandatory`
- [x] Configure snap-to-point: `snap-start` on each card
- [x] Add proper spacing: `px-4 md:px-6` for container padding
- [x] Hide scrollbar: `scrollbar-hide` or custom CSS
- [x] Ensure smooth scrolling with `scroll-smooth`
- [x] Add left/right navigation buttons for desktop (optional)

### Task 7: Handle Empty and Sold Out States (AC: #6)
- [x] Create skeleton loader using Tailwind `animate-pulse` and gray rectangles
- [x] Handle empty state with friendly message: "All experiences have plenty of availability!"
- [x] Show "Sold Out" badge with `bg-gray-500` when slots_available = 0
- [x] Add error boundary for failed KV store queries
- [x] Display informative error messages with retry button
- [x] Use Lucide React icons: CheckCircle for empty, XCircle for errors

## Dev Notes

### Limited Availability Hook
```typescript
// src/hooks/useLimitedAvailability.ts
import { useKV } from '@github-spark/app';
import { useQuery } from '@tanstack/react-query';
import type { Experience } from '@/lib/types';

interface LimitedAvailabilityExperience extends Experience {
  slotsAvailable: number;
  availabilityDate: string;
}

export function useLimitedAvailability() {
  const kv = useKV();
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return useQuery({
    queryKey: ['limited-availability', today],
    queryFn: async () => {
      // Query KV store for experiences with low availability
      const experiences = await kv.get<LimitedAvailabilityExperience[]>('experiences:limited');
      
      // Filter and sort
      const filtered = experiences
        ?.filter(exp => 
          exp.slotsAvailable <= 5 &&
          exp.slotsAvailable > 0 &&
          exp.availabilityDate >= today &&
          exp.availabilityDate <= sevenDaysLater
        )
        .sort((a, b) => a.slotsAvailable - b.slotsAvailable)
        .slice(0, 10);

      return filtered ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - short cache for urgency
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
}
```

### Pulsing Badge Animation
```typescript
// src/components/explore/UrgencyBadge.tsx
import { AlertCircle } from 'lucide-react';

interface UrgencyBadgeProps {
  spotsLeft: number;
}

export function UrgencyBadge({ spotsLeft }: UrgencyBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full animate-pulse">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm font-semibold">
        Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!
      </span>
    </div>
  );
}
```

### Card Component
```typescript
// src/components/explore/LimitedAvailabilityCard.tsx
import { format } from 'date-fns';
import { UrgencyBadge } from './UrgencyBadge';

interface LimitedAvailabilityCardProps {
  experience: LimitedAvailabilityExperience;
}

export function LimitedAvailabilityCard({ experience }: LimitedAvailabilityCardProps) {
  return (
    <div className="w-56 h-72 md:w-64 md:h-80 rounded-lg border-2 border-red-500 dark:border-red-400 shadow-lg shadow-red-500/50 overflow-hidden snap-start flex-shrink-0 hover:scale-105 transition-transform">
      {/* Image */}
      <div className="relative h-40">
        <img 
          src={experience.imageUrl} 
          alt={experience.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <UrgencyBadge spotsLeft={experience.slotsAvailable} />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
          {experience.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(experience.availabilityDate), 'MMM dd, yyyy')}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          ${experience.price}
        </p>
      </div>
    </div>
  );
}
```

### Real-Time Updates Hook
```typescript
// src/hooks/useAvailabilityUpdates.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKV } from '@github-spark/app';
import { toast } from 'sonner';

export function useAvailabilityUpdates() {
  const kv = useKV();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Poll KV store for updates every 5 minutes
    const interval = setInterval(async () => {
      const updated = await kv.get('experiences:limited:updated');
      if (updated) {
        queryClient.invalidateQueries(['limited-availability']);
        
        // Check for sold out experiences
        const soldOut = await kv.get<string[]>('experiences:sold-out');
        if (soldOut && soldOut.length > 0) {
          toast.error('An experience just sold out!');
        }
      }
    }, 1000 * 60 * 5); // 5 minutes

    return () => clearInterval(interval);
  }, [kv, queryClient]);
}
```

### Horizontal Carousel Container
```typescript
// Usage in parent component
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-6 scroll-smooth">
  {limitedExperiences.map(exp => (
    <LimitedAvailabilityCard key={exp.id} experience={exp} />
  ))}
</div>
```

### Custom CSS for Scrollbar Hide
```css
/* src/styles/globals.css */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Testing Considerations
- Test with 0, 3, and 10+ limited experiences
- Verify urgency styling meets WCAG contrast requirements
- Test pulsing animation performance (60fps target)
- Validate real-time updates when availability changes in KV store
- Test "Sold Out" state transitions
- Ensure keyboard navigation works for carousel
- Test on mobile touch scrolling vs desktop mouse scroll
- Verify dark mode color contrast for red badges

### Analytics Events
```typescript
// Track user interactions
analytics.track('limited_availability_section_viewed', {
  experience_count: limitedExperiences.length,
  min_slots: Math.min(...limitedExperiences.map(e => e.slotsAvailable))
});

analytics.track('limited_availability_card_clicked', {
  experience_id: experience.id,
  slots_remaining: experience.slotsAvailable,
  urgency_level: experience.slotsAvailable <= 2 ? 'critical' : 'moderate'
});
```

## References

- [Source: planning-artifacts/epics/epic-12.md#Epic 12 - Story 12.4]
- [Source: planning-artifacts/prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]

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
1. ✅ Supabase queries → KV store patterns with useKV hook
2. ✅ Database KV namespace references → KV key patterns
3. ✅ React Native animations → CSS animations with Tailwind
4. ✅ Reanimated API → CSS animate-pulse and transitions
5. ✅ FlatList → CSS horizontal scroll with snap points
6. ✅ StyleSheet → Tailwind CSS classes
7. ✅ Real-time subscriptions → Polling with intervals
8. ✅ File paths updated to src/ structure
9. ✅ Added Lucide React icons (AlertCircle)
10. ✅ Added TypeScript interfaces and types
11. ✅ Updated PRD reference path
12. ✅ Added date-fns for date formatting
13. ✅ Added Sonner for toast notifications
14. ✅ Added accessibility considerations (WCAG, aria-live)

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md`.
