/**
 * Payment Service Tests
 * Story: 24.7 - Create Payment Service Module
 *
 * Unit tests for fee calculations and utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  PLATFORM_FEE_PERCENTAGE,
  calculatePlatformFee,
  calculateVendorPayout,
  formatAmountFromCents,
  isPaymentSuccessful,
  isPaymentRefunded,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from './paymentService'
import type { Payment } from './types'

describe('paymentService', () => {
  describe('Constants', () => {
    it('should have platform fee percentage of 15%', () => {
      expect(PLATFORM_FEE_PERCENTAGE).toBe(0.15)
    })
  })

  describe('calculatePlatformFee', () => {
    it('calculates 15% fee correctly for round numbers', () => {
      expect(calculatePlatformFee(10000)).toBe(1500) // $100 -> $15
      expect(calculatePlatformFee(20000)).toBe(3000) // $200 -> $30
    })

    it('rounds fractional cents correctly', () => {
      expect(calculatePlatformFee(1234)).toBe(185) // 1234 * 0.15 = 185.1 -> 185
      expect(calculatePlatformFee(1235)).toBe(185) // 1235 * 0.15 = 185.25 -> 185
      expect(calculatePlatformFee(1237)).toBe(186) // 1237 * 0.15 = 185.55 -> 186
    })

    it('handles zero amount', () => {
      expect(calculatePlatformFee(0)).toBe(0)
    })

    it('handles small amounts', () => {
      expect(calculatePlatformFee(100)).toBe(15) // $1 -> $0.15
      expect(calculatePlatformFee(50)).toBe(8) // $0.50 -> $0.08 (rounded)
    })
  })

  describe('calculateVendorPayout', () => {
    it('calculates 85% payout correctly', () => {
      expect(calculateVendorPayout(10000)).toBe(8500) // $100 -> $85
      expect(calculateVendorPayout(20000)).toBe(17000) // $200 -> $170
    })

    it('is consistent with calculatePlatformFee', () => {
      const amounts = [1000, 1234, 5678, 10000, 99999]
      for (const amount of amounts) {
        const fee = calculatePlatformFee(amount)
        const payout = calculateVendorPayout(amount)
        expect(fee + payout).toBe(amount)
      }
    })

    it('handles zero amount', () => {
      expect(calculateVendorPayout(0)).toBe(0)
    })
  })

  describe('formatAmountFromCents', () => {
    it('formats USD correctly', () => {
      expect(formatAmountFromCents(1000)).toBe('$10.00')
      expect(formatAmountFromCents(1234)).toBe('$12.34')
      expect(formatAmountFromCents(100)).toBe('$1.00')
    })

    it('handles zero', () => {
      expect(formatAmountFromCents(0)).toBe('$0.00')
    })

    it('handles large amounts', () => {
      expect(formatAmountFromCents(1000000)).toBe('$10,000.00')
    })

    it('handles different currencies', () => {
      // EUR formatting may vary by locale, but should include symbol
      const eurFormat = formatAmountFromCents(1000, 'EUR')
      expect(eurFormat).toContain('10')
    })
  })

  describe('isPaymentSuccessful', () => {
    it('returns true for succeeded status', () => {
      expect(isPaymentSuccessful('succeeded')).toBe(true)
    })

    it('returns false for other statuses', () => {
      expect(isPaymentSuccessful('pending')).toBe(false)
      expect(isPaymentSuccessful('failed')).toBe(false)
      expect(isPaymentSuccessful('refunded')).toBe(false)
      expect(isPaymentSuccessful('partially_refunded')).toBe(false)
    })
  })

  describe('isPaymentRefunded', () => {
    it('returns true for refunded status', () => {
      expect(isPaymentRefunded('refunded')).toBe(true)
    })

    it('returns true for partially_refunded status', () => {
      expect(isPaymentRefunded('partially_refunded')).toBe(true)
    })

    it('returns false for other statuses', () => {
      expect(isPaymentRefunded('pending')).toBe(false)
      expect(isPaymentRefunded('succeeded')).toBe(false)
      expect(isPaymentRefunded('failed')).toBe(false)
    })
  })

  describe('getPaymentStatusLabel', () => {
    it('returns correct labels for all statuses', () => {
      expect(getPaymentStatusLabel('pending')).toBe('Pending')
      expect(getPaymentStatusLabel('succeeded')).toBe('Paid')
      expect(getPaymentStatusLabel('failed')).toBe('Failed')
      expect(getPaymentStatusLabel('refunded')).toBe('Refunded')
      expect(getPaymentStatusLabel('partially_refunded')).toBe('Partially Refunded')
    })
  })

  describe('getPaymentStatusColor', () => {
    it('returns correct color classes for all statuses', () => {
      expect(getPaymentStatusColor('pending')).toContain('yellow')
      expect(getPaymentStatusColor('succeeded')).toContain('green')
      expect(getPaymentStatusColor('failed')).toContain('red')
      expect(getPaymentStatusColor('refunded')).toContain('gray')
      expect(getPaymentStatusColor('partially_refunded')).toContain('orange')
    })
  })
})

describe('Payment Type Structure', () => {
  it('Payment type should have all required fields', () => {
    // This is a compile-time check via TypeScript
    const mockPayment: Payment = {
      id: 'test-id',
      bookingId: 'booking-id',
      stripePaymentIntentId: 'pi_test',
      stripeCheckoutSessionId: 'cs_test',
      amount: 10000,
      currency: 'usd',
      platformFee: 1500,
      vendorPayout: 8500,
      status: 'succeeded',
      refundAmount: 0,
      refundReason: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    expect(mockPayment.amount).toBe(10000)
    expect(mockPayment.platformFee + mockPayment.vendorPayout).toBe(mockPayment.amount)
  })
})
