### Story 10.3: Build Step 2 - Traveler Details Form

As a traveler in checkout,
I want to enter my contact and traveler information,
So that operators can reach me.

**Acceptance Criteria:**

**Given** I am on checkout Step 2 (Traveler Details)
**When** the screen loads
**Then** form displays fields (pre-filled if logged in):
  - Primary Contact: First Name*, Last Name*, Email*, Phone*
  - Trip Lead: Same as contact (checkbox), or separate fields
  - Special Requests: textarea (optional)
**And** fields marked with * are required
**And** form uses React Hook Form with Zod validation schema
**When** I submit with missing required fields
**Then** validation errors display inline below each field
**And** error border (red) highlights invalid fields
**When** all required fields are valid
**Then** "Continue to Payment" button enables
**And** form data persists to checkout session state
