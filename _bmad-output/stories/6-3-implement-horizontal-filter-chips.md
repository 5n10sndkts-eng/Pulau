### Story 6.3: Implement Horizontal Filter Chips

As a traveler browsing a category,
I want to filter experiences by my preferences,
So that I find relevant options quickly.

**Acceptance Criteria:**

**Given** I am on a category browse screen from Story 6.2
**When** the screen loads
**Then** I see horizontally scrollable filter chips above the experience list:
  - [All] [Beginner Friendly] [Half Day] [Full Day] [Private] [Group] [Under $50] [Under $100] [Top Rated]
**When** I tap a filter chip
**Then** chip highlights with teal background and white text
**And** experience list updates instantly (<100ms) to show only matching experiences
**And** filtering logic:
  - "Beginner Friendly" → difficulty = "Easy"
  - "Half Day" → duration_hours <= 4
  - "Full Day" → duration_hours >= 6
  - "Private" → group_size_max <= 4
  - "Under $50" → price_amount < 50
  - "Top Rated" → avg rating >= 4.5
**And** multiple filters combine with AND logic
**When** I tap an active chip again
**Then** filter is removed and list refreshes
**And** "All" chip clears all filters
