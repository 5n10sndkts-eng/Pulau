### Story 10.1: Create Checkout Flow Navigation

As a traveler ready to book,
I want a clear multi-step checkout process,
So that I can complete my booking with confidence.

**Acceptance Criteria:**

**Given** I tap "Continue to Booking" from trip builder
**When** checkout flow initiates
**Then** I see a 4-step progress indicator at top:

- Step 1: Review (active)
- Step 2: Traveler Details
- Step 3: Payment
- Step 4: Confirmation
  **And** progress bar fills as I advance through steps
  **And** step labels show: completed (checkmark), current (filled circle), upcoming (empty circle)
  **And** I can tap completed steps to go back
  **And** I cannot skip ahead to future steps
  **And** checkout state persists to session (survives page refresh)
