### Story 6.10: Show Cancellation Policy and Policies

As a traveler,
I want to understand the cancellation policy,
So that I know my options if plans change.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I scroll to "Good to Know" section
**Then** I see subsections:

- **Cancellation Policy**: Friendly language (from experiences.cancellation_policy), e.g., "Free cancellation up to 24 hours before. Full refund, no questions asked."
- **What to Bring**: Comma-separated list (from experiences.what_to_bring), e.g., "Sunscreen, swimwear, camera"
- **Health & Safety**: Any relevant notes (from experiences.health_safety_notes)
  **And** section has clear typography hierarchy (title 20px bold, content 16px regular)
  **And** policies display with bullet points for easy scanning

---
