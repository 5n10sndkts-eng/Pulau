### Story 12.3: Create Hidden Gems Section

As a traveler seeking unique experiences,
I want to discover lesser-known gems,
So that I can have authentic local experiences.

**Acceptance Criteria:**

**Given** I am on the Explore screen
**When** "Hidden Gems" section loads
**Then** I see horizontal carousel of experiences
**And** hidden gems identified by: rating >= 4.5 AND booking_count < 50 AND review_count >= 5
**And** cards display: image, title, "💎 Local Secret" badge, rating, price
**And** badge uses Golden Sand color (#F4D03F)
**When** I tap "See All"
**Then** I navigate to filtered browse showing all hidden gems
