import { generateUUID } from '@/lib/crypto'
import type { JWTPayload, Session } from '@/types/session'

/**
 * Simulated JWT for client-side MVP
 * In production, this would use a proper JWT library with server-side signing
 */

/**
 * Generate a session token (simulated JWT)
 * @param userId - User's ID
 * @param email - User's email
 * @param expiryDays - Number of days until expiration (default 7)
 * @returns Session object with token
 */
export function generateSessionToken(
  userId: string,
  email: string,
  expiryDays: number = 7
): Session {
  const now = Date.now()
  const expiresAt = new Date(now + expiryDays * 24 * 60 * 60 * 1000).toISOString()
  
  const payload: JWTPayload = {
    userId,
    email,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiryDays * 24 * 60 * 60 * 1000) / 1000),
  }

  // Simulated JWT: base64(header).base64(payload).base64(signature)
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerEncoded = btoa(JSON.stringify(header))
  const payloadEncoded = btoa(JSON.stringify(payload))
  const signature = btoa(generateUUID()) // Simulated signature
  
  const token = `${headerEncoded}.${payloadEncoded}.${signature}`

  return {
    token,
    userId,
    email,
    expiresAt,
    createdAt: new Date(now).toISOString(),
  }
}

/**
 * Verify and decode a session token
 * @param token - Session token to verify
 * @returns Decoded payload if valid, null otherwise
 */
export function verifySessionToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payloadEncoded = parts[1]
    if (!payloadEncoded) {
      return null
    }

    const payload = JSON.parse(atob(payloadEncoded)) as JWTPayload
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Check if session needs refresh (less than 1 day remaining)
 * @param session - Current session
 * @returns True if session should be refreshed
 */
export function shouldRefreshSession(session: Session): boolean {
  const expiresAt = new Date(session.expiresAt).getTime()
  const now = Date.now()
  const oneDayInMs = 24 * 60 * 60 * 1000
  
  return (expiresAt - now) < oneDayInMs
}

/**
 * Check if session is expired
 * @param session - Current session
 * @returns True if session is expired
 */
export function isSessionExpired(session: Session): boolean {
  const expiresAt = new Date(session.expiresAt).getTime()
  return Date.now() >= expiresAt
}
