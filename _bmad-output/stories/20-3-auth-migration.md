# Story 20.3: Auth Migration (Supabase)

Status: done

## Story

As a **user**,
I want **to authenticate using Supabase Auth**,
so that **my account is secure and sessions persist across devices**.

## Acceptance Criteria

- [x] AC1: Login component uses authService with Supabase Auth
  - Real API call instead of mock setTimeout
  - Error handling with user-friendly messages
- [x] AC2: Register component uses authService with Supabase Auth
  - Creates user in Supabase auth.users
  - Profile created automatically via database trigger
- [x] AC3: Password reset functionality available
  - resetPassword method sends Supabase magic link
  - updatePassword method for setting new password
- [x] AC4: Auth state changes are handled properly
  - AuthContext listens to Supabase auth state changes
  - Session persists across page refreshes
- [x] AC5: Mock mode still works for development
  - VITE_USE_MOCK_AUTH=true enables local testing
- [x] AC6: Build succeeds with all changes

## Tasks

- [x] 1. Update CustomerLogin to use authService.login()
- [x] 2. Update CustomerRegister to use authService.register()
- [x] 3. Add resetPassword and updatePassword to authService
- [x] 4. Add error display in login/register forms
- [x] 5. Verify build succeeds

## Technical Implementation

### CustomerLogin Changes

- Removed mock setTimeout-based login
- Added `authService.login()` call with proper async/await
- Added `authError` state for displaying Supabase errors
- Maps Supabase error messages to user-friendly text:
  - "Invalid login credentials" → "Invalid email or password"
  - "Email not confirmed" → "Please verify your email"

### CustomerRegister Changes

- Removed `useKV` hook dependency (was storing users locally)
- Removed client-side password hashing (Supabase handles this)
- Added `authService.register()` call
- Updated security note to reference Supabase Auth
- Added `authError` state for error display

### authService Additions

```typescript
resetPassword: async (email: string): Promise<void>
// Sends password reset email via Supabase

updatePassword: async (newPassword: string): Promise<void>
// Updates password for authenticated user
```

### Environment Configuration

The auth system respects `VITE_USE_MOCK_AUTH`:
- `true` - Uses localStorage-based mock auth (for testing)
- `false` or unset - Uses real Supabase Auth

## References

- [Source: src/lib/authService.ts] - Auth service implementation
- [Source: src/contexts/AuthContext.tsx] - React auth context
- [Source: src/components/auth/CustomerLogin.tsx] - Login component
- [Source: src/components/auth/CustomerRegister.tsx] - Register component
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. Updated `CustomerLogin.tsx`:
   - Added `authService` import
   - Replaced mock setTimeout with `authService.login()`
   - Added `authError` state and error display
   - Maps Supabase errors to user-friendly messages

2. Updated `CustomerRegister.tsx`:
   - Removed `useKV` hook import
   - Removed `generateSalt`, `hashPassword` imports
   - Replaced local storage with `authService.register()`
   - Added `authError` state and error display
   - Updated security note text

3. Enhanced `authService.ts`:
   - Added `resetPassword()` method
   - Added `updatePassword()` method
   - Both methods support mock mode

4. Build verified successful

### Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/auth/CustomerLogin.tsx` | Modified | Use authService, add error handling |
| `src/components/auth/CustomerRegister.tsx` | Modified | Use authService, remove KV/crypto |
| `src/lib/authService.ts` | Modified | Add resetPassword, updatePassword |

### File List

**Files modified:**
- `src/components/auth/CustomerLogin.tsx`
- `src/components/auth/CustomerRegister.tsx`
- `src/lib/authService.ts`

### Testing Notes

To test authentication:

1. **With Mock Mode** (no Supabase needed):
   ```
   VITE_USE_MOCK_AUTH=true npm run dev
   ```

2. **With Real Supabase**:
   - Ensure `.env.local` has valid Supabase credentials
   - Run migrations on Supabase (profiles table needed)
   - Register creates user in auth.users + profiles
   - Login validates against Supabase Auth
