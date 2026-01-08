# Epic 6: Experience Discovery & Browse

**Goal:** Travelers browse categorized experiences (6 categories), filter by preferences, search, view rich detail pages with image carousels, operator profiles, reviews, meeting points, and inclusions.

### Story 6.1: Create Home Screen with Category Grid
As a traveler, I want to see experience categories on the home screen, so that I can browse activities that interest me.

**Acceptance Criteria:**
- **Given** I am logged in **When** home screen loads **Then** I see a 2x3 grid of 6 category cards with icons and background images
- **When** I tap a card **Then** I navigate to the category browse screen with a slide animation

### Story 6.2: Build Category Browse Screen with Experience List
As a traveler, I want to browse all experiences in a category, so that I can see what's available.

**Acceptance Criteria:**
- **Given** a selected category **When** screen loads **Then** I see a vertical list of active experiences
- **And** each card shows hero image, title, stats, price, and "Quick Add" / "See Details" buttons
- **And** infinite scroll loads 20 items at a time

### Story 6.3: Implement Horizontal Filter Chips
As a traveler browsing a category, I want to filter experiences by my preferences, so that I find relevant options quickly.

**Acceptance Criteria:**
- **Given** on browse screen **Then** I see scrollable chips for Beginner, Half Day, Full Day, Private, Price, and Top Rated
- **When** I tap a chip **Then** the list updates instantly (<100ms) with combined AND logic

### Story 6.4: Add Experience Search Functionality
As a traveler, I want to search for experiences by keyword, so that I can quickly find specific activities.

**Acceptance Criteria:**
- **Given** on browse screen **When** I tap search icon and type **Then** experiences are filtered in real-time (300ms debounce)
- **And** search matches title, description, tags, and vendor name
- **And** empty state shows when no results match

### Story 6.5: Create Detailed Experience Page
As a traveler, I want to view comprehensive information about an experience, so that I can make an informed booking decision.

**Acceptance Criteria:**
- **Given** a selected experience **When** page loads **Then** I see an image carousel, quick info bar, and full description
- **And** images lazy load with a subtle parallax effect on the hero

### Story 6.6: Display "What's Included" Section
As a traveler viewing an experience, I want to see what's included in the price, so that I know what I'm paying for.

**Acceptance Criteria:**
- **Given** on detail page **When** I scroll to this section **Then** I see subsections for "What's Included" (checkmarks) and "Not Included" (X marks)
- **And** items display in the order added by vendor

### Story 6.7: Show Operator Profile on Experience Page
As a traveler, I want to learn about the local operator, so that I feel confident booking with them.

**Acceptance Criteria:**
- **Given** on detail page **When** I scroll to this section **Then** I see a card with vendor photo, name, bio, and verification badges
- **When** I tap the vendor **Then** a full profile modal opens

### Story 6.8: Display Reviews and Ratings
As a traveler, I want to read reviews from other travelers, so that I can gauge experience quality.

**Acceptance Criteria:**
- **Given** on detail page **When** I scroll to this section **Then** I see average rating, breakdown bars, and user photos
- **And** latest 3 review cards show reviewer name, stars, date, and helpful count
- **When** I tap "See all reviews" **Then** a modal opens with infinite scroll

### Story 6.9: Add Meeting Point Information
As a traveler, I want to know where to meet for the experience, so that I can plan my arrival.

**Acceptance Criteria:**
- **Given** on detail page **When** I scroll to this section **Then** I see a map, point name, address, and copy button
- **When** I tap "Get Directions" **Then** native maps app opens with coordinates

### Story 6.10: Show Cancellation Policy and Policies
As a traveler, I want to understand the cancellation policy, so that I know my options if plans change.

**Acceptance Criteria:**
- **Given** on detail page **When** I scroll to this section **Then** I see subsections for Cancellation Policy, What to Bring, and Health & Safety
- **And** content is displayed with clear typography and bullet points
