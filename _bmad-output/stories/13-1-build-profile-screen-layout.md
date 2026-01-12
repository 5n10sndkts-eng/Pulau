### Story 13.1: Build Profile Screen Layout

As a logged-in user,
I want to view and access my profile settings,
So that I can manage my account.

**Acceptance Criteria:**

**Given** I tap "Profile" in bottom navigation (User icon)
**When** the Profile screen loads
**Then** I see profile header:
  - Profile photo (circular, 80px, or placeholder avatar)
  - Full name
  - "Member since [month year]"
  - "Edit Profile" button
**And** below header, menu sections:
  - My Trips (→ booking history)
  - Saved Experiences (→ wishlist)
  - Payment Methods
  - Notifications
  - Preferences (currency, language)
  - Help & Support
  - About Pulau
  - Log Out
**And** each menu item has icon, label, and chevron
