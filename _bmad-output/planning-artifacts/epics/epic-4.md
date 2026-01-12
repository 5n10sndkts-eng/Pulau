## Epic 4: Onboarding & Personalization

**Goal:** New users complete 3-screen guided onboarding flow, set travel preferences (style/group/budget), optionally add dates, and receive personalized "Perfect for you" recommendations.

### Story 4.1: Create Onboarding Welcome Screen

As a new user opening the app,
I want to see a welcoming first impression,
So that I understand what the app offers.

**Acceptance Criteria:**

**Given** I am a first-time user who just registered
**When** the onboarding flow starts
**Then** Screen 1 displays a full-screen Bali hero image with subtle parallax
**And** app logo "Pulau" is overlaid on image
**And** tagline "Build Your Bali Dream" displays below logo
**And** primary button "Get Started" is prominently displayed (teal background, white text)
**When** I tap "Get Started"
**Then** I proceed to Screen 2 (Preference Selector)
**And** progress indicator shows "1 of 3" at top
**And** image loads with skeleton while fetching

### Story 4.2: Build Travel Preference Selection Screen

As a new user going through onboarding,
I want to select my travel preferences,
So that I receive personalized experience recommendations.

**Acceptance Criteria:**

**Given** I am on onboarding Screen 2
**When** the screen loads
**Then** I see three preference sections with tappable cards:
  - Travel Style: Adventure, Relaxation, Culture, Mix of Everything
  - Group Type: Solo, Couple, Friends, Family
  - Budget Feel: Budget-Conscious, Mid-Range, Luxury
**When** I tap a preference card
**Then** the card highlights with teal border and checkmark icon
**And** multiple selections are allowed within each section
**And** at least one selection per section is required before continuing
**When** I tap "Continue" with valid selections
**Then** preferences are saved to user_preferences table (user_id, travel_style[], group_type, budget_level, created_at)
**And** I proceed to Screen 3 (Trip Dates)
**And** progress indicator shows "2 of 3"

### Story 4.3: Add Optional Trip Dates Screen

As a user completing onboarding,
I want to optionally set my trip dates,
So that the app can filter experiences by availability.

**Acceptance Criteria:**

**Given** I am on onboarding Screen 3
**When** the screen loads
**Then** I see two date pickers: "Arrival Date" and "Departure Date"
**And** date pickers default to empty (no dates selected)
**And** I see "Skip for now - Just browsing" link at bottom
**When** I select an arrival date
**Then** departure date picker minimum is set to arrival date + 1 day
**When** I select valid dates
**Then** dates are saved to user_preferences table (trip_start_date, trip_end_date)
**When** I tap "Continue" OR "Skip for now"
**Then** onboarding flow completes
**And** user is redirected to Home screen (/home)
**And** onboarding_completed flag is set to true in user record
**And** if skipped, trip_start_date and trip_end_date remain null

### Story 4.4: Implement Personalized Recommendations Engine

As a user who completed onboarding,
I want to see "Perfect for you" experiences,
So that I discover relevant activities quickly.

**Acceptance Criteria:**

**Given** I completed onboarding with preferences saved
**When** I browse any experience category
**Then** experiences are scored based on my preferences:
  - +10 points if experience.difficulty matches my travel_style (Adventure → Moderate/Challenging, Relaxation → Easy, Culture → Easy/Moderate)
  - +15 points if experience.tags overlap with travel_style
  - +5 points if experience.price_per_person fits my budget_level
  - +5 points if experience.group_size max >= my group_type typical size
**And** top 3 highest-scoring experiences in category display "Perfect for you" banner
**And** "Perfect for you" badge has warm coral background with star icon
**And** these experiences appear at top of category list
**And** recommendation algorithm logs scores to recommendations_log table for future ML improvements

### Story 4.5: Complete Onboarding with Main App Navigation

As a new traveler who completed onboarding,
I want to access the main travel platform features,
So that I can immediately start discovering experiences.

**Acceptance Criteria:**

**Given** I have completed the 3-screen onboarding flow
**When** I tap "Start Exploring"
**Then** the main app loads with 5-tab bottom navigation (Explore, Trips, Wishlist, Bookings, Profile)
**And** navigation uses discriminated union routing for type safety
**And** "Explore" tab is selected by default showing personalized content
**And** floating action button displays for quick trip addition
**And** navigation state persists across app sessions
**And** each tab loads content relevant to my onboarding preferences
**And** navigation tabs highlight with deep teal color when selected
**And** tab icons use Phosphor icon system with rounded style

---
