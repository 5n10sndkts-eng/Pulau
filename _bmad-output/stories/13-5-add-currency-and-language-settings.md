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
