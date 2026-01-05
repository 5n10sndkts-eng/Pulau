# Story 2.2: Implement Customer Login with Session Management

Status: ready-for-dev

## Story

As a registered traveler,
I want to login with my email and password,
so that I can access my saved trips and profile.

## Acceptance Criteria

1. **Given** I have a registered account from Story 2.1 **When** I enter correct email and password on login screen **Then** my credentials are verified against hashed password in database
2. A secure session token (JWT) is generated with 7-day expiration
3. Session token is stored in localStorage and HTTP-only cookie
4. I am redirected to the home screen with authenticated state
5. Error message displays for incorrect email or password
6. Session automatically refreshes before expiration
7. Session expires and redirects to login after 7 days of inactivity

## Tasks / Subtasks

- [ ] Task 1: Create login UI (AC: #1, #5)
  - [ ] Create `src/screens/auth/LoginScreen.tsx`
  - [ ] Build form with email and password fields
  - [ ] Add "Remember me" checkbox
  - [ ] Add "Forgot Password?" link
  - [ ] Add "Create Account" link to registration
  - [ ] Style with Bali design system
- [ ] Task 2: Implement credential verification (AC: #1, #5)
  - [ ] Create login handler function
  - [ ] Look up user by email in useKV storage
  - [ ] Verify password hash matches
  - [ ] Display "Invalid email or password" for failures
  - [ ] Rate limit login attempts (3 per minute)
- [ ] Task 3: Implement session token generation (AC: #2, #3)
  - [ ] Create JWT generation function with 7-day expiry
  - [ ] Include user_id and email in token payload
  - [ ] Store token in localStorage via useKV
  - [ ] Create session context for app-wide access
- [ ] Task 4: Handle successful login (AC: #4)
  - [ ] Set authenticated state in session context
  - [ ] Navigate to home screen
  - [ ] Load user profile data
  - [ ] Show "Welcome back!" toast
- [ ] Task 5: Implement session refresh (AC: #6, #7)
  - [ ] Check token expiry on app load
  - [ ] Refresh token when 1 day remaining
  - [ ] Clear session and redirect to login on expiry
  - [ ] Create useAuth hook for session management

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

### Debug Log References

### Completion Notes List

### File List

