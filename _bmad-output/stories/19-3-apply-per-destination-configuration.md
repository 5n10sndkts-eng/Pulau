### Story 19.3: Apply Per-Destination Configuration

As a traveler in different destinations,
I want the app to adapt to local settings,
So that currency and timezone are correct.

**Acceptance Criteria:**

**Given** I select a destination
**When** destination configuration applies
**Then** currency displays in destination's default (can override in settings)
**And** experience times shown in destination timezone
**And** date formats respect locale
**And** destination-specific content (guides, stories) filters correctly
**When** destination changes currency from USD to IDR
**Then** prices convert using exchange rates
**And** price formatting changes (e.g., "Rp 500,000" vs "$50")
