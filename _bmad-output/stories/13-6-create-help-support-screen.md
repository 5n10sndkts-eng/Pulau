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
