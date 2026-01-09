# Story 2.1: Implement Customer Registration Flow

Status: done

## Story

As a traveler,
I want to create an account with email and password,
so that I can save my trips and preferences into my personal Spark KV space.

## Acceptance Criteria

1. **Given** I am on the registration screen **When** I enter valid email, password (min 8 chars), and confirm password **Then** a new user record is saved to Spark KV.
2. **Security:** Passwords MUST be hashed using PBKDF2 with HMAC-SHA256 (SubtleCrypto API) with at least 100,000 iterations and a unique per-user salt.
3. **Redirection:** Upon registration, user is automatically logged in and redirected to the `/onboarding` screen.
4. **Validation:** UI shows specific error messages for:
   - Invalid email format
   - Password less than 8 characters
   - Passwords do not match
5. **Persistence:** User record in KV includes: `id` (UUID), `email`, `hashedPassword`, `salt`, `createdAt`, `emailVerified: false`.
6. **Prevention:** Duplicate email registration prevents creation and shows "Email already in use".

## Technical Constraints & Patterns

- **Persistence:** Use `useKV` from `@github/spark/hooks`.
- **Crypto:** Use bobjectser-native `window.crypto.subtle` for PBKDF2. Avoid heavy external crypto libraries.
- **Components:** Primary component is `src/components/auth/CustomerRegister.tsx`.
- **Validation:** Use `zod` for schema validation.
- **Routing:** Use the `Screen` discriminated union in `App.tsx` via the `onRegisterSuccess` callback.

## Suggested Implementation Steps

### 1. Define User Schema & Types
- Update `User` interface in `src/lib/types.ts` to include `email`, `hashedPassword`, `salt`, and `createdAt`.
- Create a `registrationSchema` using `zod`.

### 2. Implement Crypto Utility
- Create `src/lib/crypto.ts` with:
  - `generateSalt()`: Returns a random Uint8Array.
  - `hashPassword(password, salt)`: Uses PBKDF2 to derive a hash.

### 3. Build Registration Logic
- In `CustomerRegister.tsx`:
  - Implement form state with `react-hook-form` and `zodResolver`.
  - On submit:
    1. Check if email already exists (querying `pulau_users` map or similar key-prefix).
    2. Generate salt and hash password.
    3. Store record in Spark KV.
    4. Trigger success callback.

### 4. Update App Routing
- Ensure `App.tsx` handles the transition from `customerRegister` to `onboarding` correctly via `setUser`.

## Disaster Prevention (CRITICAL)

- [x] **NO PLAIN TEXT:** Never store or log the plain text password.
- [x] **SALTING:** Every user record must have a unique salt. NEVER use a hardcoded static salt.
- [x] **ITERATIONS:** Use a minimum of 100,000 iterations for PBKDF2 to prevent easy brute-forcing of the local KV store.
- [x] **KV ATOMICITY:** Since Spark KV is eventually consistent, ensure you handle the "check then write" race condition gracefully or mention it in dev notes.

## Definition of Done

- [x] Form validates all inputs correctly with Zod.
- [x] User record is visible in Spark KV dev tools after registration.
- [x] Password hash in KV is not the same as the plain password.
- [x] Successful registration navigates to Onboarding.
- [x] Duplicate email registration is blocked.
