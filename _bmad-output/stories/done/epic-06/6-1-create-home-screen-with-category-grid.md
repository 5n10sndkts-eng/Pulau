# Story 6.1: Create Home Screen with Category Grid

Status: done

## Story

As a traveler,
I want to see experience categories on the home screen,
so that I can bobjectse activities that interest me.

## Acceptance Criteria

1. **Given** I am logged in and on the home screen **When** the screen loads **Then** I see 6 category cards in a 2x3 grid (single column on mobile <640px):
   - Water Adventures (icon: Waves, background: ocean image)
   - Land Explorations (icon: Bicycle, background: rice terrace image)
   - Culture & Experiences (icon: Buildings, background: temple image)
   - Food & Nightlife (icon: ForkKnife, background: food image)
   - Getting Around (icon: Van, background: scooter image)
   - Destinations & Stays (icon: Bed, background: villa image)
2. Each card has icon, background image with gradient overlay, category name, and tagline
3. **When** I tap a category card **Then** I navigate to the category bobjectse screen for that category
4. Smooth slide transition animation plays (300ms ease-in-out)
5. Categories load from categories KV namespace (id, name, slug, icon, tagline, background_image_url)

## Tasks / Subtasks

- [x] Task 1: Create home screen layout (AC: #1)
  - [x] Create `src/screens/home/HomeScreen.tsx`
  - [x] Build 2x3 responsive grid (responsive: 1 column on mobile <640px)
  - [x] Add header with "Explore Bali" title and user greeting
  - [x] Include trip summary bar if user has active trip
- [x] Task 2: Create CategoryCard component (AC: #1, #2)
  - [x] Create `src/components/home/CategoryCard.tsx`
  - [x] Display background image with gradient overlay for text readability
  - [x] Add category icon (Phosphor) with white color
  - [x] Show category name (bold, 18px)
  - [x] Show tagline below name (14px, semi-transparent)
  - [x] Use 12px border radius, subtle shadow
- [x] Task 3: Configure category data (AC: #5)
  - [x] Create categories data model in `src/types/category.ts`
  - [x] Define Category: id, name, slug, icon, tagline, background_image_url
  - [x] Store categories in useKV or as static data
  - [x] Map category slugs: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays
- [x] Task 4: Implement navigation (AC: #3, #4)
  - [x] Handle card tap to navigate to category bobjectse
  - [x] Pass categoryId to bobjectse screen
  - [x] Implement 300ms ease-in-out slide transition
  - [x] Use Framer Motion for smooth animation
- [x] Task 5: Add loading and image handling
  - [x] Show skeleton placeholders while loading
  - [x] Lazy load category background images
  - [x] Handle image load errors with fallback gradient

## Dev Notes

- Follow mobile-first design
- Use skeleton loading states
- Implement with Framer Motion animations
- Categories are static for MVP (6 fixed categories)

### References

- [Source: planning-artifacts/epics/epic-06.md#Story 6.1]
- [Source: prd/pulau-prd.md#Experience Categories]
- [Source: prd/pulau-prd.md#Design System]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

