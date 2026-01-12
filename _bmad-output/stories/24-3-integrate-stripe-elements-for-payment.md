### Story 24.3: Integrate Stripe Elements for Payment

As a **traveler**,
I want to enter my payment details securely,
So that my card information is protected.

**Acceptance Criteria:**

**Given** I am on the payment step of checkout
**When** the payment form renders
**Then** Stripe Elements iframe loads for card input
**And** I can enter card number, expiry, CVC
**And** Apple Pay / Google Pay buttons appear if supported
**And** card input validates in real-time (card type, errors)
**And** NO raw card data touches our servers (PCI SAQ-A compliance)
**And** 3D Secure is enforced for liability shift

---
