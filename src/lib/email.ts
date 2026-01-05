import { generateUUID } from '@/lib/crypto'
import type { VerificationToken } from '@/types/user'

/**
 * Mock email service for development
 * In production, this would integrate with an actual email service
 */

/**
 * Send a verification email (mocked for MVP)
 * @param email - User's email address
 * @param userId - User's ID
 * @returns Verification token
 */
export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<VerificationToken> {
  const token = generateUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

  const verificationLink = `${window.location.origin}/verify-email?token=${token}`

  // In development, log the verification link to console
  console.log('📧 Verification email would be sent to:', email)
  console.log('🔗 Verification link:', verificationLink)
  console.log('⏰ Expires at:', expiresAt)

  const verificationToken: VerificationToken = {
    token,
    userId,
    expiresAt,
  }

  return verificationToken
}
