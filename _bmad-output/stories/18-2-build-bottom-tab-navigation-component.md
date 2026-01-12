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
