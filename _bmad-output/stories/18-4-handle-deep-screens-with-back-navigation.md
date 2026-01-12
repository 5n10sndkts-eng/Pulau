### Story 18.4: Handle Deep Screens with Back Navigation

As a user navigating deep into the app,
I want back buttons to work correctly,
So that I can return to previous screens.

**Acceptance Criteria:**

**Given** I navigate deep into screens (e.g., Home → Category → Experience → Checkout)
**When** I see back button in header
**Then** tapping back returns to previous screen
**And** navigation history maintained in state array
**When** I tap bottom tab
**Then** I return to that tab's root screen (not deep screen)
**And** navigation history clears for that tab
**When** I use browser back button
**Then** behavior matches in-app back button
**And** no unexpected navigation loops

---
