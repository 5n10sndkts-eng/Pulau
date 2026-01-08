# Story 7.2: Create Saved/Wishlist Screen

Status: ready-for-dev

## Story

As a traveler,
I want to view all my saved experiences in one place,
So that I can easily revisit and compare options.

## Acceptance Criteria

**AC #1: Display saved experiences list**
**Given** I tap the "Saved" tab in bottom navigation (Heart icon)
**When** the Saved screen loads
**Then** I see all my saved experiences displayed as cards
**And** cards show: hero image, title, price, rating, saved date
**And** cards are sorted by saved_at DESC (most recent first)
**And** each card has heart icon (filled) and "Add to Trip" button
**And** list loads from saved_experiences KV namespace joined with experiences

**AC #2: Show empty state when no saved experiences**
**When** I have no saved experiences
**Then** empty state displays: heart illustration, "Your wishlist is empty", "Start exploring" CTA button
**And** CTA navigates to home screen

## Tasks / Subtasks

### Task 1: Build SavedScreen layout component (AC: #1, #2)
- [ ] Create SavedScreen component with header and list container
- [ ] Add "Saved" header with count badge (e.g., "12 saved")
- [ ] Implement scrollable list layout with proper spacing
- [ ] Add pull-to-refresh functionality for mobile
- [ ] Ensure safe area insets for bottom navigation

### Task 2: Create SavedExperienceCard component (AC: #1)
- [ ] Design card layout: hero image, title, price, rating, saved date
- [ ] Add filled heart icon in top-right corner (integrated with Story 7.1)
- [ ] Include "Add to Trip" button with primary styling
- [ ] Display "Saved [relative time]" (e.g., "Saved 2 days ago")
- [ ] Make entire card tappable to navigate to experience detail

### Task 3: Implement data fetching and sorting (AC: #1)
- [ ] Create useSavedExperiences hook to fetch from useKV
- [ ] Join saved_experiences with experiences data
- [ ] Sort by saved_at DESC (most recent first)
- [ ] Handle loading state with skeleton cards
- [ ] Add error handling for data fetch failures

### Task 4: Build empty state component (AC: #2)
- [ ] Create EmptyWishlist component with heart illustration SVG
- [ ] Add centered text: "Your wishlist is empty"
- [ ] Include descriptive subtext: "Save experiences to view them here"
- [ ] Add "Start Exploring" CTA button with navigation to home
- [ ] Ensure empty state is vertically centered

### Task 5: Integrate heart icon unsave functionality (AC: #1)
- [ ] Connect heart icon to unsave handler from Story 7.1
- [ ] Remove card from list with fade-out animation on unsave
- [ ] Show toast notification: "Removed from wishlist"
- [ ] Update count badge in header when item removed
- [ ] Show empty state if last item is removed

## Dev Notes

### Technical Guidance
- Use Spark's `useKV` for saved experiences: `const [savedExperiences] = useKV<SavedExperience[]>('saved_experiences', [])`
- Bottom navigation tab should highlight "Saved" when active
- Card layout should match experience cards from bobjectse views for consistency
- Use Lucide React icons: `Heart` for filled state
- Relative time formatting: use `date-fns` library's `formatDistanceToNow`

### Data Structure
```typescript
interface SavedExperienceWithDetails extends SavedExperience {
  experience: {
    id: string;
    title: string;
    hero_image_url: string;
    price: number;
    rating: number;
    category: string;
  };
}
```

### Layout Specifications
- Card spacing: 16px vertical gap between cards
- Card padding: 12px internal padding
- Image aspect ratio: 16:9, height 180px
- "Add to Trip" button: full width within card, primary teal color
- Empty state illustration: max width 240px

### Performance Considerations
- Implement virtual scrolling if user has 50+ saved items
- Lazy load experience images with placeholder
- Cache joined experience data to avoid repeated lookups
- Debounce pull-to-refresh to prevent excessive re-renders

## References

- [Source: planning-artifacts/epics/epic-07.md#Epic 7, Story 7.2]
- [Source: prd/pulau-prd.md#Wishlist & Saved Experiences]
- [Figma: Saved/Wishlist Screen Layout]
- [Related: Story 7.1 - Heart Icon Save Toggle]
- [Related: Story 7.3 - Quick Add from Wishlist to Trip]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
