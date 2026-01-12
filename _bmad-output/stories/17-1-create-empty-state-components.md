### Story 17.1: Create Empty State Components

As a user with no data,
I want to see helpful empty states,
So that I know what to do next.

**Acceptance Criteria:**

**Given** a list/screen has no data
**When** empty state renders
**Then** appropriate illustration and messaging displays:
  - Empty Trip: suitcase illustration, "Your trip canvas is empty", "Start Exploring" CTA
  - No Search Results: magnifying glass, "No experiences match '[query]'", "Try different keywords" + "Clear Filters"
  - Empty Wishlist: heart outline, "Your wishlist is empty", "Browse Experiences" CTA
  - No Bookings: calendar, "No upcoming trips", "Plan Your Adventure" CTA
  - No Filter Results: filter icon, "No experiences match these filters", "Clear Filters" button
**And** CTAs navigate to appropriate screens
**And** illustrations are lightweight SVGs
