# Story 2.2: Implement Customer Login with Session Management

Status: done

## Story

As a registered traveler,
I want to login with my email and password,
so that I can access my saved trips and profile.

## Acceptance Criteria

1. **Given** I have a registered account from Story 2.1 **When** I enter correct email and password on login screen **Then** my credentials are verified against hashed password in Spark KV store
2. A secure session token (JWT) is generated with 7-day expiration
3. Session token is stored in localStorage and HTTP-only cookie
4. I am redirected to the home screen with authenticated state
5. Error message displays for incorrect email or password
6. Session automatically refreshes before expiration
7. Session expires and redirects to login after 7 days of inactivity

## Tasks / Subtasks

- [x] Task 1: Create login UI (AC: #1, #5)
  - [x] Create `src/screens/auth/LoginScreen.tsx`
  - [x] Build form with email and password fields
  - [x] Add "Remember me" checkbox
  - [x] Add "Forgot Password?" link
  - [x] Add "Create Account" link to registration
  - [x] Style with Bali design system
- [x] Task 2: Implement credential verification (AC: #1, #5)
  - [x] Create login handler function
  - [x] Look up user by email in useKV storage
  - [x] Verify password hash matches
  - [x] Display "Invalid email or password" for failures
  - [x] Rate limit login attempts (3 per minute)
- [x] Task 3: Implement session token generation (AC: #2, #3)
  - [x] Create JWT generation function with 7-day expiry
  - [x] Include user_id and email in token payload
  - [x] Store token in localStorage via useKV
  - [x] Create session context for app-wide access
- [x] Task 4: Handle successful login (AC: #4)
  - [x] Set authenticated state in session context
  - [x] Navigate to home screen
  - [x] Load user profile data
  - [x] Show "Welcome back!" toast
- [x] Task 5: Implement session refresh (AC: #6, #7)
  - [x] Check token expiry on app load
  - [x] Refresh token when 1 day remaining
  - [x] Clear session and redirect to login on expiry
  - [x] Create useAuth hook for session management

## Dev Notes

- JWT can be simulated for client-side MVP (no real JWT library needed)
- Session management via Spark useKV localStorage
- Consider security: never log passwords, use timing-safe comparison
- Handle case where user not found vs wrong password identically (prevent enumeration)

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: architecture/architecture.md#State Management]
- [Source: project-context.md#Authentication Patterns]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

