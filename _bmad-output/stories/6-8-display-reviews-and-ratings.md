### Story 6.8: Display Reviews and Ratings

As a traveler,
I want to read reviews from other travelers,
So that I can gauge experience quality.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "What Travelers Say" section
**Then** I see:
  - Large rating display: "4.9" with star icon and "127 reviews"
  - Rating breakdown bars: 5 star (90%), 4 star (7%), 3 star (2%), 2 star (1%), 1 star (0%)
**And** "Traveler Photos" subsection shows horizontal scrollable row of user-submitted review photos
**And** review cards display (latest 3 shown, with "See all reviews" link):
  - Reviewer first name and country flag emoji (from reviews.reviewer_country)
  - Date: "December 2024" (formatted from reviews.created_at)
  - Star rating (1-5 stars as icons)
  - Review text (truncated at 3 lines with "read more" link)
  - "Helpful" button with count (reviews.helpful_count)
**And** reviews load from reviews table filtered by experience_id, ordered by created_at DESC
**And** average rating is calculated from AVG(reviews.rating)
**When** I tap "See all reviews"
**Then** modal opens showing all reviews with infinite scroll
