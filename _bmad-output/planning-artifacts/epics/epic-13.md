## Epic 13: Profile & Settings Management

**Goal:** Users manage comprehensive profile (photo, name, member since), payment methods, notification preferences, currency selection, language settings, and access help, about, terms, and privacy pages.

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

### Story 13.2: Create Edit Profile Screen

As a user,
I want to edit my profile information,
So that my account details are current.

**Acceptance Criteria:**

**Given** I tap "Edit Profile" from profile screen
**When** the edit profile screen loads
**Then** I see form with current values:
  - Profile photo with "Change Photo" overlay
  - First Name input
  - Last Name input
  - Phone Number input
  - Email (read-only, displays "Contact support to change")
**When** I tap profile photo
**Then** options appear: "Take Photo", "Choose from Library", "Remove Photo"
**And** selected photo crops to square and uploads
**When** I save changes
**Then** user_profiles table updates
**And** toast displays "Profile updated"
**And** I return to profile screen with updated info

### Story 13.3: Build Payment Methods Management

As a user,
I want to manage my saved payment methods,
So that checkout is convenient.

**Acceptance Criteria:**

**Given** I tap "Payment Methods" from profile
**When** the payment methods screen loads
**Then** I see list of saved cards:
  - Card brand icon (Visa/Mastercard/Amex)
  - "•••• [last 4 digits]"
  - Expiry date
  - "Default" badge if is_default = true
**And** "+ Add New Card" button at bottom
**When** I tap a card
**Then** options: "Set as Default", "Remove"
**When** I tap "Remove"
**Then** confirmation modal: "Remove this card?"
**And** on confirm, card soft-deleted (deleted_at set)
**When** I tap "Add New Card"
**Then** card entry form opens (same as checkout)

### Story 13.4: Implement Notification Preferences

As a user,
I want to control what notifications I receive,
So that I only get relevant alerts.

**Acceptance Criteria:**

**Given** I tap "Notifications" from profile
**When** the notifications settings screen loads
**Then** I see toggle switches for:
  - Booking Confirmations (default: on)
  - Trip Reminders (default: on)
  - Price Drops on Saved (default: on)
  - New Experiences (default: off)
  - Marketing & Promotions (default: off)
**And** toggles save immediately on change to user_notification_preferences table
**And** toggle uses primary teal color when on

### Story 13.5: Add Currency and Language Settings

As an international traveler,
I want to set my preferred currency and language,
So that the app displays in my preferences.

**Acceptance Criteria:**

**Given** I tap "Preferences" from profile
**When** the preferences screen loads
**Then** I see:
  - Currency selector: USD (default), EUR, GBP, AUD, SGD, IDR
  - Language selector: English (default), Indonesian, Mandarin
**When** I change currency
**Then** all prices throughout app convert and display in new currency
**And** exchange rates fetched daily and cached
**And** user_preferences.currency persists selection
**When** I change language
**Then** app interface text changes to selected language
**And** user_preferences.language persists selection
**And** page refreshes to apply language change

### Story 13.6: Create Help & Support Screen

As a user needing assistance,
I want to access help and support,
So that I can resolve issues.

**Acceptance Criteria:**

**Given** I tap "Help & Support" from profile
**When** the help screen loads
**Then** I see sections:
  - FAQ accordion (common questions)
  - "Contact Us" with email link
  - "Live Chat" button (if implemented)
  - "Report a Problem" form link
**And** FAQ topics: Booking, Payments, Cancellations, Account
**When** I tap FAQ question
**Then** answer expands below
**When** I tap "Contact Us"
**Then** email client opens with support@pulau.app

### Story 13.7: Add About, Terms, and Privacy Pages

As a user,
I want to access legal and company information,
So that I understand the service.

**Acceptance Criteria:**

**Given** I tap "About Pulau" from profile
**When** the about screen loads
**Then** I see:
  - Pulau logo and tagline
  - App version number
  - Brief company description
  - Links: "Terms of Service", "Privacy Policy", "Licenses"
**When** I tap Terms or Privacy
**Then** respective policy page opens (markdown rendered or webview)
**And** content loads from static files or CMS
**And** pages are scrollable with proper formatting

---
