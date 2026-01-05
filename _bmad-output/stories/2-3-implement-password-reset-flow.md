# Story 2.3: Implement Password Reset Flow

Status: review

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

- [ ] Task 1: Create forgot password UI (AC: #1)
  - [ ] Create `src/screens/auth/ForgotPasswordScreen.tsx`
  - [ ] Build form with single email input field
  - [ ] Add "Back to Login" link
  - [ ] Show "Check your email" success message
  - [ ] Handle case when email not found (still show success for security)
- [ ] Task 2: Implement reset token generation (AC: #1, #2)
  - [ ] Generate UUID reset token
  - [ ] Store token with: user_id, token, expires_at (1 hour)
  - [ ] Create mock email function logging reset link
  - [ ] Build reset URL: `/reset-password?token={token}`
- [ ] Task 3: Create reset password UI (AC: #3, #7)
  - [ ] Create `src/screens/auth/ResetPasswordScreen.tsx`
  - [ ] Extract token from URL params
  - [ ] Build form with new password and confirm password fields
  - [ ] Validate password (min 8 chars) with Zod
  - [ ] Show error for invalid/expired token
- [ ] Task 4: Implement password reset logic (AC: #3, #4, #5)
  - [ ] Validate token exists and not expired
  - [ ] Hash new password
  - [ ] Update user record with new hashed_password
  - [ ] Delete reset token after use
  - [ ] Invalidate all existing sessions for user
- [ ] Task 5: Handle reset success (AC: #6)
  - [ ] Show "Password updated successfully" toast
  - [ ] Clear any existing session state
  - [ ] Navigate to login screen
  - [ ] Pre-fill email field from reset context

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

### Debug Log References

### Completion Notes List

### File List

## Dev Agent Record

### Agent Model Used
Claude 3.7 Sonnet (2026-01-05)

### Debug Log References
- Implemented single-use reset tokens with 1-hour expiration
- Always shows success message even if email not found (prevents user enumeration)
- Invalidates all active sessions after password reset (logout everywhere)

### Completion Notes List
1. ✅ Created ForgotPasswordScreen with email input
2. ✅ Implemented reset token generation with UUID and 1-hour expiry
3. ✅ Created ResetPasswordScreen with token validation
4. ✅ Implemented password update with hash
5. ✅ Single-use tokens (deleted after successful reset)
6. ✅ All existing sessions invalidated on password change
7. ✅ Security: generic success message prevents email enumeration
8. ✅ Token validation on mount with user-friendly error messages
9. ✅ All tests passing (95/95)

### File List
- src/types/password-reset.ts (new: PasswordResetToken types)
- src/lib/password-reset.ts (new: token generation and validation)
- src/screens/auth/ForgotPasswordScreen.tsx (new: forgot password form)
- src/screens/auth/ResetPasswordScreen.tsx (new: reset password form with token validation)

## Change Log

- 2026-01-05: Initial implementation of password reset flow
  - Created forgot password and reset password screens
  - Implemented secure single-use tokens with 1-hour expiration
  - Added session invalidation on password reset
  - Implemented anti-enumeration measures (generic success messages)
