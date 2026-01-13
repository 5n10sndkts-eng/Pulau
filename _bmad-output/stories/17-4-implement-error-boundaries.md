### Story 17.4: Implement Error Boundaries

As a user,
I want the app to recover from errors gracefully,
So that one bug doesn't crash everything.

**Acceptance Criteria:**

**Given** an unhandled JavaScript error occurs
**When** the error boundary catches it
**Then** friendly error UI displays instead of white screen:

- Illustration of confused character
- "Something went wrong"
- "Try refreshing the page" suggestion
- "Report Problem" link
- "Go Home" button
  **And** error details logged to console (dev mode)
  **And** error reported to monitoring service (production)
  **When** user taps "Go Home"
  **Then** navigation resets to home screen
  **And** error state clears
