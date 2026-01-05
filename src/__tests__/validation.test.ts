import { describe, it, expect } from 'vitest'
import { registrationSchema } from '@/lib/validation'

describe('validation schemas', () => {
  describe('registrationSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = registrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
      }

      const result = registrationSchema.safeParse(invalidData)
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
        confirmPassword: 'password123',
      }

      const result = registrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.email).toBeDefined()
      }
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      }

      const result = registrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.password).toBeDefined()
      }
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      }

      const result = registrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.confirmPassword).toBeDefined()
      }
    })

    it('should reject missing confirm password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: '',
      }

      const result = registrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const formatted = result.error.format()
        expect(formatted.confirmPassword).toBeDefined()
      }
    })

    it('should accept password exactly 8 characters', () => {
      const validData = {
        email: 'test@example.com',
        password: '12345678',
        confirmPassword: '12345678',
      }

      const result = registrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
