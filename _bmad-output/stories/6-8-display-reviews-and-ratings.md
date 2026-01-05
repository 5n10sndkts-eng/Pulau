# Story 6.8: Display Reviews and Ratings

Status: ready-for-dev

## Story

As a traveler,
I want to read reviews from other travelers,
so that I can gauge experience quality.

## Acceptance Criteria

1. **Given** I am on an experience detail page **When** I scroll to "What Travelers Say" section **Then** I see:
   - Large rating display: "4.9" with star icon and "127 reviews"
   - Rating breakdown bars: 5 star (90%), 4 star (7%), 3 star (2%), 2 star (1%), 1 star (0%)
2. "Traveler Photos" subsection shows horizontal scrollable row of user-submitted review photos
3. Review cards display (latest 3 shown, with "See all reviews" link):
   - Reviewer first name and country flag emoji (from reviews.reviewer_country)
   - Date: "December 2024" (formatted from reviews.created_at)
   - Star rating (1-5 stars as icons)
   - Review text (truncated at 3 lines with "read more" link)
   - "Helpful" button with count (reviews.helpful_count)
4. Reviews load from reviews table filtered by experience_id, ordered by created_at DESC
5. Average rating is calculated from AVG(reviews.rating)
6. **When** I tap "See all reviews" **Then** modal opens showing all reviews with infinite scroll

## Tasks / Subtasks

- [ ] Task 1: Create ReviewsSection component (AC: #1)
  - [ ] Create `src/components/experience/ReviewsSection.tsx`
  - [ ] Section header: "What Travelers Say"
  - [ ] Large rating display: number + filled star
  - [ ] Review count: "127 reviews" format
  - [ ] Calculate average from reviews data
- [ ] Task 2: Build rating breakdown bars (AC: #1)
  - [ ] Create RatingBreakdown component
  - [ ] 5 horizontal bars (5-star to 1-star)
  - [ ] Each bar shows star count, progress bar, percentage
  - [ ] Progress bar filled with teal color
  - [ ] Calculate percentages from review distribution
- [ ] Task 3: Build traveler photos section (AC: #2)
  - [ ] Create TravelerPhotos horizontal scroll
  - [ ] Display photos attached to reviews
  - [ ] 80x80px thumbnails with rounded corners
  - [ ] Tap photo to view full size in modal
  - [ ] Handle case when no photos exist
- [ ] Task 4: Create ReviewCard component (AC: #3)
  - [ ] Display reviewer first name + country flag
  - [ ] Date formatted: "December 2024"
  - [ ] Star icons (filled for rating, outline for remainder)
  - [ ] Review text truncated at 3 lines
  - [ ] "read more" to expand text
  - [ ] "Helpful" button with count
- [ ] Task 5: Implement review list (AC: #3, #4, #5)
  - [ ] Fetch reviews by experience_id
  - [ ] Order by created_at DESC
  - [ ] Show only first 3 reviews
  - [ ] Add "See all reviews" link at bottom
  - [ ] Calculate AVG for rating display
- [ ] Task 6: Create all reviews modal (AC: #6)
  - [ ] Full-screen modal with header
  - [ ] Infinite scroll for all reviews
  - [ ] Filter/sort options (optional)
  - [ ] Close button returns to detail page

## Dev Notes

- Reviews build social proof and trust
- Country flag adds authenticity (use emoji flags)
- "Helpful" count surfaces useful reviews
- Consider verified purchase badge (future)

### References

- [Source: epics.md#Story 6.8]
- [Source: prd/pulau-prd.md#Reviews and Ratings]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

