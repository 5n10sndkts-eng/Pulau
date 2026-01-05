# Story 12.3: Create Hidden Gems Section

Status: ready-for-dev

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
**Then** I navigate to filtered browse showing all hidden gems
**And** the filtered view maintains the same criteria

## Tasks / Subtasks

### Task 1: Create Hidden Gems Query and Hook (AC: #2)
- [ ] Create useHiddenGems hook
- [ ] Query experiences WHERE rating >= 4.5 AND booking_count < 50 AND review_count >= 5
- [ ] Sort by rating descending, then review_count descending
- [ ] Limit to 10-12 experiences for carousel
- [ ] Add caching with 1-hour stale time
- [ ] Handle empty state gracefully

### Task 2: Build HiddenGemCard Component (AC: #3, #4)
- [ ] Create HiddenGemCard component
- [ ] Display experience image with subtle overlay
- [ ] Show title with max 2 lines
- [ ] Add "💎 Local Secret" badge with #F4D03F background
- [ ] Display star rating (e.g., "4.8 ⭐")
- [ ] Show price prominently
- [ ] Use card size similar to trending (220x280px)

### Task 3: Implement Badge Component (AC: #4)
- [ ] Create LocalSecretBadge component
- [ ] Use diamond emoji 💎 or custom diamond icon
- [ ] Apply Golden Sand color (#F4D03F) background
- [ ] Add "Local Secret" text
- [ ] Position badge at top of card image
- [ ] Add subtle shadow for contrast

### Task 4: Build Horizontal Carousel (AC: #1)
- [ ] Implement FlatList with horizontal scroll
- [ ] Configure smooth snapping behavior
- [ ] Add spacing between cards (12-16px)
- [ ] Hide horizontal scroll indicator
- [ ] Implement snap-to-card behavior
- [ ] Set proper padding for edge cards

### Task 5: Implement Card Navigation (AC: #5)
- [ ] Add Pressable wrapper to card
- [ ] Navigate to experience detail on tap
- [ ] Add press feedback animation
- [ ] Track "hidden_gem_tapped" analytics event
- [ ] Pass experience data to detail screen

### Task 6: Build "See All" Page (AC: #5)
- [ ] Create HiddenGemsListScreen for "See All" view
- [ ] Apply same filtering criteria as carousel
- [ ] Show all hidden gems in vertical list/grid
- [ ] Add search and additional filters
- [ ] Implement pagination for large result sets
- [ ] Display count: "X Hidden Gems in Bali"

### Task 7: Add Empty and Loading States
- [ ] Create skeleton loader for hidden gem cards
- [ ] Show skeleton during initial load
- [ ] Handle empty state: "No hidden gems found"
- [ ] Add error handling with retry
- [ ] Display informative message if no results

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

      if (error) throw error;
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
    flexDirection: 'row',
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
- Cache query results to reduce database load
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

- [Source: epics.md#Epic 12 - Story 12.3]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
