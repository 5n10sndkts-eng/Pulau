import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, generateUUID } from '@/lib/crypto'

describe('crypto utilities', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).toContain(':')
      expect(hash.split(':').length).toBe(2)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty password', async () => {
      const hash = await hashPassword('')
      expect(hash).toBeDefined()
      expect(hash).toContain(':')
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })

    it('should handle invalid hash format', async () => {
      const isValid = await verifyPassword('password', 'invalid-hash')
      expect(isValid).toBe(false)
    })

    it('should handle empty hash', async () => {
      const isValid = await verifyPassword('password', '')
      expect(isValid).toBe(false)
    })
  })
})
