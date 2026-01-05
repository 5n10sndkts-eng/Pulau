import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  generateSessionToken, 
  verifySessionToken, 
  shouldRefreshSession, 
  isSessionExpired 
} from '@/lib/session'

describe('session utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateSessionToken', () => {
    it('should generate a valid session token', () => {
      const session = generateSessionToken('user-123', 'test@example.com')
      
      expect(session.token).toBeDefined()
      expect(session.userId).toBe('user-123')
      expect(session.email).toBe('test@example.com')
      expect(session.createdAt).toBeDefined()
      expect(session.expiresAt).toBeDefined()
    })

    it('should generate token with custom expiry days', () => {
      const session = generateSessionToken('user-123', 'test@example.com', 30)
      
      const created = new Date(session.createdAt).getTime()
      const expires = new Date(session.expiresAt).getTime()
      const expectedDiff = 30 * 24 * 60 * 60 * 1000
      
      expect(expires - created).toBeCloseTo(expectedDiff, -2)
    })

    it('should generate tokens with proper structure', () => {
      const session = generateSessionToken('user-123', 'test@example.com')
      const parts = session.token.split('.')
      
      expect(parts.length).toBe(3) // header.payload.signature
    })
  })

  describe('verifySessionToken', () => {
    it('should verify a valid token', () => {
      const session = generateSessionToken('user-123', 'test@example.com')
      const payload = verifySessionToken(session.token)
      
      expect(payload).not.toBeNull()
      expect(payload?.userId).toBe('user-123')
      expect(payload?.email).toBe('test@example.com')
    })

    it('should reject invalid token format', () => {
      const payload = verifySessionToken('invalid-token')
      expect(payload).toBeNull()
    })

    it('should reject expired token', () => {
      const session = generateSessionToken('user-123', 'test@example.com', -1) // Expired yesterday
      const payload = verifySessionToken(session.token)
      
      expect(payload).toBeNull()
    })

    it('should reject token with invalid structure', () => {
      const payload = verifySessionToken('part1.part2')
      expect(payload).toBeNull()
    })
  })

  describe('shouldRefreshSession', () => {
    it('should return true when less than 1 day remaining', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours
      
      const session = {
        token: 'token',
        userId: 'user-123',
        email: 'test@example.com',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
      
      expect(shouldRefreshSession(session)).toBe(true)
    })

    it('should return false when more than 1 day remaining', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
      
      const session = {
        token: 'token',
        userId: 'user-123',
        email: 'test@example.com',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
      
      expect(shouldRefreshSession(session)).toBe(false)
    })
  })

  describe('isSessionExpired', () => {
    it('should return true for expired session', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() - 1000) // 1 second ago
      
      const session = {
        token: 'token',
        userId: 'user-123',
        email: 'test@example.com',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
      
      expect(isSessionExpired(session)).toBe(true)
    })

    it('should return false for valid session', () => {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
      
      const session = {
        token: 'token',
        userId: 'user-123',
        email: 'test@example.com',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }
      
      expect(isSessionExpired(session)).toBe(false)
    })
  })
})
