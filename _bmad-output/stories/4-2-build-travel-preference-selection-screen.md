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
