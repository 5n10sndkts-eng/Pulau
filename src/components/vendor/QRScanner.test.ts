/**
 * QR Scanner Unit Tests
 * Story: 27.1 - Build QR Code Scanner Interface
 * Story: 27.2 - Implement Ticket Validation Logic
 *
 * Tests QR code parsing and validation logic
 * Camera functionality tested manually (requires device)
 */

import { describe, it, expect } from 'vitest'

// ================================================
// QR Data Parsing Logic (extracted for testing)
// ================================================

interface QRData {
  bookingId?: string
  bookingReference?: string
  type?: 'pulau-ticket'
}

/**
 * Parse QR code data and extract booking ID
 * Supports JSON format and plain booking reference
 */
function parseQRData(data: string): string | null {
  // Try parsing as JSON first (structured ticket format)
  try {
    const parsed: QRData = JSON.parse(data)

    // Check for Pulau ticket format
    if (parsed.type === 'pulau-ticket') {
      return parsed.bookingId || parsed.bookingReference || null
    }

    // Fallback to any booking ID field
    return parsed.bookingId || parsed.bookingReference || null
  } catch {
    // Not JSON - treat as plain booking reference
    // Validate it looks like a booking reference (e.g., PUL-XXXXXX or UUID)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const refPattern = /^PUL-[A-Z0-9]{6,}$/i

    if (uuidPattern.test(data) || refPattern.test(data)) {
      return data
    }

    // Allow any alphanumeric string of reasonable length as fallback
    if (/^[A-Za-z0-9-]{6,50}$/.test(data)) {
      return data
    }

    return null
  }
}

// ================================================
// Ticket Validation Logic
// ================================================

type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'refunded' | 'no_show'

interface Booking {
  id: string
  reference: string
  status: BookingStatus
  slotDate: string
  slotTime: string
  guestCount: number
  experienceName: string
}

interface ValidationResult {
  valid: boolean
  errorCode?: string
  errorMessage?: string
  booking?: Booking
}

/**
 * Validate a scanned ticket against booking rules
 * Story: 27.2 - Implement Ticket Validation Logic
 */
function validateTicket(
  booking: Booking | null,
  currentDate: Date
): ValidationResult {
  // 1. Check booking exists
  if (!booking) {
    return {
      valid: false,
      errorCode: 'BOOKING_NOT_FOUND',
      errorMessage: 'Booking not found. Please verify the ticket.'
    }
  }

  // 2. Check booking status is valid for check-in
  if (booking.status === 'cancelled') {
    return {
      valid: false,
      errorCode: 'BOOKING_CANCELLED',
      errorMessage: 'This booking has been cancelled.'
    }
  }

  if (booking.status === 'refunded') {
    return {
      valid: false,
      errorCode: 'BOOKING_REFUNDED',
      errorMessage: 'This booking has been refunded.'
    }
  }

  if (booking.status === 'checked_in') {
    return {
      valid: false,
      errorCode: 'ALREADY_CHECKED_IN',
      errorMessage: 'This ticket has already been checked in.'
    }
  }

  if (booking.status === 'no_show') {
    return {
      valid: false,
      errorCode: 'MARKED_NO_SHOW',
      errorMessage: 'This booking was marked as no-show.'
    }
  }

  if (booking.status !== 'confirmed') {
    return {
      valid: false,
      errorCode: 'INVALID_STATUS',
      errorMessage: `Cannot check in booking with status: ${booking.status}`
    }
  }

  // 3. Check booking is for today
  const bookingDate = new Date(booking.slotDate)
  const today = new Date(currentDate)

  // Reset time portion for date comparison
  bookingDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  if (bookingDate.getTime() !== today.getTime()) {
    const isExpired = bookingDate < today
    const isFuture = bookingDate > today

    if (isExpired) {
      return {
        valid: false,
        errorCode: 'BOOKING_EXPIRED',
        errorMessage: `This ticket was for ${booking.slotDate}. It has expired.`
      }
    }

    if (isFuture) {
      return {
        valid: false,
        errorCode: 'BOOKING_FUTURE',
        errorMessage: `This ticket is for ${booking.slotDate}. Not valid today.`
      }
    }
  }

  // 4. Valid ticket
  return {
    valid: true,
    booking
  }
}

// ================================================
// Tests: QR Data Parsing
// ================================================

describe('QR Scanner - parseQRData', () => {
  describe('[P0] Valid QR formats', () => {
    it('should parse JSON format with bookingId', () => {
      // GIVEN: JSON QR data with bookingId
      const qrData = JSON.stringify({
        type: 'pulau-ticket',
        bookingId: 'abc123def456'
      })

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns booking ID
      expect(result).toBe('abc123def456')
    })

    it('should parse JSON format with bookingReference', () => {
      // GIVEN: JSON QR data with bookingReference
      const qrData = JSON.stringify({
        type: 'pulau-ticket',
        bookingReference: 'PUL-ABC123'
      })

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns booking reference
      expect(result).toBe('PUL-ABC123')
    })

    it('should parse plain UUID format', () => {
      // GIVEN: Plain UUID string
      const qrData = '550e8400-e29b-41d4-a716-446655440000'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns UUID
      expect(result).toBe('550e8400-e29b-41d4-a716-446655440000')
    })

    it('should parse plain PUL- reference format', () => {
      // GIVEN: Plain PUL- reference
      const qrData = 'PUL-ABC123XYZ'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns reference
      expect(result).toBe('PUL-ABC123XYZ')
    })

    it('should parse alphanumeric booking reference', () => {
      // GIVEN: Alphanumeric string
      const qrData = 'BOOKING-12345-ABCDE'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns reference
      expect(result).toBe('BOOKING-12345-ABCDE')
    })
  })

  describe('[P1] JSON edge cases', () => {
    it('should prefer bookingId over bookingReference', () => {
      // GIVEN: JSON with both fields
      const qrData = JSON.stringify({
        bookingId: 'id-123',
        bookingReference: 'ref-456'
      })

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns bookingId
      expect(result).toBe('id-123')
    })

    it('should handle JSON without pulau-ticket type', () => {
      // GIVEN: JSON without type field
      const qrData = JSON.stringify({
        bookingId: 'generic-booking-id'
      })

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Still returns bookingId
      expect(result).toBe('generic-booking-id')
    })
  })

  describe('[P1] Invalid QR formats', () => {
    it('should reject too short strings', () => {
      // GIVEN: String too short
      const qrData = 'ABC'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns null
      expect(result).toBeNull()
    })

    it('should reject too long strings', () => {
      // GIVEN: String too long (> 50 chars)
      const qrData = 'A'.repeat(60)

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns null
      expect(result).toBeNull()
    })

    it('should reject strings with special characters', () => {
      // GIVEN: String with invalid characters
      const qrData = 'booking@#$%invalid'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns null
      expect(result).toBeNull()
    })

    it('should reject empty JSON object', () => {
      // GIVEN: Empty JSON
      const qrData = '{}'

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns null
      expect(result).toBeNull()
    })

    it('should reject JSON without booking fields', () => {
      // GIVEN: JSON without booking fields
      const qrData = JSON.stringify({ name: 'test', value: 123 })

      // WHEN: Parsing QR data
      const result = parseQRData(qrData)

      // THEN: Returns null
      expect(result).toBeNull()
    })
  })
})

// ================================================
// Tests: Ticket Validation Logic
// ================================================

describe('Ticket Validation - validateTicket', () => {
  const mockBooking: Booking = {
    id: 'booking-123',
    reference: 'PUL-ABC123',
    status: 'confirmed',
    slotDate: '2026-01-10',
    slotTime: '10:00',
    guestCount: 2,
    experienceName: 'Sunset Snorkeling'
  }

  describe('[P0] Valid ticket scenarios', () => {
    it('should validate confirmed booking for today', () => {
      // GIVEN: Confirmed booking for today
      const booking = { ...mockBooking, status: 'confirmed' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Ticket is valid
      expect(result.valid).toBe(true)
      expect(result.booking).toEqual(booking)
      expect(result.errorCode).toBeUndefined()
    })
  })

  describe('[P0] Invalid status scenarios', () => {
    it('should reject booking not found', () => {
      // GIVEN: No booking
      const today = new Date('2026-01-10')

      // WHEN: Validating null booking
      const result = validateTicket(null, today)

      // THEN: Returns not found error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('BOOKING_NOT_FOUND')
    })

    it('should reject cancelled booking', () => {
      // GIVEN: Cancelled booking
      const booking = { ...mockBooking, status: 'cancelled' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns cancelled error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('BOOKING_CANCELLED')
    })

    it('should reject refunded booking', () => {
      // GIVEN: Refunded booking
      const booking = { ...mockBooking, status: 'refunded' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns refunded error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('BOOKING_REFUNDED')
    })

    it('should reject already checked-in booking', () => {
      // GIVEN: Already checked-in booking
      const booking = { ...mockBooking, status: 'checked_in' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns already checked-in error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('ALREADY_CHECKED_IN')
    })

    it('should reject no-show booking', () => {
      // GIVEN: No-show booking
      const booking = { ...mockBooking, status: 'no_show' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns no-show error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('MARKED_NO_SHOW')
    })

    it('should reject pending booking', () => {
      // GIVEN: Pending booking (not yet confirmed)
      const booking = { ...mockBooking, status: 'pending' as BookingStatus }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns invalid status error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('INVALID_STATUS')
    })
  })

  describe('[P0] Date validation scenarios', () => {
    it('should reject expired booking (past date)', () => {
      // GIVEN: Booking for yesterday
      const booking = { ...mockBooking, slotDate: '2026-01-09' }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns expired error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('BOOKING_EXPIRED')
      expect(result.errorMessage).toContain('2026-01-09')
    })

    it('should reject future booking', () => {
      // GIVEN: Booking for tomorrow
      const booking = { ...mockBooking, slotDate: '2026-01-11' }
      const today = new Date('2026-01-10')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Returns future booking error
      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('BOOKING_FUTURE')
      expect(result.errorMessage).toContain('2026-01-11')
    })
  })

  describe('[P1] Edge cases', () => {
    it('should validate booking at midnight boundary', () => {
      // GIVEN: Booking for today at 23:59
      const booking = { ...mockBooking, slotDate: '2026-01-10', slotTime: '23:59' }
      const today = new Date('2026-01-10T23:30:00')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Ticket is valid (same day)
      expect(result.valid).toBe(true)
    })

    it('should handle early morning check-in', () => {
      // GIVEN: Booking for today checked at 6am
      const booking = { ...mockBooking, slotDate: '2026-01-10', slotTime: '08:00' }
      const today = new Date('2026-01-10T06:00:00')

      // WHEN: Validating ticket
      const result = validateTicket(booking, today)

      // THEN: Ticket is valid (same day)
      expect(result.valid).toBe(true)
    })
  })
})
