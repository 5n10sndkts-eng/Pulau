### Story 2.2: Implement Customer Login with Session Management

As a registered traveler,
I want to login with my email and password,
So that I can access my saved trips and profile.

**Acceptance Criteria:**

**Given** I have a registered account from Story 2.1
**When** I enter correct email and password on login screen
**Then** my credentials are verified against hashed password in database
**And** a secure session token (JWT) is generated with 7-day expiration
**And** session token is stored in localStorage and HTTP-only cookie
**And** I am redirected to the home screen with authenticated state
**And** error message displays for incorrect email or password
**And** session automatically refreshes before expiration
**And** session expires and redirects to login after 7 days of inactivity
