### Story 15.5: Implement Pre-Booking Questions

As a traveler,
I want to ask the operator a question before booking,
So that I can clarify details.

**Acceptance Criteria:**

**Given** I am on an experience detail page
**When** I tap "Message Operator" button
**Then** new message compose modal opens
**And** experience context auto-attached to message
**And** placeholder text: "Ask about this experience..."
**When** I send the message
**Then** conversation thread created if none exists
**And** message delivered to vendor
**And** I'm navigated to the conversation thread
**And** vendor receives notification of new message

---
