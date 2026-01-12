### Story 17.5: Create Consistent Error Messaging

As a user encountering errors,
I want clear error messages,
So that I understand what went wrong.

**Acceptance Criteria:**

**Given** various error conditions
**When** errors display
**Then** error messages are user-friendly (not technical):
  - Network: "Unable to connect. Check your internet connection."
  - Payment: "Payment couldn't be processed. Please try again."
  - Validation: "[Field] is required" (inline)
  - Not Found: "This experience is no longer available."
  - Server: "Something went wrong on our end. Please try again later."
**And** error toasts use destructive variant (red/coral)
**And** inline errors use red border and helper text
**And** all errors are recoverable (retry button or clear instructions)

---
