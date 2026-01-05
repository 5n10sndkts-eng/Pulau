# Story 12.4: Create Limited Availability Alerts

Status: ready-for-dev

## Story

As a traveler,
I want to see experiences with limited spots,
So that I can book before they sell out.

## Acceptance Criteria

### AC 1: Section Display
**Given** I am on the Explore screen
**When** "Limited Availability" section loads
**Then** I see experiences with low remaining slots
**And** the section creates urgency

### AC 2: Limited Availability Criteria
**Given** experiences are being filtered for limited availability
**When** the selection algorithm runs
**Then** limited = experience_availability.slots_available <= 5 for next 7 days
**And** only experiences meeting criteria are shown

### AC 3: Card Content Display
**Given** limited availability cards are displayed
**When** I view a card
**Then** cards display: image, title, "Only X spots left!" badge (red/coral), date, price
**And** the urgency is visually communicated

### AC 4: Urgency Styling
**Given** a limited availability card is rendered
**When** the card styling is applied
**Then** urgency styling includes: coral border, pulsing badge animation
**And** the visual design creates FOMO (fear of missing out)

### AC 5: Dynamic Availability Updates
**Given** availability data changes over time
**When** availability updates (spots fill)
**Then** section content refreshes on next load
**And** fully booked experiences move to "Sold Out" state

### AC 6: Sold Out State
**Given** an experience becomes fully booked
**When** slots_available reaches 0
**Then** the experience shows "Sold Out" state
**And** is removed from limited availability section or marked as unavailable

## Tasks / Subtasks

### Task 1: Create Limited Availability Query (AC: #2)
- [ ] Create useLimitedAvailability hook
- [ ] Query experience_availability WHERE slots_available <= 5 AND date >= today AND date <= today+7
- [ ] Join with experiences table to get full data
- [ ] Sort by slots_available ascending (most urgent first)
- [ ] Limit to 8-10 experiences
- [ ] Set short cache time (5 minutes) for real-time accuracy

### Task 2: Build LimitedAvailabilityCard Component (AC: #3, #4)
- [ ] Create LimitedAvailabilityCard component
- [ ] Display experience image
- [ ] Add "Only X spots left!" badge with coral/red background (#E74C3C or #FF6B6B)
- [ ] Show specific date for the limited availability
- [ ] Display price prominently
- [ ] Apply coral border (2px solid #E74C3C)
- [ ] Add card size similar to others (220x280px)

### Task 3: Implement Urgency Badge with Animation (AC: #4)
- [ ] Create UrgencyBadge component with pulsing animation
- [ ] Use Reanimated or Animated API for pulse effect
- [ ] Display "Only X spots left!" text
- [ ] Use coral/red background (#E74C3C)
- [ ] Add warning icon (⚠️ or !)
- [ ] Ensure animation is subtle but noticeable

### Task 4: Add Urgency Visual Styling (AC: #4)
- [ ] Apply coral border to card
- [ ] Add subtle glow or shadow effect
- [ ] Use urgent color palette (red/coral/orange)
- [ ] Consider adding countdown timer if date is very soon
- [ ] Ensure accessibility (don't rely only on color)

### Task 5: Implement Real-Time Updates (AC: #5, #6)
- [ ] Set up real-time Supabase subscription on experience_availability
- [ ] Update card data when slots_available changes
- [ ] Remove experiences when slots_available reaches 0
- [ ] Show "Sold Out" overlay if booked during viewing
- [ ] Add toast notification: "This experience just sold out!"

### Task 6: Build Horizontal Carousel (AC: #1)
- [ ] Implement FlatList with horizontal scroll
- [ ] Configure snap behavior
- [ ] Add spacing between urgent cards
- [ ] Hide horizontal scroll indicator
- [ ] Ensure smooth scrolling performance

### Task 7: Handle Empty and Sold Out States (AC: #6)
- [ ] Create skeleton loader for limited availability cards
- [ ] Handle empty state: "All experiences have plenty of availability!"
- [ ] Show "Sold Out" badge on fully booked experiences
- [ ] Add retry mechanism for failed queries
- [ ] Display informative messages

## Dev Notes

### Limited Availability Query
```typescript
const useLimitedAvailability = () => {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  return useQuery({
    queryKey: ['limited-availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experience_availability')
        .select('*, experiences(*)')
        .lte('slots_available', 5)
        .gte('date', today)
        .lte('date', sevenDaysLater)
        .gt('slots_available', 0) // Exclude sold out
        .order('slots_available', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - short cache for urgency
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
};
```

### Pulsing Animation
```typescript
const PulsingBadge = ({ children }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // Infinite repeat
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
```

### Card Styling
```typescript
const cardStyles = {
  container: {
    borderWidth: 2,
    borderColor: '#E74C3C',
    borderRadius: 12,
    shadowColor: '#E74C3C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
};
```

### Real-Time Subscription
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('availability_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'experience_availability',
      },
      (payload) => {
        // Refetch limited availability data
        queryClient.invalidateQueries(['limited-availability']);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Testing Considerations
- Test with 0, 3, and 10+ limited experiences
- Verify urgency styling on various backgrounds
- Test pulsing animation performance
- Validate real-time updates when availability changes
- Test "Sold Out" state transitions
- Ensure accessibility of urgent styling

### Analytics Events
- Track "limited_availability_section_viewed"
- Track "limited_availability_card_tapped"
- Monitor conversion rate (high expected due to urgency)
- Track sell-out rates from this section

## References

- [Source: epics.md#Epic 12 - Story 12.4]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]
- [Related: Story 4.1 - Create Experience Detail Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
