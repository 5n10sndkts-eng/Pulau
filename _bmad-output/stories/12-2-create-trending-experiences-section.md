### Story 12.2: Create Trending Experiences Section

As a traveler,
I want to see what's popular,
So that I can discover highly-booked experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Trending in Bali" section loads
**Then** I see horizontal carousel of 6-10 experience cards
**And** trending calculated by: booking_count in last 30 days, minimum 10 bookings
**And** cards display: image, title, "🔥 X booked this week" badge, price
**And** cards are slightly larger than category browse cards
**When** I swipe horizontally
**Then** carousel scrolls smoothly with snap-to-card behavior
**When** I tap a trending card
**Then** I navigate to experience detail page
