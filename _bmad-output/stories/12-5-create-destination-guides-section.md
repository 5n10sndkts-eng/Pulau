# Story 12.5: Create Destination Guides Section

Status: ready-for-dev

## Story

As a traveler planning a trip,
I want to read curated destination guides,
So that I can learn about different areas of Bali.

## Acceptance Criteria

### AC 1: Section Display
**Given** I am on the Explore screen
**When** "Destination Guides" section loads
**Then** I see 2-column grid of guide cards with destinations:
- Ubud (Culture & Rice Terraces)
- Seminyak (Beach & Nightlife)
- Uluwatu (Surf & Cliffs)
- Nusa Islands (Island Hopping)
**And** the grid layout is properly formatted

### AC 2: Guide Card Content
**Given** destination guide cards are displayed
**When** I view a card
**Then** each card has: cover image, destination name, tagline
**And** content is clearly readable and visually appealing

### AC 3: Guide Detail Page Navigation
**Given** I tap a guide card
**When** the guide detail page opens
**Then** I see complete guide information

### AC 4: Guide Detail Content
**Given** the guide detail page has loaded
**When** I view the content
**Then** I see:
- Hero image
- Overview text
- "Top Experiences" list (filtered by destination)
- Map of area
- "Best For" tags

## Tasks / Subtasks

### Task 1: Create Destination Guides Data (AC: #1, #2)
- [ ] Create destination_guides table or use static data
- [ ] Add data for: Ubud, Seminyak, Uluwatu, Nusa Islands
- [ ] Include: name, tagline, cover_image_url, description, coordinates
- [ ] Add "Best For" tags (e.g., ["Families", "Adventure", "Relaxation"])
- [ ] Create seed data or CMS entries

### Task 2: Build DestinationGuideCard Component (AC: #2)
- [ ] Create DestinationGuideCard component
- [ ] Display cover image (aspect ratio 16:9 or 4:3)
- [ ] Show destination name prominently
- [ ] Add tagline text below name
- [ ] Apply card styling with rounded corners and shadow
- [ ] Make card size responsive to screen width

### Task 3: Implement 2-Column Grid Layout (AC: #1)
- [ ] Use FlatList with numColumns={2}
- [ ] Configure proper spacing between cards
- [ ] Add columnWrapperStyle for horizontal spacing
- [ ] Ensure responsive sizing on different screen widths
- [ ] Set card aspect ratio consistently

### Task 4: Create GuideDetailScreen (AC: #3, #4)
- [ ] Create GuideDetailScreen in `app/guides/[slug].tsx`
- [ ] Add hero image section at top
- [ ] Display overview text/description
- [ ] Add navigation from card tap to detail screen
- [ ] Pass guide data via route params

### Task 5: Build Top Experiences Section (AC: #4)
- [ ] Query experiences filtered by destination/region
- [ ] Display as vertical list or grid
- [ ] Show 5-10 top-rated experiences for the area
- [ ] Add "See All Experiences" link to browse by destination
- [ ] Reuse ExperienceCard component

### Task 6: Integrate Map View (AC: #4)
- [ ] Add React Native Maps or MapLibre
- [ ] Show map centered on destination coordinates
- [ ] Add markers for top experiences in the area
- [ ] Make map interactive (zoomable, scrollable)
- [ ] Show destination boundary/region if available

### Task 7: Add Best For Tags (AC: #4)
- [ ] Display tags as horizontal scrollable pills
- [ ] Style tags with appropriate colors
- [ ] Tags examples: "Families", "Adventure", "Culture", "Nightlife"
- [ ] Make tags tappable to filter experiences (optional)

## Dev Notes

### Destination Guides Data Structure
```typescript
interface DestinationGuide {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  cover_image_url: string;
  hero_image_url: string;
  description: string;
  coordinates: { lat: number; lng: number };
  best_for_tags: string[];
  region: string;
}

const guides: DestinationGuide[] = [
  {
    id: '1',
    name: 'Ubud',
    slug: 'ubud',
    tagline: 'Culture & Rice Terraces',
    cover_image_url: '...',
    hero_image_url: '...',
    description: 'Ubud is the cultural heart of Bali...',
    coordinates: { lat: -8.5069, lng: 115.2625 },
    best_for_tags: ['Culture', 'Nature', 'Wellness', 'Families'],
    region: 'Central Bali',
  },
  // ...other guides
];
```

### Grid Layout Configuration
```typescript
<FlatList
  data={destinationGuides}
  renderItem={({ item }) => <DestinationGuideCard guide={item} />}
  keyExtractor={(item) => item.id}
  numColumns={2}
  columnWrapperStyle={{ gap: 12 }}
  contentContainerStyle={{ padding: 16, gap: 12 }}
/>
```

### Map Integration
```typescript
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ height: 300 }}
  initialRegion={{
    latitude: guide.coordinates.lat,
    longitude: guide.coordinates.lng,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  }}
>
  {topExperiences.map(exp => (
    <Marker
      key={exp.id}
      coordinate={{ latitude: exp.lat, longitude: exp.lng }}
      title={exp.name}
    />
  ))}
</MapView>
```

### Filtering Experiences by Destination
- Add `destination` or `region` field to experiences table
- Filter experiences WHERE region = guide.region
- Sort by rating or popularity

### Testing Considerations
- Test grid layout on various screen sizes
- Verify all 4 destination guides display correctly
- Test navigation to detail screens
- Validate map markers and interactions
- Ensure responsive card sizing
- Test with missing images (placeholder)

## References

- [Source: epics.md#Epic 12 - Story 12.5]
- [Source: prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
