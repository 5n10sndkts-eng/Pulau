# Story 2.1: Implement Customer Registration Flow

Status: review

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

- [x] Task 1: Create registration UI (AC: #1, #6)
  - [x] Create `src/screens/auth/RegisterScreen.tsx`
  - [x] Build form with email, password, confirm password fields
  - [x] Add form validation with Zod schema
  - [x] Display inline validation errors for each field
  - [x] Style with Bali design system (teal primary button)
- [x] Task 2: Implement form validation (AC: #6)
  - [x] Create Zod schema: email (valid format), password (min 8 chars)
  - [x] Add confirm password match validation
  - [x] Show real-time validation feedback on blur
  - [x] Disable submit button until form is valid
- [x] Task 3: Create user data model (AC: #4)
  - [x] Define User type in `src/types/user.ts`
  - [x] Include: id (UUID), email, hashed_password, created_at, email_verified
  - [x] Create mock user storage with Spark useKV
- [x] Task 4: Implement registration logic (AC: #1, #2)
  - [x] Create registration handler function
  - [x] Hash password with bcrypt (or appropriate library)
  - [x] Generate UUID for user id
  - [x] Store user record in useKV
  - [x] Set email_verified to false initially
- [x] Task 5: Implement email verification (AC: #3)
  - [x] Generate verification token (UUID)
  - [x] Store token with expiration (24 hours)
  - [x] Create mock email sending function
  - [x] Log verification link to console (development)
- [x] Task 6: Handle registration success (AC: #5)
  - [x] Show success toast "Account created!"
  - [x] Navigate to onboarding flow
  - [x] Set authenticated session state

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
Claude 3.7 Sonnet (2026-01-05)

### Debug Log References
- Implemented PBKDF2-based password hashing using Web Crypto API (bcrypt not available in browser)
- Created comprehensive test suite for crypto utilities and validation
- Used Zod 4.x with updated API for form validation

### Completion Notes List
1. ✅ Created RegisterScreen component with full form validation
2. ✅ Implemented AuthUser type with all required fields (id, email, hashed_password, created_at, email_verified)
3. ✅ Created password hashing utilities using PBKDF2 with Web Crypto API (100,000 iterations, SHA-256)
4. ✅ Implemented Zod validation schema with email format, password length (min 8), and password match validation
5. ✅ Created mock email service with verification token generation and console logging
6. ✅ Integrated Spark useKV for user and verification token storage
7. ✅ Added real-time validation feedback on field blur
8. ✅ Submit button disabled until form is valid
9. ✅ Success toast notification on account creation
10. ✅ All crypto and validation tests passing (16 new tests)

### File List
- src/types/user.ts (new: AuthUser, RegistrationData, VerificationToken types)
- src/lib/crypto.ts (new: password hashing and UUID generation utilities)
- src/lib/validation.ts (new: Zod registration schema)
- src/lib/email.ts (new: mock email service)
- src/screens/auth/RegisterScreen.tsx (new: registration form component)
- src/__tests__/crypto.test.ts (new: 9 test cases for crypto utilities)
- src/__tests__/validation.test.ts (new: 7 test cases for validation schema)


## Change Log

- 2026-01-05: Initial implementation of customer registration flow
  - Created registration UI with Bali design system styling
  - Implemented PBKDF2 password hashing with Web Crypto API
  - Added comprehensive form validation with Zod
  - Created mock email verification service
  - Integrated Spark useKV for user data persistence
  - Added 16 test cases for crypto and validation
