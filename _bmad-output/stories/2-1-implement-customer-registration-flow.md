### Story 2.1: Implement Customer Registration Flow

As a traveler,
I want to create an account with email and password,
So that I can save my trips and preferences.

**Acceptance Criteria:**

**Given** I am on the registration screen
**When** I enter valid email, password (min 8 chars), and confirm password
**Then** a new user account is created in the database (users table)
**And** password is hashed using bcrypt before storage
**And** user receives a verification email
**And** user record includes: id (UUID), email, hashed_password, created_at, email_verified (boolean)
**And** I am redirected to the onboarding flow
**And** validation shows errors for: invalid email format, password too short, passwords don't match
