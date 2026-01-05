import { generateUUID } from '@/lib/crypto'
import type { PasswordResetToken } from '@/types/password-reset'

/**
 * Generate a password reset token
 * @param userId - User's ID
 * @param email - User's email (for logging)
 * @returns Password reset token
 */
export function generateResetToken(userId: string, email: string): PasswordResetToken {
  const token = generateUUID()
  const now = Date.now()
  const expiresAt = new Date(now + 60 * 60 * 1000).toISOString() // 1 hour

  const resetLink = `${window.location.origin}/reset-password?token=${token}`

  // In development, log the reset link to console
  console.log('🔐 Password reset email would be sent to:', email)
  console.log('🔗 Reset link:', resetLink)
  console.log('⏰ Expires at:', expiresAt)

  return {
    id: generateUUID(),
    userId,
    token,
    createdAt: new Date(now).toISOString(),
    expiresAt,
  }
}

/**
 * Validate a reset token
 * @param token - Password reset token
 * @returns True if token is valid and not expired
 */
export function isResetTokenValid(token: PasswordResetToken): boolean {
  const now = Date.now()
  const expiresAt = new Date(token.expiresAt).getTime()
  
  return now < expiresAt
}
