# Epic 13: Profile & Settings Management

**Goal:** Users manage comprehensive profile (photo, name, member since), payment methods, notification preferences, currency selection, language settings, and access help, about, terms, and privacy pages.

### Story 13.1: Build Profile Screen Layout
As a logged-in user, I want to view and access my profile settings, so that I can manage my account.

**Acceptance Criteria:**
- **Given** "Profile" tab **When** screen loads **Then** I see profile header with photo, name, and member date
- **And** menu sections for My Trips, Saved, Payment Methods, Notifications, Preferences, Help, and Logout
- **And** each menu item has icons and chevrons

### Story 13.2: Create Edit Profile Screen
As a user, I want to edit my profile information, so that my account details are current.

**Acceptance Criteria:**
- **Given** "Edit Profile" tapped **When** screen loads **Then** I see a form with name and phone number (email is read-only)
- **When** photo tapped **Then** I can take/choose a photo; selected photo uploads to user_profiles
- **When** saved **Then** toast shows success and I return to the profile view

### Story 13.3: Build Payment Methods Management
As a user, I want to manage my saved payment methods, so that checkout is convenient.

**Acceptance Criteria:**
- **Given** Payment Methods screen **When** loaded **Then** I see a list of saved card brands, last 4 digits, and default badges
- **And** "+ Add New Card" button opens the payment entry form
- **When** removing a card **Then** confirmation modal appears before soft-deletion

### Story 13.4: Implement Notification Preferences
As a user, I want to control what notifications I receive, so that I only get relevant alerts.

**Acceptance Criteria:**
- **Given** Notifications settings **When** screen loads **Then** I see toggles for Booking, Reminders, Saved alerts, and Marketing
- **And** changes save immediately to the database

### Story 13.5: Add Currency and Language Settings
As an international traveler, I want to set my preferred currency and language, so that the app displays in my preferences.

**Acceptance Criteria:**
- **Given** Preferences screen **When** currency changed **Then** all prices across the app convert and display in the new currency
- **When** language changed **Then** interface text updates to the selected language and the page refreshes
- **And** both preferences persist in the user's account

### Story 13.6: Create Help & Support Screen
As a user needing assistance, I want to access help and support, so that I can resolve issues.

**Acceptance Criteria:**
- **Given** Help screen **When** loaded **Then** I see a FAQ accordion for Bookings/Payments/Cancellations
- **And** "Contact Us" link opens the system email client
- **When** FAQ clicked **Then** answer expands below

### Story 13.7: Add About, Terms, and Privacy Pages
As a user, I want to access legal and company information, so that I understand the service.

**Acceptance Criteria:**
- **Given** About screen **When** page loads **Then** I see Pulau logo, tagline, version, and links to legal policies
- **When** policy link tapped **Then** respective markdown/webview page opens with scrollable content
