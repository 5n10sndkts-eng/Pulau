# Story 12.1: Build Explore Screen Layout

Status: ready-for-dev

## Story

As a traveler looking for inspiration,
I want a discovery-focused explore screen,
So that I can find interesting experiences beyond categories.

## Acceptance Criteria

### AC 1: Navigation Access
**Given** I am using the app
**When** I tap "Explore" in bottom navigation (Compass icon)
**Then** the Explore screen loads
**And** the screen is accessible from any part of the app

### AC 2: Vertically Scrolling Sections
**Given** the Explore screen has loaded
**When** I view the screen
**Then** I see vertically scrolling sections in this order:
- Search bar at top (sticky)
- "Trending in Bali" horizontal carousel
- "Hidden Gems" horizontal carousel
- "Limited Availability" horizontal carousel
- "Destination Guides" grid (2 columns)
- "Stories from Travelers" vertical list
**And** all sections are properly spaced and styled

### AC 3: Sticky Search Bar
**Given** I am viewing the Explore screen
**When** I scroll down through sections
**Then** the search bar at top remains sticky (visible)
**And** the search bar doesn't scroll off screen

### AC 4: See All Links
**Given** each section is displayed
**When** I view a section header
**Then** each section has "See All" link
**And** tapping "See All" navigates to full section view

### AC 5: Pull-to-Refresh
**Given** I am on the Explore screen
**When** I pull down from the top
**Then** pull-to-refresh triggers content refresh
**And** all sections reload with fresh data

### AC 6: Loading States
**Given** the Explore screen is loading
**When** data is being fetched
**Then** skeleton loading states display while data loads
**And** skeleton placeholders match the layout of actual content

## Tasks / Subtasks

### Task 1: Create ExploreScreen Component (AC: #1, #2)
- [ ] Create ExploreScreen in `app/(tabs)/explore/index.tsx`
- [ ] Set up vertical ScrollView as main container
- [ ] Add Compass icon to bottom tab navigation
- [ ] Configure screen as a tab in bottom navigation
- [ ] Set screen title to "Explore"

### Task 2: Build Sticky Search Bar (AC: #3)
- [ ] Create SearchBar component at top of screen
- [ ] Implement sticky positioning using position: 'sticky' or custom header
- [ ] Add search icon and placeholder text "Search experiences..."
- [ ] Handle tap to navigate to search screen
- [ ] Style with proper shadow and background

### Task 3: Create Section Container Components (AC: #2, #4)
- [ ] Create ExploreSectionContainer component for reusable section wrapper
- [ ] Add section header with title and "See All" link
- [ ] Implement "See All" navigation for each section type
- [ ] Apply consistent spacing between sections
- [ ] Add section dividers or spacing

### Task 4: Build Trending Section Layout (AC: #2)
- [ ] Create TrendingSection component
- [ ] Implement horizontal FlatList/ScrollView for carousel
- [ ] Add section header "Trending in Bali"
- [ ] Configure for 6-10 experience cards
- [ ] Integrate with TrendingExperienceCard component (from Story 12.2)

### Task 5: Build Hidden Gems Section Layout (AC: #2)
- [ ] Create HiddenGemsSection component
- [ ] Implement horizontal carousel
- [ ] Add section header "Hidden Gems"
- [ ] Configure card spacing and snap behavior
- [ ] Prepare for HiddenGemCard component (from Story 12.3)

### Task 6: Build Limited Availability Section Layout (AC: #2)
- [ ] Create LimitedAvailabilitySection component
- [ ] Implement horizontal carousel
- [ ] Add section header "Limited Availability"
- [ ] Style with urgency indicators
- [ ] Prepare for LimitedAvailabilityCard component (from Story 12.4)

### Task 7: Build Destination Guides Grid (AC: #2)
- [ ] Create DestinationGuidesSection component
- [ ] Implement 2-column grid layout using FlatList with numColumns={2}
- [ ] Add section header "Destination Guides"
- [ ] Configure grid spacing and responsive sizing
- [ ] Prepare for DestinationGuideCard component (from Story 12.5)

### Task 8: Build Traveler Stories List (AC: #2)
- [ ] Create TravelerStoriesSection component
- [ ] Implement vertical list (not carousel)
- [ ] Add section header "Stories from Travelers"
- [ ] Configure card stacking and spacing
- [ ] Prepare for TravelerStoryCard component (from Story 12.6)

### Task 9: Implement Pull-to-Refresh (AC: #5)
- [ ] Add RefreshControl to main ScrollView
- [ ] Create refreshExploreData function
- [ ] Trigger refetch for all section data
- [ ] Show refreshing indicator
- [ ] Handle refresh errors gracefully

### Task 10: Create Skeleton Loading States (AC: #6)
- [ ] Create ExploreScreenSkeleton component
- [ ] Build skeleton placeholders for each section
- [ ] Match skeleton layout to actual content
- [ ] Add shimmer animation to skeletons
- [ ] Display skeleton while initial data loads

## Dev Notes

### Screen Structure
```typescript
<ScrollView
  refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
>
  <StickySearchBar onPress={navigateToSearch} />

  <ExploreSectionContainer title="Trending in Bali" onSeeAll={handleTrendingSeeAll}>
    <TrendingSection />
  </ExploreSectionContainer>

  <ExploreSectionContainer title="Hidden Gems" onSeeAll={handleHiddenGemsSeeAll}>
    <HiddenGemsSection />
  </ExploreSectionContainer>

  <ExploreSectionContainer title="Limited Availability" onSeeAll={handleLimitedSeeAll}>
    <LimitedAvailabilitySection />
  </ExploreSectionContainer>

  <ExploreSectionContainer title="Destination Guides" onSeeAll={handleGuidesSeeAll}>
    <DestinationGuidesSection />
  </ExploreSectionContainer>

  <ExploreSectionContainer title="Stories from Travelers" onSeeAll={handleStoriesSeeAll}>
    <TravelerStoriesSection />
  </ExploreSectionContainer>
</ScrollView>
```

### Horizontal Carousel Pattern
```typescript
<FlatList
  horizontal
  data={items}
  showsHorizontalScrollIndicator={false}
  snapToInterval={cardWidth + spacing}
  decelerationRate="fast"
  renderItem={({ item }) => <Card item={item} />}
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>
```

### Sticky Search Bar
- Use React Native's `stickyHeaderIndices={[0]}` on ScrollView, or
- Use Reanimated for custom sticky header behavior
- Ensure search bar has proper z-index and shadow

### Performance Considerations
- Lazy load sections as user scrolls (optional)
- Use FlatList for horizontal carousels for better performance
- Implement pagination for "See All" views
- Cache section data to avoid unnecessary refetches
- Optimize images with proper sizing and caching

### Responsive Design
- Adjust grid columns for tablets (2 cols → 3 or 4)
- Scale card sizes based on screen width
- Test on various screen sizes (iPhone SE to iPad)
- Ensure horizontal scrolling works smoothly

### Testing Considerations
- Test sticky search bar on scroll
- Verify all "See All" links navigate correctly
- Test pull-to-refresh on iOS and Android
- Validate skeleton loading states
- Test with slow network (loading states)
- Verify smooth scrolling with many items

## References

- [Source: epics.md#Epic 12 - Story 12.1]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.2 - Create Trending Experiences Section]
- [Related: Story 12.3 - Create Hidden Gems Section]
- [Related: Story 12.4 - Create Limited Availability Alerts]
- [Related: Story 12.5 - Create Destination Guides Section]
- [Related: Story 12.6 - Create Traveler Stories Section]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
