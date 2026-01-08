# Epic 18: Bottom Navigation & Screen Architecture

**Goal:** Users navigate seamlessly between 5 primary sections via persistent bottom tab bar: Home/Trip, Explore, Quick Add modal, Saved/Wishlist, and Profile.

### Story 18.1: Implement Discriminated Union Screen Routing
As a developer, I want type-safe screen routing, so that navigation is predictable and bug-free.

**Acceptance Criteria:**
- **Given** state-based routing **When** Screen type defined **Then** discriminated union covers all screens (home, category, experience, etc.)
- **And** App.tsx switch-renders correct component; TS ensures exhaustive handling

### Story 18.2: Build Bottom Tab Navigation Component
As a user, I want persistent bottom navigation, so that I can switch between main sections quickly.

**Acceptance Criteria:**
- **Given** main screen **When** bar renders **Then** I see 5 tabs (Home, Explore, Quick Add, Saved, Profile)
- **And** current tab is highlighted; bar respects `safe-area-inset-bottom`
- **When** tapped **Then** screen changes with 150ms fade; scroll resets to top

### Story 18.3: Implement Quick Add Category Modal
As a traveler, I want quick access to categories from anywhere, so that I can add experiences without extra navigation.

**Acceptance Criteria:**
- **Given** Quick Add tapped **When** modal opens **Then** bottom sheet slides up with 6 category cards
- **When** category tapped **Then** modal dismisses and navigates to that category's browse screen

### Story 18.4: Handle Deep Screens with Back Navigation
As a user navigating deep into the app, I want back buttons to work correctly, so that I can return to previous screens.

**Acceptance Criteria:**
- **Given** deep navigation **When** back button tapped **Then** it returns to previous screen via state history
- **When** bottom tab tapped **Then** it returns to that tab's root; history clears
- **And** browser back button behavior matches the in-app back button
