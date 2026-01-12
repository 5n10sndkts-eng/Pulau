### Story 19.5: Create Future Destination Teaser

As a user interested in other destinations,
I want to see upcoming destinations,
So that I know the platform is expanding.

**Acceptance Criteria:**

**Given** additional destinations are planned but not active
**When** I view destination selector or explore screen
**Then** "Coming Soon" section shows teaser cards:
  - Destination name and image (grayed or with overlay)
  - "Coming Soon" badge
  - "Notify Me" button
**When** I tap "Notify Me"
**Then** my email added to destination_waitlist table (user_id, destination_id, created_at)
**And** toast: "We'll let you know when [destination] launches!"
**And** inactive destinations don't appear in main browse

