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
