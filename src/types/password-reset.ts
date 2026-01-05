/**
 * Password reset types
 */
export interface PasswordResetToken {
  id: string
  userId: string
  token: string
  createdAt: string
  expiresAt: string
}

export interface ResetPasswordData {
  password: string
  confirmPassword: string
}
