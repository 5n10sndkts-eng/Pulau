### Story 28.2: Create Refund Processing Interface

As an **admin**,
I want to initiate refunds from the dashboard,
So that I can resolve customer issues efficiently.

**Acceptance Criteria:**

**Given** I am viewing a booking detail
**When** I click "Process Refund"
**Then** I can choose:

- Full refund (100% of payment)
- Partial refund (custom amount up to total)
  **And** I must enter a refund reason
  **And** I see the calculated amounts:
- Amount to refund traveler
- Amount deducted from vendor (if applicable)
- Platform fee handling
  **And** I must confirm before processing

---
