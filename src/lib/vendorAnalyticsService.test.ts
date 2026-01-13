/**
 * Unit tests for vendorAnalyticsService
 * Story: 29.1 - Create Vendor Revenue Dashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatPercentChange,
  getVendorRevenueStats,
  getRevenueByDateRange,
  getPayoutSummary,
  getPayoutStatusLabel,
  getPayoutStatusColor,
  TimePeriod,
} from './vendorAnalyticsService';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
  isSupabaseConfigured: () => false, // Force mock data mode for tests
}));

describe('vendorAnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatCurrency', () => {
    it('formats cents to dollars correctly', () => {
      expect(formatCurrency(100)).toBe('$1');
      expect(formatCurrency(1000)).toBe('$10');
      expect(formatCurrency(10000)).toBe('$100');
      expect(formatCurrency(100000)).toBe('$1,000');
    });

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('formats large amounts with commas', () => {
      expect(formatCurrency(1000000)).toBe('$10,000');
      expect(formatCurrency(10000000)).toBe('$100,000');
      expect(formatCurrency(100000000)).toBe('$1,000,000');
    });

    it('handles negative amounts', () => {
      expect(formatCurrency(-1000)).toBe('-$10');
    });

    it('rounds to whole dollars', () => {
      expect(formatCurrency(150)).toBe('$2'); // 1.50 rounds to 2
      expect(formatCurrency(149)).toBe('$1'); // 1.49 rounds to 1
    });
  });

  describe('formatPercentChange', () => {
    it('formats positive changes with + sign', () => {
      expect(formatPercentChange(10)).toBe('+10%');
      expect(formatPercentChange(100)).toBe('+100%');
      expect(formatPercentChange(1)).toBe('+1%');
    });

    it('formats negative changes with - sign', () => {
      expect(formatPercentChange(-10)).toBe('-10%');
      expect(formatPercentChange(-50)).toBe('-50%');
    });

    it('formats zero as +0%', () => {
      expect(formatPercentChange(0)).toBe('+0%');
    });
  });

  describe('getVendorRevenueStats', () => {
    const vendorId = 'test-vendor-123';

    it('returns stats with expected shape', async () => {
      const stats = await getVendorRevenueStats(vendorId);

      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('revenueThisMonth');
      expect(stats).toHaveProperty('pendingPayouts');
      expect(stats).toHaveProperty('completedPayouts');
      expect(stats).toHaveProperty('periodComparison');
      expect(stats.periodComparison).toHaveProperty('previousPeriod');
      expect(stats.periodComparison).toHaveProperty('percentChange');
    });

    it('returns non-negative amounts', async () => {
      const stats = await getVendorRevenueStats(vendorId);

      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(stats.revenueThisMonth).toBeGreaterThanOrEqual(0);
      expect(stats.pendingPayouts).toBeGreaterThanOrEqual(0);
      expect(stats.completedPayouts).toBeGreaterThanOrEqual(0);
    });

    it('accepts different time periods', async () => {
      const periods: TimePeriod[] = ['7d', '30d', '90d', '12m'];

      for (const period of periods) {
        const stats = await getVendorRevenueStats(vendorId, period);
        expect(stats).toBeDefined();
        expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
      }
    });

    it('accepts optional experienceId filter', async () => {
      const stats = await getVendorRevenueStats(vendorId, '30d', 'exp-123');
      expect(stats).toBeDefined();
      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRevenueByDateRange', () => {
    const vendorId = 'test-vendor-123';

    it('returns array of data points', async () => {
      const data = await getRevenueByDateRange(vendorId, '7d');

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('returns data points with expected shape', async () => {
      const data = await getRevenueByDateRange(vendorId, '7d');
      const point = data[0];

      expect(point).toHaveProperty('date');
      expect(point).toHaveProperty('amount');
      expect(point).toHaveProperty('bookingCount');
    });

    it('returns valid date strings', async () => {
      const data = await getRevenueByDateRange(vendorId, '7d');

      for (const point of data) {
        const date = new Date(point.date);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });

    it('returns non-negative amounts and counts', async () => {
      const data = await getRevenueByDateRange(vendorId, '30d');

      for (const point of data) {
        expect(point.amount).toBeGreaterThanOrEqual(0);
        expect(point.bookingCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns data ordered by date', async () => {
      const data = await getRevenueByDateRange(vendorId, '30d');

      for (let i = 1; i < data.length; i++) {
        const prev = new Date(data[i - 1]!.date);
        const curr = new Date(data[i]!.date);
        expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
      }
    });

    it('accepts optional experienceId filter', async () => {
      const data = await getRevenueByDateRange(vendorId, '30d', 'exp-123');
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('getPayoutSummary', () => {
    const vendorId = 'test-vendor-123';

    it('returns summary with expected shape', async () => {
      const summary = await getPayoutSummary(vendorId);

      expect(summary).toHaveProperty('pendingAmount');
      expect(summary).toHaveProperty('completedAmount');
      expect(summary).toHaveProperty('nextPayoutDate');
      expect(summary).toHaveProperty('lastPayoutDate');
      expect(summary).toHaveProperty('lastPayoutAmount');
    });

    it('returns non-negative amounts', async () => {
      const summary = await getPayoutSummary(vendorId);

      expect(summary.pendingAmount).toBeGreaterThanOrEqual(0);
      expect(summary.completedAmount).toBeGreaterThanOrEqual(0);
    });

    it('returns valid dates or null', async () => {
      const summary = await getPayoutSummary(vendorId);

      if (summary.nextPayoutDate) {
        const date = new Date(summary.nextPayoutDate);
        expect(date.toString()).not.toBe('Invalid Date');
      }

      if (summary.lastPayoutDate) {
        const date = new Date(summary.lastPayoutDate);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });
  });

  describe('payout status helpers', () => {
    it('maps payout status to labels', () => {
      expect(getPayoutStatusLabel('pending')).toBe('Pending');
      expect(getPayoutStatusLabel('in_transit')).toBe('In Transit');
      expect(getPayoutStatusLabel('paid')).toBe('Paid');
      expect(getPayoutStatusLabel('failed')).toBe('Failed');
      expect(getPayoutStatusLabel('canceled')).toBe('Canceled');
      expect(getPayoutStatusLabel('custom' as never)).toBe('custom');
    });

    it('maps payout status to tailwind badge colors', () => {
      expect(getPayoutStatusColor('pending')).toContain('amber');
      expect(getPayoutStatusColor('in_transit')).toContain('blue');
      expect(getPayoutStatusColor('paid')).toContain('emerald');
      expect(getPayoutStatusColor('failed')).toContain('red');
      expect(getPayoutStatusColor('canceled')).toContain('gray');
      expect(getPayoutStatusColor('custom' as never)).toBe(
        'bg-gray-100 text-gray-700',
      );
    });
  });
});
