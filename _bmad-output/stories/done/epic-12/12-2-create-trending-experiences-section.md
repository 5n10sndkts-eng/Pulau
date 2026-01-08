# Story 12.2: Create Trending Experiences Section

Status: ready-for-dev

## Story

As a traveler,
I want to see what's popular,
So that I can discover highly-booked experiences.

## Acceptance Criteria

### AC 1: Section Display
**Given** I am on the Explore screen
**When** "Trending in Bali" section loads
**Then** I see horizontal carousel of 6-10 experience cards
**And** the section is prominently positioned near the top

### AC 2: Trending Calculation
**Given** experiences are being ranked for trending
**When** the trending algorithm runs
**Then** trending is calculated by: booking_count in last 30 days, minimum 10 bookings
**And** only experiences meeting the threshold are shown

### AC 3: Card Content Display
**Given** trending experience cards are displayed
**When** I view a card
**Then** cards display: image, title, "🔥 X booked this week" badge, price
**And** all information is clearly readable

### AC 4: Card Sizing
**Given** trending cards are rendered
**When** compared to category bobjectse cards
**Then** cards are slightly larger than category bobjectse cards
**And** sizing emphasizes the trending nature

### AC 5: Horizontal Scrolling
**Given** the trending carousel is displayed
**When** I swipe horizontally
**Then** carousel scrolls smoothly with snap-to-card behavior
**And** scrolling feels natural and responsive

### AC 6: Card Navigation
**Given** I am viewing trending experience cards
**When** I tap a trending card
**Then** I navigate to experience detail page
**And** the full experience details load

## Tasks / Subtasks

### Task 1: Create Trending Query and Hook (AC: #2)
- [ ] Create useTrendingExperiences hook
- [ ] Query experiences with booking_count > 10 in last 30 days
- [ ] Sort by booking_count descending
- [ ] Limit to top 10 experiences
- [ ] Add caching with stale-while-revalidate pattern
- [ ] Handle empty state (no trending experiences)

### Task 2: Build TrendingExperienceCard Component (AC: #3, #4)
- [ ] Create TrendingExperienceCard component
- [ ] Display experience image (use Expo Image with blurhash)
- [ ] Show experience title with max 2 lines, ellipsis
- [ ] Add fire emoji badge "🔥 X booked this week"
- [ ] Display price with proper currency formatting
- [ ] Make card slightly larger (e.g., 220x280px vs 180x240px)
- [ ] Add subtle shadow and border radius

### Task 3: Implement Booking Badge Logic (AC: #3)
- [ ] Calculate bookings in last 7 days for badge
- [ ] Display "🔥 X booked this week" text
- [ ] Position badge at top-left or top-right of card
- [ ] Style badge with semi-transparent background
- [ ] Use fire emoji or custom fire icon

### Task 4: Build Horizontal Carousel (AC: #1, #5)
- [ ] Implement FlatList with horizontal scroll
- [ ] Configure snapToInterval for smooth snapping
- [ ] Set decelerationRate="fast" for better UX
- [ ] Hide horizontal scroll indicator
- [ ] Add proper spacing between cards (12-16px)
- [ ] Set contentContainerStyle padding

### Task 5: Implement Card Press Navigation (AC: #6)
- [ ] Add TouchableOpacity/Pressable wrapper to card
- [ ] Navigate to experience detail on press: router.push(`/experiences/${id}`)
- [ ] Add press animation (scale down slightly)
- [ ] Pass experience data to detail screen
- [ ] Track analytics event "trending_experience_tapped"

### Task 6: Add Empty and Loading States
- [ ] Create skeleton loader for trending cards
- [ ] Show skeleton while data is loading
- [ ] Handle empty state: "No trending experiences yet"
- [ ] Add retry mechanism if query fails
- [ ] Display error message gracefully

### Task 7: Optimize Performance
- [ ] Use React.memo for TrendingExperienceCard
- [ ] Implement image lazy loading
- [ ] Add keyExtractor for FlatList
- [ ] Optimize re-renders with useMemo/useCallback
- [ ] Test scrolling performance with 10+ cards

## Dev Notes

### Trending Query
```typescript
const useTrendingExperiences = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return useQuery({
    queryKey: ['trending-experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*, bookings_count:bookings(count)')
        .gte('bookings.created_at', thirtyDaysAgo.toISOString())
        .having('count(bookings) >= 10')
        .order('bookings_count', { ascending: false })
        .limit(10);

      if (error) thobject error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
```

### Card Dimensions
- Card size: 220w x 280h (vs standard 180w x 240h)
- Image height: 160px
- Content padding: 12px
- Border radius: 12px

### Badge Calculation
```typescript
const getWeeklyBookings = (experience: Experience) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Count bookings from last 7 days
  return experience.bookings.filter(
    b => new Date(b.created_at) >= sevenDaysAgo
  ).length;
};
```

### Carousel Configuration
```typescript
<FlatList
  horizontal
  data={trendingExperiences}
  renderItem={({ item }) => <TrendingExperienceCard experience={item} />}
  keyExtractor={(item) => item.id}
  showsHorizontalScrollIndicator={false}
  snapToInterval={232} // cardWidth(220) + spacing(12)
  decelerationRate="fast"
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>
```

### Performance Optimization
- Use getItemLayout for FlatList if card sizes are consistent
- Implement windowSize prop to limit rendered items
- Use Expo Image for optimized image loading with blurhash placeholders
- Consider using FlashList for better performance

### Testing Considerations
- Test with 0, 5, and 10+ trending experiences
- Verify badge displays correct weekly booking count
- Test horizontal scrolling on various devices
- Ensure navigation to detail page works
- Validate empty state display
- Test with slow network (skeleton loaders)

### Analytics Events
- Track "trending_section_viewed"
- Track "trending_experience_tapped" with experience_id
- Monitor conversion rate from trending to booking

## References

- [Source: planning-artifacts/epics/epic-12.md#Epic 12 - Story 12.2]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
