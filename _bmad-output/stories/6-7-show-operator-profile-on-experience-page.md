### Story 6.7: Show Operator Profile on Experience Page

As a traveler,
I want to learn about the local operator,
So that I feel confident booking with them.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Meet Your Local Operator" section
**Then** I see a card with warm coral background (oklch(0.68 0.17 25) at 10% opacity)
**And** card displays:

- Circular vendor photo (from vendors.photo_url, 80px diameter)
- Vendor business_name
- Tagline "Family operated since {vendors.since_year}"
- Short bio (from vendors.bio, max 300 chars with "read more" if truncated)
- Badge row: "Local Business", "Verified Partner" (if vendors.verified = true), "Responds in X hours" (from vendors.avg_response_time)
  **And** "Message Operator" button (secondary coral outline)
  **When** I tap vendor name or photo
  **Then** vendor full profile modal opens with complete bio and all their experiences
