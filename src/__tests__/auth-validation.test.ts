import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/auth-validation'

describe('auth validation schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.email).toBeDefined()
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.email).toBeDefined()
      }
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.password).toBeDefined()
      }
    })

    it('should accept any password length (no minimum on login)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
