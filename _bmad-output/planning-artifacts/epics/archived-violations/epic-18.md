## Epic 18: Bottom Navigation & Screen Architecture

**Goal:** Users navigate seamlessly between 5 primary sections via persistent bottom tab bar: Home/Trip, Explore, Quick Add modal, Saved/Wishlist, and Profile.

### Story 18.1: Implement Discriminated Union Screen Routing

As a developer,
I want type-safe screen routing,
So that navigation is predictable and bug-free.

**Acceptance Criteria:**

**Given** the app uses state-based routing (no react-router)
**When** Screen type is defined
**Then** discriminated union covers all screens:
```typescript
type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; step: 1 | 2 | 3 | 4 }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingHistory' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'settings'; section: string }
```
**And** App.tsx switches on screen.type to render correct component
**And** TypeScript ensures exhaustive handling
**And** invalid screens cause compile-time error

### Story 18.2: Build Bottom Tab Navigation Component

As a user,
I want persistent bottom navigation,
So that I can switch between main sections quickly.

**Acceptance Criteria:**

**Given** I am on any main screen
**When** bottom navigation renders
**Then** I see 5 tabs in fixed footer:
  - Home (House icon) - navigates to home screen
  - Explore (Compass icon) - navigates to explore
  - Quick Add (PlusCircle icon, larger, centered) - opens modal
  - Saved (Heart icon) - navigates to wishlist
  - Profile (User icon) - navigates to profile
**And** current tab highlighted (teal fill, label visible)
**And** other tabs show outline icons, no labels
**And** tab bar height 64px + safe area inset (env(safe-area-inset-bottom))
**When** I tap a tab
**Then** screen changes with fade transition (150ms)
**And** scroll position resets to top

### Story 18.3: Implement Quick Add Category Modal

As a traveler,
I want quick access to categories from anywhere,
So that I can add experiences without extra navigation.

**Acceptance Criteria:**

**Given** I tap the Quick Add tab (center plus icon)
**When** the modal opens
**Then** bottom sheet slides up with category grid:
  - 6 category cards (same as home screen)
  - "Quick Add to Trip" header
  - Drag handle at top
  - Tap outside or swipe down to dismiss
**When** I tap a category
**Then** modal dismisses
**And** I navigate to that category's browse screen
**And** browse screen has "Back to Trip" in header (returns to trip builder)

### Story 18.4: Handle Deep Screens with Back Navigation

As a user navigating deep into the app,
I want back buttons to work correctly,
So that I can return to previous screens.

**Acceptance Criteria:**

**Given** I navigate deep into screens (e.g., Home → Category → Experience → Checkout)
**When** I see back button in header
**Then** tapping back returns to previous screen
**And** navigation history maintained in state array
**When** I tap bottom tab
**Then** I return to that tab's root screen (not deep screen)
**And** navigation history clears for that tab
**When** I use browser back button
**Then** behavior matches in-app back button
**And** no unexpected navigation loops

---
