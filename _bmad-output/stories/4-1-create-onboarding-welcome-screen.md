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
