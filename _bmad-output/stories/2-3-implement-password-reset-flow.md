### Story 2.3: Implement Password Reset Flow

As a traveler who forgot my password,
I want to reset my password via email,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the "Forgot Password" screen
**When** I enter my registered email address
**Then** a password reset token (UUID) is generated and stored with 1-hour expiration
**And** a reset email is sent with a secure link containing the token
**When** I click the reset link and enter a new password (min 8 chars)
**Then** the token is validated (not expired, matches user)
**And** my password is updated with new hashed value
**And** all existing sessions are invalidated
**And** I receive confirmation and am redirected to login
**And** error shows for expired or invalid tokens
