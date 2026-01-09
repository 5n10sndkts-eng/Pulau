# Story 2.3: Implement Password Reset Flow

Status: done

## Story

As a traveler who forgot my password,
I want to reset my password via email,
so that I can regain access to my account.

## Acceptance Criteria

1. **Given** I am on the "Forgot Password" screen **When** I enter my registered email address **Then** a password reset token (UUID) is generated and stored with 1-hour expiration
2. A reset email is sent with a secure link containing the token
3. **When** I click the reset link and enter a new password (min 8 chars) **Then** the token is validated (not expired, matches user)
4. My password is updated with new hashed value
5. All existing sessions are invalidated
6. I receive confirmation and am redirected to login
7. Error shows for expired or invalid tokens

## Tasks / Subtasks

- [x] Task 1: Create forgot password UI (AC: #1)
  - [x] Create `src/screens/auth/ForgotPasswordScreen.tsx`
  - [x] Build form with single email input field
  - [x] Add "Back to Login" link
  - [x] Show "Check your email" success message
  - [x] Handle case when email not found (still show success for security)
- [x] Task 2: Implement reset token generation (AC: #1, #2)
  - [x] Generate UUID reset token
  - [x] Store token with: user_id, token, expires_at (1 hour)
  - [x] Create mock email function logging reset link
  - [x] Build reset URL: `/reset-password?token={token}`
- [x] Task 3: Create reset password UI (AC: #3, #7)
  - [x] Create `src/screens/auth/ResetPasswordScreen.tsx`
  - [x] Extract token from URL params
  - [x] Build form with new password and confirm password fields
  - [x] Validate password (min 8 chars) with Zod
  - [x] Show error for invalid/expired token
- [x] Task 4: Implement password reset logic (AC: #3, #4, #5)
  - [x] Validate token exists and not expired
  - [x] Hash new password
  - [x] Update user record with new hashed_password
  - [x] Delete reset token after use
  - [x] Invalidate all existing sessions for user
- [x] Task 5: Handle reset success (AC: #6)
  - [x] Show "Password updated successfully" toast
  - [x] Clear any existing session state
  - [x] Navigate to login screen
  - [x] Pre-fill email field from reset context

## Dev Notes

- Reset tokens should be single-use (delete after successful reset)
- Always show "email sent" even if email doesn't exist (prevent enumeration)
- Token expiry: 1 hour from generation
- Log reset links to console for development testing

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: project-context.md#Security Patterns]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

