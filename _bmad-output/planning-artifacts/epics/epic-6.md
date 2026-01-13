## Epic 6: Experience Discovery & Browse

**Goal:** Travelers browse categorized experiences (6 categories), filter by preferences, search, view rich detail pages with image carousels, operator profiles, reviews, meeting points, and inclusions.

### Story 6.1: Create Home Screen with Category Grid

As a traveler,
I want to see experience categories on the home screen,
So that I can browse activities that interest me.

**Acceptance Criteria:**

**Given** I am logged in and on the home screen
**When** the screen loads
**Then** I see 6 category cards in a 2x3 grid (single column on mobile <640px):

- Water Adventures (icon: Waves, background: ocean image)
- Land Explorations (icon: Bicycle, background: rice terrace image)
- Culture & Experiences (icon: Buildings, background: temple image)
- Food & Nightlife (icon: ForkKnife, background: food image)
- Getting Around (icon: Van, background: scooter image)
- Destinations & Stays (icon: Bed, background: villa image)
  **And** each card has icon, background image with gradient overlay, category name, and tagline
  **When** I tap a category card
  **Then** I navigate to the category browse screen for that category
  **And** smooth slide transition animation plays (300ms ease-in-out)
  **And** categories load from categories table (id, name, slug, icon, tagline, background_image_url)

### Story 6.2: Build Category Browse Screen with Experience List

As a traveler,
I want to browse all experiences in a category,
So that I can see what's available.

**Acceptance Criteria:**

**Given** I tapped a category from Story 6.1
**When** the category browse screen loads
**Then** header shows: back arrow, category title (e.g., "Water Adventures"), search icon
**And** experiences load from experiences table filtered by category and status = "active"
**And** each experience card displays:

- Hero image (16:9 ratio, rounded corners 12px)
- Provider badge overlay (vendor business_name)
- Experience title below image
- Quick stats: Duration icon + hours, Group size icon + max people, Star icon + rating (avg)
- Price: "From $XX / person" (formatted with currency)
- Two buttons: "+ Quick Add" (primary teal), "See Details" (text link)
  **And** cards are in vertical scrolling list
  **And** list shows skeleton loading state while fetching
  **And** infinite scroll loads more experiences as I scroll down (20 per page)

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

### Story 6.4: Add Experience Search Functionality

As a traveler,
I want to search for experiences by keyword,
So that I can quickly find specific activities.

**Acceptance Criteria:**

**Given** I am on any category browse screen
**When** I tap the search icon in header
**Then** a search input field expands below header
**When** I type a search query (e.g., "snorkeling", "temple", "cooking")
**Then** experiences are filtered in real-time as I type (debounced 300ms)
**And** search matches against: experience title, description, subcategory, vendor business_name, tags
**And** results display with search terms highlighted
**When** no results match
**Then** empty state shows: friendly illustration, "No experiences match 'query'", "Try different keywords or [Browse All]"
**When** I clear search or tap back
**Then** full experience list returns
**And** search queries log to search_log table (user_id, query, results_count, searched_at) for analytics

### Story 6.5: Create Detailed Experience Page

As a traveler,
I want to view comprehensive information about an experience,
So that I can make an informed booking decision.

**Acceptance Criteria:**

**Given** I tapped "See Details" or an experience card from browse
**When** the experience detail page loads
**Then** I see a full-width image carousel (swipeable, 4-6 images from experience_images ordered by display_order)
**And** carousel has dot indicators at bottom
**And** floating back button (top left, semi-transparent) and heart/save button (top right)
**And** Quick Info Bar displays icons: Duration, Group size, Difficulty, Languages
**And** "About This Experience" section shows full description from experiences table
**And** page loads experience data by experience_id from experiences table
**And** all sections scroll vertically
**And** images lazy load as user scrolls
**And** parallax effect on hero image as user scrolls (subtle)

### Story 6.6: Display "What's Included" Section

As a traveler viewing an experience,
I want to see what's included in the price,
So that I know what I'm paying for.

**Acceptance Criteria:**

**Given** I am on an experience detail page from Story 6.5
**When** I scroll to "What's Included" section
**Then** I see two subsections:

- "What's Included" with green checkmarks (✓)
- "Not Included" with X marks (✗)
  **And** included items load from experience_inclusions where is_included = true
  **And** excluded items load from experience_inclusions where is_included = false
  **And** each item displays as a list item with icon and text
  **And** section has white card background with 20px padding
  **And** items are displayed in the order they were added by vendor

### Story 6.7: Show Operator Profile on Experience Page

As a traveler,
I want to learn about the local operator,
So that I feel confident booking with them.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Meet Your Local Operator" section
**Then** I see a card with warm coral background (oklch(0.68 0.17 25) at 10% opacity)
**And** card displays:

- Circular vendor photo (from vendors.photo_url, 80px diameter)
- Vendor business_name
- Tagline "Family operated since {vendors.since_year}"
- Short bio (from vendors.bio, max 300 chars with "read more" if truncated)
- Badge row: "Local Business", "Verified Partner" (if vendors.verified = true), "Responds in X hours" (from vendors.avg_response_time)
  **And** "Message Operator" button (secondary coral outline)
  **When** I tap vendor name or photo
  **Then** vendor full profile modal opens with complete bio and all their experiences

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

### Story 6.9: Add Meeting Point Information

As a traveler,
I want to know where to meet for the experience,
So that I can plan my arrival.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Where You'll Meet" section
**Then** I see:

- Embedded static map image showing meeting location (via Google Maps Static API or Mapbox)
- Meeting point name (from experiences.meeting_point_name)
- Full address (from experiences.meeting_point_address)
- Copy icon button next to address (copies to clipboard on tap)
- "Get Directions" link (opens default maps app with coordinates)
- Additional instructions (from experiences.meeting_instructions) if provided
  **And** map marker shows at experiences.meeting_point_lat, meeting_point_lng
  **When** I tap "Get Directions"
  **Then** deep link opens to: Google Maps on Android, Apple Maps on iOS with destination pre-filled

### Story 6.10: Show Cancellation Policy and Policies

As a traveler,
I want to understand the cancellation policy,
So that I know my options if plans change.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Good to Know" section
**Then** I see subsections:

- **Cancellation Policy**: Friendly language (from experiences.cancellation_policy), e.g., "Free cancellation up to 24 hours before. Full refund, no questions asked."
- **What to Bring**: Comma-separated list (from experiences.what_to_bring), e.g., "Sunscreen, swimwear, camera"
- **Health & Safety**: Any relevant notes (from experiences.health_safety_notes)
  **And** section has clear typography hierarchy (title 20px bold, content 16px regular)
  **And** policies display with bullet points for easy scanning

---
