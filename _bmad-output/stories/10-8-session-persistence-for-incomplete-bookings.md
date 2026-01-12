### Story 10.8: Session Persistence for Incomplete Bookings

As a traveler who gets interrupted during checkout,
I want my progress saved,
So that I can resume where I left off.

**Acceptance Criteria:**

**Given** I am partway through checkout and close the browser/app
**When** I return to the app within 24 hours
**Then** I see a prompt: "Continue your booking?"
**And** my checkout progress is restored (step, form data, trip items)
**And** checkout session stored in Spark useKV with expiry timestamp
**When** session is older than 24 hours
**Then** session is cleared
**And** user starts fresh from trip builder
**When** I complete booking or explicitly cancel
**Then** checkout session is cleared

---
