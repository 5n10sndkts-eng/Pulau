### Story 12.1: Build Explore Screen Layout

As a traveler looking for inspiration,
I want a discovery-focused explore screen,
So that I can find interesting experiences beyond categories.

**Acceptance Criteria:**

**Given** I tap "Explore" in bottom navigation (Compass icon)
**When** the Explore screen loads
**Then** I see vertically scrolling sections:

- Search bar at top (sticky)
- "Trending in Bali" horizontal carousel
- "Hidden Gems" horizontal carousel
- "Limited Availability" horizontal carousel
- "Destination Guides" grid (2 columns)
- "Stories from Travelers" vertical list
  **And** each section has "See All" link
  **And** pull-to-refresh triggers content refresh
  **And** skeleton loading states while data loads
