# Story 6.5: Create Detailed Experience Page

Status: ready-for-dev

## Story

As a traveler,
I want to view comprehensive information about an experience,
so that I can make an informed booking decision.

## Acceptance Criteria

1. **Given** I tapped "See Details" or an experience card from browse **When** the experience detail page loads **Then** I see a full-width image carousel (swipeable, 4-6 images from experience.images array ordered by displayOrder)
2. **And** carousel has dot indicators at bottom
3. **And** floating back button (top left, semi-transparent using Tailwind backdrop-blur) and heart/save button (top right, Lucide React Heart icon)
4. **And** Quick Info Bar displays icons using Lucide React: Clock (Duration), Users (Group size), Activity (Difficulty), Globe (Languages)
5. **And** "About This Experience" section shows full description from experience object
6. **And** page loads experience data by experienceId from KV store at key `experience:{experienceId}`
7. **And** all sections scroll vertically in main container
8. **And** images lazy load using `loading="lazy"` attribute
9. **And** parallax effect on hero image using CSS transform (translateY) as user scrolls (subtle)

## Tasks / Subtasks

- [ ] Task 1: Create experience detail page layout (AC: #6, #7)
  - [ ] Create `src/pages/ExperienceDetail.tsx`
  - [ ] Implement vertical scrolling container using `overflow-y-auto`
  - [ ] Fetch experience data by experienceId from URL params
  - [ ] Query KV store at key `experience:{experienceId}` with all nested data
  - [ ] Handle loading state with skeleton placeholders
  - [ ] Handle error state (experience not found, network error)
  - [ ] Use semantic HTML structure for accessibility
- [ ] Task 2: Build image carousel (AC: #1, #2)
  - [ ] Create `src/components/experience/ImageCarousel.tsx`
  - [ ] Display full-width swipeable carousel
  - [ ] Load images from experience.images array ordered by displayOrder
  - [ ] Implement swipe gestures using touch events or library (embla-carousel or swiper)
  - [ ] Add arrow buttons for desktop navigation (ChevronLeft, ChevronRight icons)
  - [ ] Show dot indicators at bottom (active dot highlighted with Tailwind)
  - [ ] Pre-load adjacent images for smooth swiping
  - [ ] Handle missing images with placeholder image
- [ ] Task 3: Add floating navigation buttons (AC: #3)
  - [ ] Create floating back button using React Router (top left corner)
  - [ ] Create heart/save button using Lucide React Heart icon (top right corner)
  - [ ] Apply semi-transparent dark background with Tailwind `bg-black/50 backdrop-blur-sm`
  - [ ] Ensure buttons stay visible over carousel images with `fixed` or `absolute` positioning
  - [ ] Handle back button click to navigate using `navigate(-1)`
  - [ ] Implement save/unsave functionality updating KV store wishlist
  - [ ] Animate heart icon on click using Tailwind `transition-transform scale-110`
- [ ] Task 4: Create Quick Info Bar (AC: #4)
  - [ ] Create `src/components/experience/QuickInfoBar.tsx`
  - [ ] Display horizontal icon row with labels using flexbox
  - [ ] Duration: Clock icon (Lucide React) + "X hours"
  - [ ] Group size: Users icon + "Up to X people"
  - [ ] Difficulty: Activity icon + difficulty level (Easy/Moderate/Hard)
  - [ ] Languages: Globe icon + supported languages
  - [ ] Use Lucide React icons with consistent sizing (20px)
  - [ ] Apply subtle background and spacing with Tailwind
- [ ] Task 5: Build "About This Experience" section (AC: #5)
  - [ ] Create `src/components/experience/AboutSection.tsx`
  - [ ] Display section header "About This Experience" with semantic heading
  - [ ] Show full description text from experience.description
  - [ ] Apply proper typography using Tailwind (text-base, leading-relaxed)
  - [ ] Support markdown formatting using react-markdown if description includes it
  - [ ] Add "Read more" expansion if text is very long (>500 chars)
  - [ ] Show truncated preview with "Show more" button using state toggle
- [ ] Task 6: Implement lazy loading for images (AC: #8)
  - [ ] Use native `loading="lazy"` attribute on img elements
  - [ ] Use Intersection Observer for additional control if needed
  - [ ] Load carousel images progressively as user swipes
  - [ ] Lazy load section images as user scrolls down
  - [ ] Show loading shimmer using Tailwind `animate-pulse` while images load
  - [ ] Implement browser caching with proper cache headers
  - [ ] Use responsive images (srcset) for different screen sizes if needed
- [ ] Task 7: Add parallax scroll effect (AC: #9)
  - [ ] Implement parallax on hero carousel using scroll event listener
  - [ ] Apply subtle transform using CSS `transform: translateY()` on scroll
  - [ ] Use throttled scroll handler for better performance
  - [ ] Limit parallax effect to first 300-500px of scroll
  - [ ] Ensure effect doesn't impact performance on low-end devices
  - [ ] Use CSS `will-change: transform` for GPU acceleration
- [ ] Task 8: Add provider information section
  - [ ] Display vendor businessName and logo from nested vendor object
  - [ ] Show vendor rating and review count calculated from reviews array
  - [ ] Add "View Provider" Link to vendor profile page
  - [ ] Display verification badge (Lucide React BadgeCheck) if vendor.isVerified
  - [ ] Show response time and acceptance rate from vendor object

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

- [Source: epics.md#Story 6.5]
- [Source: planning-artifacts/prd/pulau-prd.md#Experience Discovery]
- [Source: planning-artifacts/prd/pulau-prd.md#Design System]
- [Architecture: ADR-002 - KV Store Data Layer]
- [Related: Story 6.2 - Category Browse Screen]
- [Related: Story 6.6 - What's Included Section]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths: `src/screens/experience/ExperienceDetailScreen.tsx` → `src/pages/ExperienceDetail.tsx`
2. ✅ Data layer: Supabase queries with SQL joins → KV store single key lookup with nested data
3. ✅ Components: React Native SafeAreaView → Semantic HTML with Tailwind
4. ✅ Icons: Phosphor icons → Lucide React icons (Heart, Clock, Users, Activity, Globe, BadgeCheck, ChevronLeft, ChevronRight)
5. ✅ Navigation: Generic navigation → React Router with `navigate()` and `Link`
6. ✅ Styling: React Native styles → Tailwind CSS with backdrop-blur
7. ✅ Animations: Framer Motion/react-spring → CSS transitions and transforms
8. ✅ Database tables: Separate tables with joins → Nested objects in single KV entry
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

### Debug Log References

### Completion Notes List

### File List
