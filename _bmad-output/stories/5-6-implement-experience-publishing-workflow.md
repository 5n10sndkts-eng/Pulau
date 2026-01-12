### Story 5.6: Implement Experience Publishing Workflow

As a vendor,
I want to publish my draft experience to make it live,
So that travelers can discover and book it.

**Acceptance Criteria:**

**Given** I have a draft experience with all required fields completed
**When** I click "Publish Experience"
**Then** system validates:
  - Title, description, price, duration, group size are filled
  - At least 3 images are uploaded
  - At least one availability date is set
  - Meeting point information is complete
**When** validation passes
**Then** experience status changes from "draft" to "active"
**And** experience becomes visible in customer search and browse
**And** published_at timestamp is set
**And** I see confirmation "Experience is now live!"
**When** validation fails
**Then** specific missing items are highlighted
**And** error message lists requirements: "Complete these before publishing: [list]"

---
