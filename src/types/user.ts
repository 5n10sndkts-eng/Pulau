/**
 * Authentication User Type
 * Separate from the User type in lib/types.ts which represents profile data
 */
export interface AuthUser {
  id: string
  email: string
  hashed_password: string
  created_at: string
  email_verified: boolean
}

/**
 * Registration form data
 */
export interface RegistrationData {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Verification token for email verification
 */
export interface VerificationToken {
  token: string
  userId: string
  expiresAt: string
}
