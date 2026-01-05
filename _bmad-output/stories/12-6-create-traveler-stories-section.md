# Story 12.6: Create Traveler Stories Section

Status: ready-for-dev

## Story

As a traveler seeking social proof,
I want to read stories from other travelers,
So that I can learn from their experiences.

## Acceptance Criteria

### AC 1: Section Display
**Given** I am on the Explore screen
**When** "Stories from Travelers" section loads
**Then** I see vertical list of story cards
**And** the section showcases authentic traveler experiences

### AC 2: Story Source Criteria
**Given** stories are being curated
**When** the selection algorithm runs
**Then** stories are sourced from reviews with photos and 200+ character text
**And** only high-quality, detailed reviews are shown

### AC 3: Story Card Content
**Given** traveler story cards are displayed
**When** I view a card
**Then** the card displays: traveler photo, name, country, story excerpt, experience thumbnail
**And** all information is properly formatted

### AC 4: Expandable Story Cards
**Given** a story card is displayed
**When** I view the card
**Then** cards are expandable to show full story
**And** expansion happens smoothly with animation

### AC 5: Full Story Display
**Given** I tap "Read More" on a story
**When** the full review displays
**Then** I see the full review with all photos
**And** there is a link to the experience being reviewed

### AC 6: Experience Navigation
**Given** I am viewing a traveler story
**When** I tap the experience link
**Then** I navigate to the experience detail page
**And** I can book the experience from there

## Tasks / Subtasks

### Task 1: Create Traveler Stories Query (AC: #2)
- [ ] Create useTravelerStories hook
- [ ] Query reviews WHERE photos.length > 0 AND text.length >= 200
- [ ] Join with user_profiles and experiences tables
- [ ] Sort by rating descending or recency
- [ ] Limit to 5-10 featured stories
- [ ] Add caching with 1-hour stale time

### Task 2: Build TravelerStoryCard Component (AC: #3, #4)
- [ ] Create TravelerStoryCard component in collapsed state
- [ ] Display circular traveler photo (40-50px)
- [ ] Show traveler name and country flag/emoji
- [ ] Display story excerpt (first 150 characters)
- [ ] Show small experience thumbnail (60x60px)
- [ ] Add "Read More" button or expandable indicator

### Task 3: Implement Card Expansion (AC: #4, #5)
- [ ] Add expandable/collapsible functionality
- [ ] Use Reanimated for smooth height animation
- [ ] Show full story text when expanded
- [ ] Display all photos in horizontal scrollable gallery
- [ ] Add "Show Less" button when expanded
- [ ] Ensure smooth transition

### Task 4: Build Photo Gallery (AC: #5)
- [ ] Create photo gallery for expanded story
- [ ] Implement horizontal FlatList for photos
- [ ] Add tap-to-view-fullscreen functionality
- [ ] Use Image viewer modal for full-size photos
- [ ] Support swipe gestures in fullscreen view

### Task 5: Add Experience Link (AC: #5, #6)
- [ ] Display experience name and image in story
- [ ] Make experience section tappable
- [ ] Navigate to experience detail on tap
- [ ] Pass experience ID to detail screen
- [ ] Track "story_to_experience" analytics event

### Task 6: Implement Vertical List (AC: #1)
- [ ] Use FlatList or ScrollView for vertical layout
- [ ] Add spacing between story cards (16-24px)
- [ ] Ensure smooth scrolling performance
- [ ] Implement lazy loading for photos
- [ ] Add pull-to-refresh for new stories

### Task 7: Add Empty and Loading States
- [ ] Create skeleton loader for story cards
- [ ] Handle empty state: "No stories yet. Be the first!"
- [ ] Add error handling with retry
- [ ] Show loading indicator for photo gallery

## Dev Notes

### Traveler Stories Query
```typescript
const useTravelerStories = () => {
  return useQuery({
    queryKey: ['traveler-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user_profiles(*), experiences(*)')
        .not('photos', 'is', null)
        .gte('text_length', 200) // Assuming we store text length
        .gte('rating', 4) // Only positive stories
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
```

### Card Expansion Animation
```typescript
const TravelerStoryCard = ({ story }) => {
  const [expanded, setExpanded] = useState(false);
  const height = useSharedValue(150); // Collapsed height

  const toggleExpand = () => {
    setExpanded(!expanded);
    height.value = withTiming(expanded ? 150 : 400, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {/* Card content */}
      <Pressable onPress={toggleExpand}>
        <Text>{expanded ? 'Show Less' : 'Read More'}</Text>
      </Pressable>
    </Animated.View>
  );
};
```

### Story Card Layout
```
┌─────────────────────────────────┐
│ [Photo] Name · Country 🇺🇸      │
│                                 │
│ "This experience was amazing... │
│  [truncated excerpt]"           │
│                                 │
│ ┌──────┐ Experience Name        │
│ │ Img  │ ⭐ 5.0                 │
│ └──────┘                        │
│                    [Read More]  │
└─────────────────────────────────┘
```

### Photo Gallery Implementation
- Use react-native-image-viewing or custom modal
- Support pinch-to-zoom in fullscreen
- Add photo counter (1 of 5)
- Preload next/previous images for smooth swiping

### Performance Considerations
- Lazy load story content and photos
- Use React.memo for TravelerStoryCard
- Optimize images with proper sizing
- Limit initial stories to 5-7, load more on scroll

### Testing Considerations
- Test expansion/collapse animation smoothness
- Verify photo gallery on various devices
- Test with stories containing 1, 3, and 10+ photos
- Validate navigation to experience detail
- Test with long story text
- Ensure accessibility for screen readers

### Analytics Events
- Track "traveler_story_viewed"
- Track "traveler_story_expanded"
- Track "traveler_story_photo_viewed"
- Track "story_to_experience_navigation"

## References

- [Source: epics.md#Epic 12 - Story 12.6]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]
- [Related: Story 5.2 - Submit and Edit Reviews]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
