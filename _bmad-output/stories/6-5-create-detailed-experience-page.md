# Story 6.5: Create Detailed Experience Page

Status: ready-for-dev

## Story

As a traveler,
I want to view comprehensive information about an experience,
so that I can make an informed booking decision.

## Acceptance Criteria

1. **Given** I tapped "See Details" or an experience card from browse **When** the experience detail page loads **Then** I see a full-width image carousel (swipeable, 4-6 images from experience_images ordered by display_order)
2. **And** carousel has dot indicators at bottom
3. **And** floating back button (top left, semi-transparent) and heart/save button (top right)
4. **And** Quick Info Bar displays icons: Duration, Group size, Difficulty, Languages
5. **And** "About This Experience" section shows full description from experiences table
6. **And** page loads experience data by experience_id from experiences table
7. **And** all sections scroll vertically
8. **And** images lazy load as user scrolls
9. **And** parallax effect on hero image as user scrolls (subtle)

## Tasks / Subtasks

- [ ] Task 1: Create experience detail page layout (AC: #6, #7)
  - [ ] Create `src/screens/experience/ExperienceDetailScreen.tsx`
  - [ ] Implement vertical scrolling container
  - [ ] Fetch experience data by experience_id from URL params
  - [ ] Use Supabase query with joins for vendor, reviews, images
  - [ ] Handle loading state with skeleton placeholders
  - [ ] Handle error state (experience not found, network error)
  - [ ] Use SafeAreaView for proper mobile spacing
- [ ] Task 2: Build image carousel (AC: #1, #2)
  - [ ] Create `src/components/experience/ImageCarousel.tsx`
  - [ ] Display full-width swipeable carousel
  - [ ] Load images from experience_images table ordered by display_order
  - [ ] Implement swipe gestures for mobile (left/right)
  - [ ] Add arrow buttons for desktop navigation
  - [ ] Show dot indicators at bottom (active dot highlighted)
  - [ ] Pre-load adjacent images for smooth swiping
  - [ ] Handle missing images with placeholder
- [ ] Task 3: Add floating navigation buttons (AC: #3)
  - [ ] Create floating back button (top left corner)
  - [ ] Create heart/save button (top right corner)
  - [ ] Apply semi-transparent dark background with blur effect
  - [ ] Ensure buttons stay visible over carousel images
  - [ ] Handle back button tap to navigate to previous screen
  - [ ] Implement save/unsave functionality for wishlist
  - [ ] Animate heart icon on tap (scale + color change)
- [ ] Task 4: Create Quick Info Bar (AC: #4)
  - [ ] Create `src/components/experience/QuickInfoBar.tsx`
  - [ ] Display horizontal icon row with labels
  - [ ] Duration: Clock icon + "X hours"
  - [ ] Group size: Users icon + "Up to X people"
  - [ ] Difficulty: Icon + difficulty level (Easy/Moderate/Hard)
  - [ ] Languages: Globe icon + supported languages
  - [ ] Use Phosphor icons with consistent sizing
  - [ ] Apply subtle background and spacing
- [ ] Task 5: Build "About This Experience" section (AC: #5)
  - [ ] Create `src/components/experience/AboutSection.tsx`
  - [ ] Display section header "About This Experience"
  - [ ] Show full description text from experiences.description
  - [ ] Apply proper typography (16px, line-height 1.6)
  - [ ] Support markdown formatting if description includes it
  - [ ] Add "Read more" expansion if text is very long (>500 chars)
  - [ ] Show truncated preview with "Show more" button
- [ ] Task 6: Implement lazy loading for images (AC: #8)
  - [ ] Use Intersection Observer for lazy loading
  - [ ] Load carousel images progressively as user swipes
  - [ ] Lazy load section images as user scrolls down
  - [ ] Show loading shimmer while images load
  - [ ] Implement image caching for better performance
  - [ ] Use responsive images (srcset) for different screen sizes
- [ ] Task 7: Add parallax scroll effect (AC: #9)
  - [ ] Implement parallax on hero carousel as user scrolls
  - [ ] Apply subtle transform (translateY) on scroll
  - [ ] Use requestAnimationFrame for smooth animation
  - [ ] Limit parallax effect to first 300-500px of scroll
  - [ ] Ensure effect doesn't impact performance on low-end devices
  - [ ] Use CSS transforms for GPU acceleration
- [ ] Task 8: Add provider information section
  - [ ] Display vendor business name and logo
  - [ ] Show vendor rating and review count
  - [ ] Add "View Provider" link to vendor profile
  - [ ] Display verification badge if vendor is verified
  - [ ] Show response time and acceptance rate

## Dev Notes

- Follow mobile-first design with responsive breakpoints
- Use skeleton loading states for better perceived performance
- Implement with Framer Motion for smooth animations
- Images should be optimized and compressed for fast loading
- Consider implementing image zoom on tap (future enhancement)
- Cache experience details to avoid refetching on back navigation
- Use React Query for data fetching and caching

### Technical Guidance

- Use Supabase query with select joins to fetch all related data in one call
- Implement image preloading for first 3 carousel images
- Use CSS will-change property for parallax elements
- Consider using react-spring for parallax animations
- Implement virtual scrolling for very long pages (optional)
- Add structured data (JSON-LD) for SEO optimization
- Track page views and time spent for analytics

### Database Queries

- Main query: SELECT * FROM experiences WHERE id = ? AND status = 'active'
- Join vendors: INNER JOIN vendors ON experiences.vendor_id = vendors.id
- Join images: LEFT JOIN experience_images ON experiences.id = experience_images.experience_id ORDER BY display_order
- Join reviews: LEFT JOIN reviews ON experiences.id = reviews.experience_id for rating calculation

### References

- [Source: epics.md#Story 6.5]
- [Source: prd/pulau-prd.md#Experience Discovery]
- [Source: prd/pulau-prd.md#Design System]
- [Database: experiences table schema]
- [Database: experience_images table schema]
- [Database: vendors table schema]
- [Related: Story 6.2 - Category Browse Screen]
- [Related: Story 6.6 - What's Included Section]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
