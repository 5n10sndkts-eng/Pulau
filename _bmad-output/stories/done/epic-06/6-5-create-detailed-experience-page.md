# Story 6.5: Create Detailed Experience Page

Status: done

## Story

As a traveler,
I want to view comprehensive information about an experience,
so that I can make an informed booking decision.

## Acceptance Criteria

1. **Given** I tapped "See Details" or an experience card from bobjectse **When** the experience detail page loads **Then** I see a full-width image carousel (swipeable, 4-6 images from experience.images array ordered by displayOrder)
2. **And** carousel has dot indicators at bottom
3. **And** floating back button (top left, semi-transparent using Tailwind backdrop-blur) and heart/save button (top right, Lucide React Heart icon)
4. **And** Quick Info Bar displays icons using Lucide React: Clock (Duration), Users (Group size), Activity (Difficulty), Globe (Languages)
5. **And** "About This Experience" section shows full description from experience object
6. **And** page loads experience data by experienceId from KV store at key `experience:{experienceId}`
7. **And** all sections scroll vertically in main container
8. **And** images lazy load using `loading="lazy"` attribute
9. **And** parallax effect on hero image using CSS transform (translateY) as user scrolls (subtle)

## Tasks / Subtasks

- [x] Task 1: Create experience detail page layout (AC: #6, #7)
  - [x] Create `src/pages/ExperienceDetail.tsx`
  - [x] Implement vertical scrolling container using `overflow-y-auto`
  - [x] Fetch experience data by experienceId from URL params
  - [x] Query KV store at key `experience:{experienceId}` with all nested data
  - [x] Handle loading state with skeleton placeholders
  - [x] Handle error state (experience not found, network error)
  - [x] Use semantic HTML structure for accessibility
- [x] Task 2: Build image carousel (AC: #1, #2)
  - [x] Create `src/components/experience/ImageCarousel.tsx`
  - [x] Display full-width swipeable carousel
  - [x] Load images from experience.images array ordered by displayOrder
  - [x] Implement swipe gestures using touch events or library (embla-carousel or swiper)
  - [x] Add arobject buttons for desktop navigation (ChevronLeft, ChevronRight icons)
  - [x] Show dot indicators at bottom (active dot highlighted with Tailwind)
  - [x] Pre-load adjacent images for smooth swiping
  - [x] Handle missing images with placeholder image
- [x] Task 3: Add floating navigation buttons (AC: #3)
  - [x] Create floating back button using React Router (top left corner)
  - [x] Create heart/save button using Lucide React Heart icon (top right corner)
  - [x] Apply semi-transparent dark background with Tailwind `bg-black/50 backdrop-blur-sm`
  - [x] Ensure buttons stay visible over carousel images with `fixed` or `absolute` positioning
  - [x] Handle back button click to navigate using `navigate(-1)`
  - [x] Implement save/unsave functionality updating KV store wishlist
  - [x] Animate heart icon on click using Tailwind `transition-transform scale-110`
- [x] Task 4: Create Quick Info Bar (AC: #4)
  - [x] Create `src/components/experience/QuickInfoBar.tsx`
  - [x] Display horizontal icon object with labels using flexbox
  - [x] Duration: Clock icon (Lucide React) + "X hours"
  - [x] Group size: Users icon + "Up to X people"
  - [x] Difficulty: Activity icon + difficulty level (Easy/Moderate/Hard)
  - [x] Languages: Globe icon + supported languages
  - [x] Use Lucide React icons with consistent sizing (20px)
  - [x] Apply subtle background and spacing with Tailwind
- [x] Task 5: Build "About This Experience" section (AC: #5)
  - [x] Create `src/components/experience/AboutSection.tsx`
  - [x] Display section header "About This Experience" with semantic heading
  - [x] Show full description text from experience.description
  - [x] Apply proper typography using Tailwind (text-base, leading-relaxed)
  - [x] Support markdown formatting using react-markdown if description includes it
  - [x] Add "Read more" expansion if text is very long (>500 chars)
  - [x] Show truncated preview with "Show more" button using state toggle
- [x] Task 6: Implement lazy loading for images (AC: #8)
  - [x] Use native `loading="lazy"` attribute on img elements
  - [x] Use Intersection Observer for additional control if needed
  - [x] Load carousel images progressively as user swipes
  - [x] Lazy load section images as user scrolls down
  - [x] Show loading shimmer using Tailwind `animate-pulse` while images load
  - [x] Implement bobjectser caching with proper cache headers
  - [x] Use responsive images (srcset) for different screen sizes if needed
- [x] Task 7: Add parallax scroll effect (AC: #9)
  - [x] Implement parallax on hero carousel using scroll event listener
  - [x] Apply subtle transform using CSS `transform: translateY()` on scroll
  - [x] Use throttled scroll handler for better performance
  - [x] Limit parallax effect to first 300-500px of scroll
  - [x] Ensure effect doesn't impact performance on low-end devices
  - [x] Use CSS `will-change: transform` for GPU acceleration
- [x] Task 8: Add provider information section
  - [x] Display vendor businessName and logo from nested vendor object
  - [x] Show vendor rating and review count calculated from reviews array
  - [x] Add "View Provider" Link to vendor profile page
  - [x] Display verification badge (Lucide React BadgeCheck) if vendor.isVerified
  - [x] Show response time and acceptance rate from vendor object

## Dev Notes

- Follow mobile-first design with responsive breakpoints
- Use skeleton loading states for better perceived performance
- Use CSS transitions for smooth animations
- Images should be optimized and compressed for fast loading
- Consider implementing image zoom modal on click (future enhancement)
- Cache experience details with TanStack Query to avoid refetching on back navigation
- Use TanStack Query for data fetching and automatic caching

### Technical Guidance

- Fetch all related data in one KV store call (nested objects for vendor, reviews, images)
- Implement image preloading for first 3 carousel images
- Use CSS `will-change: transform` property for parallax elements
- Consider using CSS-only parallax with `background-attachment: fixed` (alternative)
- Implement scroll restoration when navigating back
- Add structured data (JSON-LD) for SEO optimization (future)
- Track page views and time spent for analytics in KV store

### Database Queries

- Main query: KV store key `experience:{experienceId}` returns full experience object with:
  - Nested vendor object (id, businessName, logo, rating, isVerified, etc.)
  - Nested images array (ordered by displayOrder)
  - Nested reviews array (for rating calculation)
  - All experience fields (title, description, duration, maxGroupSize, etc.)

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.5]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.2 - Category Bobjectse Screen]
- [Related: Story 6.6 - What's Included Section]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths: `src/screens/experience/ExperienceDetailScreen.tsx` → `src/pages/ExperienceDetail.tsx`
2. ✅ Data layer: Supabase queries with KV joins → KV store single key lookup with nested data
3. ✅ Components: React Native SafeAreaView → Semantic HTML with Tailwind
4. ✅ Icons: Phosphor icons → Lucide React icons (Heart, Clock, Users, Activity, Globe, BadgeCheck, ChevronLeft, ChevronRight)
5. ✅ Navigation: Generic navigation → React Router with `navigate()` and `Link`
6. ✅ Styling: React Native styles → Tailwind CSS with backdrop-blur
7. ✅ Animations: Framer Motion/react-spring → CSS transitions and transforms
8. ✅ Database KV namespaces: Separate KV namespaces with joins → Nested objects in single KV entry
9. ✅ Column names: snake_case → camelCase (display_order → displayOrder, business_name → businessName)
10. ✅ Image loading: Complex lazy load → Native `loading="lazy"` attribute
11. ✅ Carousel: Custom implementation → Recommendation to use embla-carousel or swiper library
12. ✅ PRD reference path: `prd/pulau-prd.md` → `planning-artifacts/prd/pulau-prd.md`
13. ✅ Added TypeScript interface references
14. ✅ Added accessibility considerations

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

