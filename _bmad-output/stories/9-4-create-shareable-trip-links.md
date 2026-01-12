### Story 9.4: Create Shareable Trip Links

As a traveler,
I want to share my trip plan with others,
So that travel companions can see the itinerary.

**Acceptance Criteria:**

**Given** I am on the trip builder screen
**When** I tap the share button (top right)
**Then** a share modal opens with options:
  - "Copy Link" - copies shareable URL to clipboard
  - "Share via..." - opens native share sheet (mobile)
**And** shareable link format: `https://pulau.app/trip/{share_token}`
**And** share_token is a unique UUID stored in trips.share_token
**When** someone opens the shared link
**Then** they see a read-only view of the trip
**And** read-only view shows: trip name, dates, all items with details, total price
**And** "Create your own trip" CTA at bottom
**And** shared trips do not require login to view

---
