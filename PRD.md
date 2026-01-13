# Pulau - Premium Travel Experience Builder

A Bali vacation builder connecting travelers with authentic local tours, activities, and hospitality services through seamless digital booking.

**Experience Qualities:**

1. **Aspirational** - Every interaction should evoke wanderlust and the excitement of building a dream vacation
2. **Trustworthy** - Clear pricing, authentic reviews, and transparent operator information build confidence in booking decisions
3. **Effortless** - Complex itinerary planning feels simple through intuitive visual organization and smart recommendations

**Complexity Level:** Complex Application (advanced functionality with multiple views) - This is a full-featured booking platform with itinerary building, multi-step checkout, dynamic pricing, date management, filtering systems, and state persistence across multiple user journeys.

## Essential Features

**Trip Canvas Building**

- Functionality: Visual itinerary builder where travelers add experiences that populate a calendar-style trip view
- Purpose: Transforms overwhelming planning into creative, enjoyable composition process
- Trigger: User taps category card from home screen
- Progression: Home → Category selection → Browse experiences → Tap "Quick Add" → Item animates to trip bar → Price updates live → Continue browsing or view full trip
- Success: User can build 5-day trip with 6+ activities in under 10 minutes; total cost visible at all times

**Experience Discovery & Filtering**

- Functionality: Browse categorized local experiences with smart filtering and personalized recommendations
- Purpose: Surface authentic local operators while reducing choice paralysis
- Trigger: User taps category or uses search
- Progression: Category screen → Apply filters (difficulty/duration/price) → Scroll curated list → See "Perfect for you" recommendations → Tap experience for details
- Success: Users find relevant experiences within 3 taps; filter results update instantly

**Detailed Experience Pages**

- Functionality: Rich multimedia experience pages with operator stories, reviews, pricing calculator, and booking action
- Purpose: Build trust and provide decision-making confidence through transparency
- Trigger: User taps experience card
- Progression: Tap card → View image carousel → Read description → Check inclusions → See operator bio → Read reviews → Adjust guest count (price updates) → Add to trip
- Success: Users feel confident booking without contacting operator; 80%+ of needed info visible without scrolling

**Multi-Step Checkout Flow**

- Functionality: Guided booking process with trip review, traveler details, and payment
- Purpose: Convert trip plans into confirmed bookings with clear progress indication
- Trigger: User taps "Continue to Booking" from trip view
- Progression: View trip → Tap checkout → Review items → Enter traveler details → Add payment → Confirm → See success animation → Receive booking reference
- Success: Zero abandoned checkouts due to confusion; clear progress at each step

**Onboarding Preferences**

- Functionality: Quick 3-screen preference capture for personalized recommendations
- Purpose: Tailor experience suggestions to traveler style, group type, and budget
- Trigger: First app launch
- Progression: Welcome screen → Select travel style + group type + budget → Enter dates (or skip) → Home with personalized "Perfect for you" cards
- Success: Preferences stored; recommendations feel relevant to user selections

**Booking History & Trip Management Dashboard**

- Functionality: Comprehensive dashboard for viewing all bookings, managing upcoming trips, and accessing past travel history with status tracking
- Purpose: Centralize trip management and provide easy access to booking confirmations, cancellations, and rebooking functionality
- Trigger: User navigates to Profile → My Trips or completes a booking
- Progression: Profile → My Trips → View tabs (Upcoming/Past/All) → Select booking → View full trip details read-only → Access booking reference → Book again (copies trip)
- Success: Users can find any booking within 2 taps; booking details display identically to trip builder view; "Book Again" creates new planning trip from completed booking; demo mode available for testing

## Edge Case Handling

**Scheduling Conflicts** - Yellow warning banner when overlapping activities detected with smart suggestions to adjust times

**No Results State** - Friendly empty state with filter adjustment suggestions and "Clear Filters" CTA when no experiences match criteria

**Network Interruption** - Cached trip data persists locally; "Last updated" timestamp shown; retry buttons on failed loads

**Date Not Set** - App allows browsing and adding to trip without dates; prompts to set dates before checkout with "Skip for now" option

**Incomplete Booking** - Form validation prevents submission; highlights missing fields; saves progress in session

**Sold Out Experiences** - "Currently unavailable" badge on cards; waitlist signup option; similar alternatives suggested

## Design Direction

The design should evoke the feeling of planning an adventure through a luxury travel magazine—aspirational yet authentic, polished yet warm. Think Cereal magazine meets Airbnb Experiences. Every interaction should feel considered, every image should inspire, every detail should build trust. The interface disappears into the content, letting Bali's natural beauty do the heavy lifting while providing effortless navigation.

## Color Selection

Inspired by Bali's natural palette: teal ocean waters, coral sunsets, golden sand, and deep volcanic stone.

- **Primary Color**: Deep Teal `oklch(0.48 0.09 210)` #0D7377 - Evokes tropical ocean waters and establishes trustworthy, premium feel; used for primary CTAs and navigation highlights
- **Secondary Colors**:
  - Warm Coral `oklch(0.68 0.17 25)` #FF6B6B - Sunset warmth for secondary actions and attention-drawing elements
  - Golden Sand `oklch(0.87 0.12 85)` #F4D03F - Highlights, star ratings, premium badges
  - Soft Green `oklch(0.65 0.14 155)` #27AE60 - Success states and confirmations
- **Accent Color**: Warm Coral `oklch(0.68 0.17 25)` #FF6B6B - Quick add buttons, hearts, active states, sale badges
- **Foreground/Background Pairings**:
  - Primary Teal `oklch(0.48 0.09 210)`: White text `oklch(1 0 0)` - Ratio 6.2:1 ✓
  - Accent Coral `oklch(0.68 0.17 25)`: White text `oklch(1 0 0)` - Ratio 4.6:1 ✓
  - Background Off-white `oklch(0.98 0 0)`: Charcoal text `oklch(0.25 0 0)` - Ratio 13.1:1 ✓
  - Card White `oklch(1 0 0)`: Primary text `oklch(0.25 0 0)` - Ratio 14.8:1 ✓

## Font Selection

Typography should feel modern and sophisticated while maintaining exceptional readability for body content—editorial quality with tech-forward sensibility.

- **Primary Display**: Plus Jakarta Sans (Bold/SemiBold) - Contemporary geometric sans with friendly roundness for headlines and navigation
- **Body Text**: Inter (Regular/Medium) - Industry-leading readability optimized for screens, perfect for descriptions and details
- **Accent**: Optional Caveat or Dancing Script for special "Local Favorite" callouts (extremely sparingly)

**Typographic Hierarchy**:

- Large Title (Trip Canvas Header): Plus Jakarta Sans Bold / 32px / -0.02em tracking / 1.1 line height
- Section Titles: Plus Jakarta Sans SemiBold / 24px / -0.01em tracking / 1.2 line height
- Experience Title: Plus Jakarta Sans SemiBold / 20px / normal tracking / 1.3 line height
- Body Text: Inter Regular / 16px / normal tracking / 1.6 line height
- Caption/Meta: Inter Medium / 14px / normal tracking / 1.4 line height
- Small Labels: Inter Medium / 12px / 0.01em tracking / 1.3 line height

## Animations

Animations serve as functional signifiers and moments of delight—purposeful, not decorative. Use smooth, physics-based transitions that feel natural: items "fly" to trip bar when added (150ms ease-out), hearts "pop" when favorited (200ms bounce), page transitions slide laterally (300ms ease-in-out), image carousels have subtle parallax depth (subtle). Success states feature celebratory confetti (500ms), and filter applications fade results gracefully (200ms). All motion respects reduced-motion preferences.

## Component Selection

**Components**:

- Dialog for date picker and guest count selectors with custom calendar styling
- Card for experience tiles, trip items, and operator profiles with 16px radius and subtle shadows
- Sheet for bottom-up filter panels and quick-add category selector on mobile
- Tabs for trip view toggle (Calendar/List) and profile sections (Upcoming/Past)
- Button with three variants: primary (teal filled), secondary (coral outline), ghost (text only)
- Input and Textarea for checkout forms with floating labels and validation states
- Badge for operator verification, local business tags, and availability indicators
- Carousel for experience image galleries with dot indicators
- Skeleton for loading states matching card dimensions
- Toast (Sonner) for quick confirmations like "Added to trip" and "Saved to wishlist"
- Progress indicator for checkout flow steps
- Icons from Phosphor (rounded, 2px stroke): Waves, Bicycle, Buildings, ForkKnife, Van, Heart, MagnifyingGlass, Plus, User, MapPin

**Customizations**:

- Custom trip timeline component with connecting lines between day cards
- Custom price calculator with guest count stepper and live total updates
- Custom category cards with background images, gradient overlays, and icon badges
- Custom review component with star rating, country flags, and helpful voting
- Custom empty states with illustrations and contextual CTAs

**States**:

- Buttons: Default with subtle shadow, hover with -2px translate and deeper shadow, active with scale(0.98), disabled at 50% opacity
- Inputs: Default with border, focus with ring in primary teal, error with destructive border and helper text, success with green checkmark
- Cards: Default flat, hover with shadow elevation increase and subtle scale(1.01), selected with teal border
- Images: Lazy load with skeleton, error with placeholder gradient, zoom on tap in detail view

**Icon Selection**:

- Navigation: House (home), Compass (explore), PlusCircle (quick add), Heart (saved), User (profile)
- Categories: Waves (water), Bicycle (land), Buildings (culture), ForkKnife (food), Van (transport), Bed (stays)
- Actions: MagnifyingGlass (search), FunnelSimple (filter), ShareNetwork (share), Calendar (dates), MapPin (location)
- UI: CaretRight (chevron), X (close), Check (success), Warning (alert), Star (rating)

**Spacing**:

- Card padding: 20px
- Screen margins: 20px horizontal, 24px vertical
- Section spacing: 32px between major sections, 16px between related elements
- Grid gaps: 16px for experience grids, 12px for filter chips
- Stack spacing: 8px for tight groups, 16px for moderate, 24px for loose

**Mobile**:

- Bottom tab bar fixed at 64px height with safe area inset
- Category grid shifts from 2 columns to single column under 640px
- Experience cards stack vertically on mobile, 2-column grid on tablet, 3-column on desktop
- Sticky price bar on detail pages becomes full-width bottom sheet on mobile
- Filters shift from inline chips to bottom sheet drawer on mobile
- Trip timeline shows simplified single-column layout on mobile with expand/collapse
- Checkout steps stack vertically with sticky progress bar
- Touch targets minimum 44x44px, increased tap padding on small interactive elements
