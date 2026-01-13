# Story 12.3: Create Hidden Gems Section

Status: done

## Story

As a traveler seeking unique experiences,
I want to discover lesser-known gems,
So that I can have authentic local experiences.

## Acceptance Criteria

### AC 1: Section Display

**Given** I am on the Explore screen
**When** "Hidden Gems" section loads
**Then** I see horizontal carousel of experiences
**And** the section is positioned after trending section

### AC 2: Hidden Gem Identification

**Given** experiences are being classified as hidden gems
**When** the selection algorithm runs
**Then** hidden gems identified by: rating >= 4.5 AND booking_count < 50 AND review_count >= 5
**And** only experiences meeting all criteria are shown

### AC 3: Card Content Display

**Given** hidden gem cards are displayed
**When** I view a card
**Then** cards display: image, title, "💎 Local Secret" badge, rating, price
**And** the gem badge uses Golden Sand color (#F4D03F)

### AC 4: Badge Styling

**Given** a hidden gem card has the Local Secret badge
**When** the badge is rendered
**Then** badge uses Golden Sand color (#F4D03F)
**And** the diamond emoji or icon is prominently displayed

### AC 5: See All Navigation

**Given** I am viewing the Hidden Gems section
**When** I tap "See All"
**Then** I navigate to filtered bobjectse showing all hidden gems
**And** the filtered view maintains the same criteria

## Tasks / Subtasks

### Task 1: Create Hidden Gems Query and Hook (AC: #2)

- [x] Create useHiddenGems hook
- [x] Query experiences WHERE rating >= 4.5 AND booking_count < 50 AND review_count >= 5
- [x] Sort by rating descending, then review_count descending
- [x] Limit to 10-12 experiences for carousel
- [x] Add caching with 1-hour stale time
- [x] Handle empty state gracefully

### Task 2: Build HiddenGemCard Component (AC: #3, #4)

- [x] Create HiddenGemCard component
- [x] Display experience image with subtle overlay
- [x] Show title with max 2 lines
- [x] Add "💎 Local Secret" badge with #F4D03F background
- [x] Display star rating (e.g., "4.8 ⭐")
- [x] Show price prominently
- [x] Use card size similar to trending (220x280px)

### Task 3: Implement Badge Component (AC: #4)

- [x] Create LocalSecretBadge component
- [x] Use diamond emoji 💎 or custom diamond icon
- [x] Apply Golden Sand color (#F4D03F) background
- [x] Add "Local Secret" text
- [x] Position badge at top of card image
- [x] Add subtle shadow for contrast

### Task 4: Build Horizontal Carousel (AC: #1)

- [x] Implement FlatList with horizontal scroll
- [x] Configure smooth snapping behavior
- [x] Add spacing between cards (12-16px)
- [x] Hide horizontal scroll indicator
- [x] Implement snap-to-card behavior
- [x] Set proper padding for edge cards

### Task 5: Implement Card Navigation (AC: #5)

- [x] Add Pressable wrapper to card
- [x] Navigate to experience detail on tap
- [x] Add press feedback animation
- [x] Track "hidden_gem_tapped" analytics event
- [x] Pass experience data to detail screen

### Task 6: Build "See All" Page (AC: #5)

- [x] Create HiddenGemsListScreen for "See All" view
- [x] Apply same filtering criteria as carousel
- [x] Show all hidden gems in vertical list/grid
- [x] Add search and additional filters
- [x] Implement pagination for large result sets
- [x] Display count: "X Hidden Gems in Bali"

### Task 7: Add Empty and Loading States

- [x] Create skeleton loader for hidden gem cards
- [x] Show skeleton during initial load
- [x] Handle empty state: "No hidden gems found"
- [x] Add error handling with retry
- [x] Display informative message if no results

## Dev Notes

### Hidden Gems Query

```typescript
const useHiddenGems = () => {
  return useQuery({
    queryKey: ['hidden-gems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .gte('rating', 4.5)
        .lt('booking_count', 50)
        .gte('review_count', 5)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(12);

      if (error) thobject error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
```

### Badge Styling

```typescript
const LocalSecretBadge = () => (
  <View style={{
    backgroundColor: '#F4D03F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'object',
    alignItems: 'center',
    gap: 4,
  }}>
    <Text>💎</Text>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#2C3E50' }}>
      Local Secret
    </Text>
  </View>
);
```

### Card Layout

- Card dimensions: 220w x 280h
- Image height: 160px
- Badge position: absolute, top: 12, left: 12
- Rating display: star icon + numeric rating
- Price at bottom with currency symbol

### Performance Considerations

- Cache query results to reduce Spark KV store load
- Use React.memo for HiddenGemCard
- Optimize images with proper compression and blurhash
- Implement lazy loading for "See All" page

### Testing Considerations

- Test with 0, 5, and 12+ hidden gems
- Verify filtering criteria works correctly
- Test badge rendering on various backgrounds
- Ensure navigation to detail and "See All" works
- Validate empty state display
- Test with slow network connections

### Analytics Events

- Track "hidden_gems_section_viewed"
- Track "hidden_gem_tapped" with experience_id
- Track "hidden_gems_see_all_tapped"
- Monitor conversion rate from hidden gems

## References

- [Source: planning-artifacts/epics/epic-12.md#Epic 12 - Story 12.3]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
