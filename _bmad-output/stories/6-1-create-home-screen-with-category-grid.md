# Story 6.1: Create Home Screen with Category Grid

Status: ready-for-dev

## Story

As a traveler,
I want to see experience categories on the home screen,
so that I can browse activities that interest me.

## Acceptance Criteria

1. **Given** I am logged in and on the home screen **When** the screen loads **Then** I see 6 category cards in a 2x3 grid (single column on mobile <640px):
   - Water Adventures (icon: Waves, background: ocean image)
   - Land Explorations (icon: Bicycle, background: rice terrace image)
   - Culture & Experiences (icon: Buildings, background: temple image)
   - Food & Nightlife (icon: ForkKnife, background: food image)
   - Getting Around (icon: Van, background: scooter image)
   - Destinations & Stays (icon: Bed, background: villa image)
2. Each card has icon, background image with gradient overlay, category name, and tagline
3. **When** I tap a category card **Then** I navigate to the category browse screen for that category
4. Smooth slide transition animation plays (300ms ease-in-out)
5. Categories load from categories table (id, name, slug, icon, tagline, background_image_url)

## Tasks / Subtasks

- [ ] Task 1: Create home screen layout (AC: #1)
  - [ ] Create `src/screens/home/HomeScreen.tsx`
  - [ ] Build 2x3 responsive grid (responsive: 1 column on mobile <640px)
  - [ ] Add header with "Explore Bali" title and user greeting
  - [ ] Include trip summary bar if user has active trip
- [ ] Task 2: Create CategoryCard component (AC: #1, #2)
  - [ ] Create `src/components/home/CategoryCard.tsx`
  - [ ] Display background image with gradient overlay for text readability
  - [ ] Add category icon (Phosphor) with white color
  - [ ] Show category name (bold, 18px)
  - [ ] Show tagline below name (14px, semi-transparent)
  - [ ] Use 12px border radius, subtle shadow
- [ ] Task 3: Configure category data (AC: #5)
  - [ ] Create categories data model in `src/types/category.ts`
  - [ ] Define Category: id, name, slug, icon, tagline, background_image_url
  - [ ] Store categories in useKV or as static data
  - [ ] Map category slugs: water_adventures, land_explorations, culture_experiences, food_nightlife, transportation, stays
- [ ] Task 4: Implement navigation (AC: #3, #4)
  - [ ] Handle card tap to navigate to category browse
  - [ ] Pass categoryId to browse screen
  - [ ] Implement 300ms ease-in-out slide transition
  - [ ] Use Framer Motion for smooth animation
- [ ] Task 5: Add loading and image handling
  - [ ] Show skeleton placeholders while loading
  - [ ] Lazy load category background images
  - [ ] Handle image load errors with fallback gradient

## Dev Notes

- Follow mobile-first design
- Use skeleton loading states
- Implement with Framer Motion animations
- Categories are static for MVP (6 fixed categories)

### References

- [Source: epics.md#Story 6.1]
- [Source: prd/pulau-prd.md#Experience Categories]
- [Source: prd/pulau-prd.md#Design System]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

