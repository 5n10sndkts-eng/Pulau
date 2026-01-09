# Story 12.5: Create Destination Guides Section

Status: done

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
- [x] Create `destinationGuides` constant in `src/data/destination-guides.ts`
- [x] Add static data for: Ubud, Seminyak, Uluwatu, Nusa Islands
- [x] Include: id, name, slug, tagline, coverImageUrl, description, coordinates
- [x] Add "Best For" tags (e.g., ["Families", "Adventure", "Relaxation"])
- [x] Add TypeScript interface `DestinationGuide` in `src/lib/types.ts`
- [x] Consider storing in KV store for future dynamic updates

### Task 2: Build DestinationGuideCard Component (AC: #2)
- [x] Create `DestinationGuideCard` component in `src/components/explore/DestinationGuideCard.tsx`
- [x] Display cover image with aspect ratio: `aspect-[4/3]` or `aspect-video`
- [x] Show destination name with Tailwind: `text-xl font-bold`
- [x] Add tagline text: `text-sm text-gray-600 dark:text-gray-400`
- [x] Apply card styling: `rounded-lg shadow-md overflow-hidden`
- [x] Make card responsive: `w-full` in grid layout

### Task 3: Implement 2-Column Grid Layout (AC: #1)
- [x] Use CSS Grid with Tailwind: `grid grid-cols-2 gap-4`
- [x] Configure responsive spacing: `md:gap-6 lg:gap-8`
- [x] Ensure responsive sizing: `sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3`
- [x] Set consistent aspect ratio for all cards
- [x] Add padding to grid container: `p-4 md:p-6`

### Task 4: Create GuideDetailScreen (AC: #3, #4)
- [x] Create `GuideDetail` page in `src/pages/guides/[slug].tsx`
- [x] Add hero image section at top with overlay gradient
- [x] Display overview text/description with proper typography
- [x] Add navigation from card click using React Router Link
- [x] Use URL parameter for guide slug: `useParams<{ slug: string }>()`
- [x] Implement 404 page for invalid guide slugs

### Task 5: Build Top Experiences Section (AC: #4)
- [x] Query experiences filtered by destination/region from KV store
- [x] Display as grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- [x] Show 5-10 top-rated experiences for the area
- [x] Add "See All Experiences" button linking to `/explore?region={slug}`
- [x] Reuse existing ExperienceCard component
- [x] Add loading skeleton while fetching experiences

### Task 6: Integrate Map View (AC: #4)
- [x] Add Leaflet or Mapbox GL JS for interactive maps
- [x] Install: `npm install react-leaflet leaflet` or `npm install mapbox-gl`
- [x] Show map centered on destination coordinates
- [x] Add markers for top experiences using Lucide React MapPin icon
- [x] Make map interactive (zoomable, pannable)
- [x] Add proper attribution for map tiles
- [x] Set map height: `h-64 md:h-96 rounded-lg overflow-hidden`

### Task 7: Add Best For Tags (AC: #4)
- [x] Display tags as horizontal scrollable pills: `flex gap-2 overflow-x-auto`
- [x] Style tags with Tailwind: `bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm`
- [x] Tags examples: "Families", "Adventure", "Culture", "Nightlife"
- [x] Make tags clickable to filter experiences (navigate to `/explore?tag={tag}`)
- [x] Add hover state: `hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer`

## Dev Notes

### Destination Guides Data Structure
```typescript
// src/lib/types.ts
export interface DestinationGuide {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  coverImageUrl: string;
  heroImageUrl: string;
  description: string;
  coordinates: { lat: number; lng: number };
  bestForTags: string[];
  region: string;
}

// src/data/destination-guides.ts
export const destinationGuides: DestinationGuide[] = [
  {
    id: '1',
    name: 'Ubud',
    slug: 'ubud',
    tagline: 'Culture & Rice Terraces',
    coverImageUrl: '/images/destinations/ubud-cover.jpg',
    heroImageUrl: '/images/destinations/ubud-hero.jpg',
    description: 'Ubud is the cultural heart of Bali, surrounded by lush rice terraces and traditional villages. Experience authentic Balinese culture, art galleries, and wellness retreats.',
    coordinates: { lat: -8.5069, lng: 115.2625 },
    bestForTags: ['Culture', 'Nature', 'Wellness', 'Families'],
    region: 'Central Bali',
  },
  {
    id: '2',
    name: 'Seminyak',
    slug: 'seminyak',
    tagline: 'Beach & Nightlife',
    coverImageUrl: '/images/destinations/seminyak-cover.jpg',
    heroImageUrl: '/images/destinations/seminyak-hero.jpg',
    description: 'Seminyak offers upscale beach clubs, world-class dining, and vibrant nightlife along stunning coastlines.',
    coordinates: { lat: -8.6905, lng: 115.1682 },
    bestForTags: ['Beach', 'Nightlife', 'Dining', 'Luxury'],
    region: 'South Bali',
  },
  // ... Uluwatu, Nusa Islands
];
```

### Grid Layout with CSS Grid
```typescript
// src/components/explore/DestinationGuidesSection.tsx
import { destinationGuides } from '@/data/destination-guides';
import { DestinationGuideCard } from './DestinationGuideCard';

export function DestinationGuidesSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
      {destinationGuides.map(guide => (
        <DestinationGuideCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}
```

### Guide Card Component
```typescript
// src/components/explore/DestinationGuideCard.tsx
import { Link } from 'react-router-dom';
import type { DestinationGuide } from '@/lib/types';

interface DestinationGuideCardProps {
  guide: DestinationGuide;
}

export function DestinationGuideCard({ guide }: DestinationGuideCardProps) {
  return (
    <Link 
      to={`/guides/${guide.slug}`}
      className="block rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={guide.coverImageUrl}
          alt={guide.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {guide.name}
          </h3>
          <p className="text-sm text-gray-200">
            {guide.tagline}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

### Map Integration with Leaflet
```typescript
// src/components/guides/GuideMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { DestinationGuide } from '@/lib/types';

interface GuideMapProps {
  guide: DestinationGuide;
  experiences: Experience[];
}

export function GuideMap({ guide, experiences }: GuideMapProps) {
  return (
    <div className="h-64 md:h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[guide.coordinates.lat, guide.coordinates.lng]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Guide center marker */}
        <Marker position={[guide.coordinates.lat, guide.coordinates.lng]}>
          <Popup>{guide.name}</Popup>
        </Marker>
        
        {/* Experience markers */}
        {experiences.map(exp => (
          <Marker 
            key={exp.id} 
            position={[exp.coordinates.lat, exp.coordinates.lng]}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm">${exp.price}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

### Guide Detail Page
```typescript
// src/pages/guides/[slug].tsx
import { useParams, Navigate } from 'react-router-dom';
import { destinationGuides } from '@/data/destination-guides';
import { GuideMap } from '@/components/guides/GuideMap';

export function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = destinationGuides.find(g => g.slug === slug);
  
  if (!guide) {
    return <Navigate to="/explore" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96">
        <img 
          src={guide.heroImageUrl} 
          alt={guide.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">{guide.name}</h1>
          <p className="text-xl text-gray-200">{guide.tagline}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Best For Tags */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {guide.bestForTags.map(tag => (
            <span 
              key={tag}
              className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          {guide.description}
        </p>
        
        {/* Map */}
        <GuideMap guide={guide} experiences={topExperiences} />
        
        {/* Top Experiences */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Top Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Experience cards */}
          </div>
        </section>
      </div>
    </div>
  );
}
```

### Filtering Experiences by Destination
```typescript
// src/hooks/useExperiencesByRegion.ts
import { useKV } from '@github-spark/app';
import { useQuery } from '@tanstack/react-query';

export function useExperiencesByRegion(region: string) {
  const kv = useKV();
  
  return useQuery({
    queryKey: ['experiences', 'region', region],
    queryFn: async () => {
      const experiences = await kv.get<Experience[]>('experiences:all');
      return experiences?.filter(exp => exp.region === region).slice(0, 10) ?? [];
    }
  });
}
```

### Testing Considerations
- Test grid layout on mobile (2 cols), KV namespacet (2 cols), desktop (3 cols)
- Verify all 4 destination guides display correctly
- Test navigation to detail screens with correct slugs
- Validate map loads and markers are clickable
- Ensure responsive image sizing and lazy loading
- Test with missing images (add placeholder fallback)
- Verify dark mode styling for all components
- Test keyboard navigation and accessibility

## References

- [Source: planning-artifacts/epics/epic-12.md#Epic 12 - Story 12.5]
- [Source: planning-artifacts/prd/pulau-prd.md#Explore & Discovery]
- [Related: Story 12.1 - Build Explore Screen Layout]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ Database KV namespace references → Static data files
2. ✅ FlatList with numColumns → CSS Grid with Tailwind
3. ✅ React Native Maps → Leaflet/Mapbox GL JS for web
4. ✅ File paths (app/guides → src/pages/guides)
5. ✅ Route params → React Router useParams hook
6. ✅ StyleSheet → Tailwind CSS classes
7. ✅ Navigation (tap → click, Link component)
8. ✅ Added TypeScript interfaces
9. ✅ Updated PRD reference path
10. ✅ Added responsive breakpoints (md, lg)
11. ✅ Added KV store integration for experiences filtering
12. ✅ Added Lucide React MapPin icon
13. ✅ Added dark mode support throughout
14. ✅ Added accessibility considerations

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md`.
