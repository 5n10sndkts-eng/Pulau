### Story 22.4: Implement Vendor Onboarding State Machine

As a **platform operator**,
I want vendor onboarding to follow a defined state machine,
So that vendor capabilities are correctly gated at each stage.

**Acceptance Criteria:**

**Given** the vendor state machine has states: REGISTERED → KYC_SUBMITTED → KYC_VERIFIED → BANK_LINKED → ACTIVE
**When** a vendor progresses through onboarding
**Then** state transitions are enforced in order
**And** each transition creates an audit log entry
**And** capabilities are gated by state:

- REGISTERED: Can create draft experiences
- KYC_SUBMITTED: Awaiting verification
- KYC_VERIFIED: Can publish "Request to Book" experiences
- BANK_LINKED: Can enable "Instant Book"
- ACTIVE: Full platform access

---
