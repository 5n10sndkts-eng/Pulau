# Epic 4: Onboarding & Personalization

**Goal:** New users complete 3-screen guided onboarding flow, set travel preferences (style/group/budget), optionally add dates, and receive personalized "Perfect for you" recommendations.

**Phase:** Phase 2 (After auth)
**Dependencies:** Epic 2 (User Auth)
**Storage:** Per ADR-001, preferences stored in `pulau_preferences_{userId}` KV namespace

---

### Story 4.1: Create Onboarding Welcome Screen
As a new user opening the app, I want to see a welcoming first impression, so that I understand what the app offers.

**Acceptance Criteria:**
- **Given** I am a first-time user **When** onboarding starts **Then** Screen 1 displays a Bali hero image with "Pulau" logo and tagline
- **When** I tap "Get Started" **Then** I proceed to the Preference Selector
- **And** progress indicator shows "1 of 3"

### Story 4.2: Build Travel Preference Selection Screen
As a new user going through onboarding, I want to select my travel preferences, so that I receive personalized experience recommendations.

**Acceptance Criteria:**
- **Given** I am on onboarding Screen 2 **Then** I see sections for Travel Style, Group Type, and Budget Feel
- **When** I select preferences **Then** they highlight with a teal border
- **When** I tap "Continue" **Then** preferences are saved to the `pulau_preferences_{userId}` KV namespace

### Story 4.3: Add Optional Trip Dates Screen
As a user completing onboarding, I want to optionally set my trip dates, so that the app can filter experiences by availability.

**Acceptance Criteria:**
- **Given** I am on onboarding Screen 3 **Then** I see "Arrival Date" and "Departure Date" pickers
- **And** I see a "Skip for now" link
- **When** I tap "Continue" or "Skip" **Then** onboarding completes and redirects to Home
- **And** onboarding_completed flag is set to true

### Story 4.4: Implement Personalized Recommendations Engine
As a user who completed onboarding, I want to see "Perfect for you" experiences, so that I discover relevant activities quickly.

**Acceptance Criteria:**
- **Given** I completed onboarding **When** I browse categories **Then** experiences are scored based on my preferences
- **And** top 3 highest-scoring experiences display a "Perfect for you" banner
- **And** these experiences appear at the top of the list
