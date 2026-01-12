/**
 * Send Email Edge Function - Validation Tests
 * Story: 30.1 - Create Email Notification Edge Function
 * AC #5: Error Handling and Testing
 *
 * These tests validate the email payload structure and validation logic
 * that matches the Edge Function's validatePayload implementation.
 */

import { describe, it, expect } from 'vitest'

// ================================================
// Types (mirrored from Edge Function)
// ================================================

type EmailType = 'booking_confirmation' | 'booking_cancellation' | 'booking_reminder'

interface EmailData {
  booking_reference: string
  experience_name: string
  experience_date: string
  experience_time: string
  guest_count: number
  total_amount: number
  currency: string
  traveler_name: string
  meeting_point?: string
  experience_image?: string
}

interface EmailPayload {
  type: EmailType
  to: string
  booking_id: string
  data: EmailData
}

// ================================================
// Validation function (same logic as Edge Function)
// ================================================

function validatePayload(
  payload: unknown
): { valid: true; data: EmailPayload } | { valid: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload format' }
  }

  const p = payload as Record<string, unknown>

  if (
    !p.type ||
    !['booking_confirmation', 'booking_cancellation', 'booking_reminder'].includes(
      p.type as string
    )
  ) {
    return { valid: false, error: 'Invalid or missing email type' }
  }

  if (!p.to || typeof p.to !== 'string' || !p.to.includes('@')) {
    return { valid: false, error: 'Invalid or missing recipient email' }
  }

  if (!p.booking_id || typeof p.booking_id !== 'string') {
    return { valid: false, error: 'Invalid or missing booking_id' }
  }

  if (!p.data || typeof p.data !== 'object') {
    return { valid: false, error: 'Invalid or missing data object' }
  }

  const data = p.data as Record<string, unknown>
  const requiredFields = [
    'booking_reference',
    'experience_name',
    'experience_date',
    'experience_time',
    'guest_count',
    'total_amount',
    'currency',
    'traveler_name',
  ]

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return { valid: false, error: `Missing required field: data.${field}` }
    }
  }

  return { valid: true, data: payload as EmailPayload }
}

// ================================================
// Helper: Create valid test payload
// ================================================

function createValidPayload(
  overrides: Partial<EmailPayload> = {}
): EmailPayload {
  return {
    type: 'booking_confirmation',
    to: 'test@example.com',
    booking_id: 'booking-123',
    data: {
      booking_reference: 'PUL-ABC123',
      experience_name: 'Sunrise Volcano Trek',
      experience_date: '2026-02-15',
      experience_time: '05:00 AM',
      guest_count: 2,
      total_amount: 180,
      currency: 'USD',
      traveler_name: 'John',
    },
    ...overrides,
  }
}

// ================================================
// Tests
// ================================================

describe('Send Email Payload Validation', () => {
  describe('Valid payloads', () => {
    it('should accept valid booking_confirmation payload', () => {
      const payload = createValidPayload({ type: 'booking_confirmation' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.type).toBe('booking_confirmation')
      }
    })

    it('should accept valid booking_cancellation payload', () => {
      const payload = createValidPayload({ type: 'booking_cancellation' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.type).toBe('booking_cancellation')
      }
    })

    it('should accept valid booking_reminder payload', () => {
      const payload = createValidPayload({ type: 'booking_reminder' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.type).toBe('booking_reminder')
      }
    })

    it('should accept payload with optional meeting_point', () => {
      const payload = createValidPayload()
      payload.data.meeting_point = 'Hotel Lobby, Ubud'
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })

    it('should accept payload with optional experience_image', () => {
      const payload = createValidPayload()
      payload.data.experience_image = 'https://example.com/image.jpg'
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })
  })

  describe('Invalid payload format', () => {
    it('should reject null payload', () => {
      const result = validatePayload(null)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid payload format')
      }
    })

    it('should reject undefined payload', () => {
      const result = validatePayload(undefined)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid payload format')
      }
    })

    it('should reject string payload', () => {
      const result = validatePayload('invalid')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid payload format')
      }
    })

    it('should reject array payload', () => {
      const result = validatePayload([])

      expect(result.valid).toBe(false)
    })
  })

  describe('Invalid email type', () => {
    it('should reject missing type', () => {
      const payload = createValidPayload()
       
      delete (payload as any).type

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing email type')
      }
    })

    it('should reject invalid type value', () => {
      const payload = createValidPayload()
       
      ;(payload as any).type = 'invalid_type'

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing email type')
      }
    })

    it('should reject numeric type', () => {
      const payload = createValidPayload()
       
      ;(payload as any).type = 123

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
    })
  })

  describe('Invalid recipient email', () => {
    it('should reject missing to field', () => {
      const payload = createValidPayload()
       
      delete (payload as any).to

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing recipient email')
      }
    })

    it('should reject email without @', () => {
      const payload = createValidPayload({ to: 'invalid-email' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing recipient email')
      }
    })

    it('should reject non-string email', () => {
      const payload = createValidPayload()
       
      ;(payload as any).to = 123

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
    })

    it('should reject empty string email', () => {
      const payload = createValidPayload({ to: '' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
    })
  })

  describe('Invalid booking_id', () => {
    it('should reject missing booking_id', () => {
      const payload = createValidPayload()
       
      delete (payload as any).booking_id

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing booking_id')
      }
    })

    it('should reject non-string booking_id', () => {
      const payload = createValidPayload()
       
      ;(payload as any).booking_id = 123

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
    })
  })

  describe('Invalid data object', () => {
    it('should reject missing data', () => {
      const payload = createValidPayload()
       
      delete (payload as any).data

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBe('Invalid or missing data object')
      }
    })

    it('should reject non-object data', () => {
      const payload = createValidPayload()
       
      ;(payload as any).data = 'not an object'

      const result = validatePayload(payload)

      expect(result.valid).toBe(false)
    })
  })

  describe('Missing required data fields', () => {
    const requiredFields = [
      'booking_reference',
      'experience_name',
      'experience_date',
      'experience_time',
      'guest_count',
      'total_amount',
      'currency',
      'traveler_name',
    ]

    requiredFields.forEach((field) => {
      it(`should reject missing data.${field}`, () => {
        const payload = createValidPayload()
         
        delete (payload.data as any)[field]

        const result = validatePayload(payload)

        expect(result.valid).toBe(false)
        if (!result.valid) {
          expect(result.error).toBe(`Missing required field: data.${field}`)
        }
      })

      it(`should reject null data.${field}`, () => {
        const payload = createValidPayload()
         
        ;(payload.data as any)[field] = null

        const result = validatePayload(payload)

        expect(result.valid).toBe(false)
        if (!result.valid) {
          expect(result.error).toBe(`Missing required field: data.${field}`)
        }
      })
    })
  })

  describe('Edge cases', () => {
    it('should accept zero guest_count', () => {
      const payload = createValidPayload()
      payload.data.guest_count = 0
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })

    it('should accept zero total_amount', () => {
      const payload = createValidPayload()
      payload.data.total_amount = 0
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })

    it('should accept empty string for traveler_name (falsy but defined)', () => {
      const payload = createValidPayload()
      payload.data.traveler_name = ''
      const result = validatePayload(payload)

      // Empty string is defined, so this passes validation
      // Business logic may reject it separately
      expect(result.valid).toBe(true)
    })

    it('should handle email with plus sign', () => {
      const payload = createValidPayload({ to: 'test+tag@example.com' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })

    it('should handle email with subdomain', () => {
      const payload = createValidPayload({ to: 'test@mail.example.com' })
      const result = validatePayload(payload)

      expect(result.valid).toBe(true)
    })
  })
})

describe('Email Hash Function', () => {
  // Mirror the Edge Function's hashEmail for testing
  function hashEmail(email: string): string {
    const encoder = new TextEncoder()
    const data = encoder.encode(email.toLowerCase())
    return btoa(String.fromCharCode(...data)).slice(0, 16)
  }

  it('should produce consistent hash for same email', () => {
    const hash1 = hashEmail('test@example.com')
    const hash2 = hashEmail('test@example.com')

    expect(hash1).toBe(hash2)
  })

  it('should be case-insensitive', () => {
    const hash1 = hashEmail('Test@Example.com')
    const hash2 = hashEmail('test@example.com')

    expect(hash1).toBe(hash2)
  })

  it('should produce different hashes for different emails', () => {
    const hash1 = hashEmail('user1@example.com')
    const hash2 = hashEmail('user2@example.com')

    expect(hash1).not.toBe(hash2)
  })

  it('should truncate to 16 characters', () => {
    const hash = hashEmail('verylongemail@verylongdomain.example.com')

    expect(hash.length).toBe(16)
  })

  it('should only contain base64 characters', () => {
    const hash = hashEmail('test@example.com')

    expect(hash).toMatch(/^[A-Za-z0-9+/=]+$/)
  })
})

describe('HTML Escape Function', () => {
  // Mirror the Edge Function's escapeHtml for testing
  function escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char)
  }

  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b')
  })

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's nice")).toBe('It&#039;s nice')
  })

  it('should handle multiple special characters', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    )
  })

  it('should leave normal text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})

describe('Amount Formatting', () => {
  // Mirror the Edge Function's formatAmount for testing
  function formatAmount(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  it('should format whole numbers with decimal places', () => {
    expect(formatAmount(100)).toBe('100.00')
  })

  it('should format numbers with decimals', () => {
    expect(formatAmount(99.99)).toBe('99.99')
  })

  it('should add thousand separators', () => {
    expect(formatAmount(1234567.89)).toBe('1,234,567.89')
  })

  it('should handle zero', () => {
    expect(formatAmount(0)).toBe('0.00')
  })

  it('should round to two decimal places', () => {
    expect(formatAmount(99.999)).toBe('100.00')
  })
})
