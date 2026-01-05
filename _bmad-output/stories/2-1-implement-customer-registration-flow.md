# Story 2.1: Implement Customer Registration Flow

Status: ready-for-dev

## Story

As a traveler,
I want to create an account with email and password,
so that I can save my trips and preferences.

## Acceptance Criteria

1. **Given** I am on the registration screen **When** I enter valid email, password (min 8 chars), and confirm password **Then** a new user account is created in the database (users table)
2. Password is hashed using bcrypt before storage
3. User receives a verification email
4. User record includes: id (UUID), email, hashed_password, created_at, email_verified (boolean)
5. I am redirected to the onboarding flow
6. Validation shows errors for: invalid email format, password too short, passwords don't match

## Tasks / Subtasks

- [ ] Task 1: Create registration UI (AC: #1, #6)
  - [ ] Create `src/screens/auth/RegisterScreen.tsx`
  - [ ] Build form with email, password, confirm password fields
  - [ ] Add form validation with Zod schema
  - [ ] Display inline validation errors for each field
  - [ ] Style with Bali design system (teal primary button)
- [ ] Task 2: Implement form validation (AC: #6)
  - [ ] Create Zod schema: email (valid format), password (min 8 chars)
  - [ ] Add confirm password match validation
  - [ ] Show real-time validation feedback on blur
  - [ ] Disable submit button until form is valid
- [ ] Task 3: Create user data model (AC: #4)
  - [ ] Define User type in `src/types/user.ts`
  - [ ] Include: id (UUID), email, hashed_password, created_at, email_verified
  - [ ] Create mock user storage with Spark useKV
- [ ] Task 4: Implement registration logic (AC: #1, #2)
  - [ ] Create registration handler function
  - [ ] Hash password with bcrypt (or appropriate library)
  - [ ] Generate UUID for user id
  - [ ] Store user record in useKV
  - [ ] Set email_verified to false initially
- [ ] Task 5: Implement email verification (AC: #3)
  - [ ] Generate verification token (UUID)
  - [ ] Store token with expiration (24 hours)
  - [ ] Create mock email sending function
  - [ ] Log verification link to console (development)
- [ ] Task 6: Handle registration success (AC: #5)
  - [ ] Show success toast "Account created!"
  - [ ] Navigate to onboarding flow
  - [ ] Set authenticated session state

## Dev Notes

- Use Spark useKV for user data persistence
- bcrypt not available in browser - use appropriate alternative (e.g., pbkdf2)
- Email verification is mocked for MVP (no actual email service)
- Follow null safety patterns for all user data access

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: architecture/architecture.md#State Management]
- [Source: prd/pulau-prd.md#Customer Authentication]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

