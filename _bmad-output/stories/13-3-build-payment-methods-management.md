### Story 13.3: Build Payment Methods Management

As a user,
I want to manage my saved payment methods,
So that checkout is convenient.

**Acceptance Criteria:**

**Given** I tap "Payment Methods" from profile
**When** the payment methods screen loads
**Then** I see list of saved cards:
  - Card brand icon (Visa/Mastercard/Amex)
  - "•••• [last 4 digits]"
  - Expiry date
  - "Default" badge if is_default = true
**And** "+ Add New Card" button at bottom
**When** I tap a card
**Then** options: "Set as Default", "Remove"
**When** I tap "Remove"
**Then** confirmation modal: "Remove this card?"
**And** on confirm, card soft-deleted (deleted_at set)
**When** I tap "Add New Card"
**Then** card entry form opens (same as checkout)
