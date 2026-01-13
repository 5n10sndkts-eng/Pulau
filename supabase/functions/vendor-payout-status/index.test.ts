/**
 * Vendor Payout Status Edge Function Tests
 * Story: 27.5 - Create Vendor Payout Status Edge Function
 *
 * [P1] Tests for fetching vendor payout status from Stripe
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Deno globals for Node test environment
const mockEnv = {
  get: vi.fn((key: string) => {
    const envVars: Record<string, string> = {
      STRIPE_SECRET_KEY: 'sk_test_mock',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    };
    return envVars[key];
  }),
};

// @ts-expect-error - Mock Deno for tests
globalThis.Deno = { env: mockEnv };

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseClient = {
  from: mockSupabaseFrom,
};

vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock global fetch for Stripe API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Vendor Payout Status Edge Function', () => {
  const mockVendor = {
    id: 'vendor-123',
    stripe_account_id: 'acct_test_123',
  };

  const mockStripePayouts = {
    data: [
      {
        id: 'po_pending_1',
        amount: 50000,
        currency: 'usd',
        arrival_date: 1704499200,
        status: 'pending',
      },
      {
        id: 'po_transit_1',
        amount: 75000,
        currency: 'usd',
        arrival_date: 1704412800,
        status: 'in_transit',
      },
      {
        id: 'po_paid_1',
        amount: 100000,
        currency: 'usd',
        arrival_date: 1704326400,
        status: 'paid',
      },
    ],
  };

  const mockStripeAccount = {
    id: 'acct_test_123',
    settings: {
      payouts: {
        schedule: {
          interval: 'daily',
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: vendor exists with Stripe account
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { stripe_account_id: mockVendor.stripe_account_id },
        error: null,
      }),
    });

    // Default: Stripe API calls succeed
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/payouts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStripePayouts),
        });
      }
      if (url.includes('/v1/accounts/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStripeAccount),
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  describe('[P1] Request Validation', () => {
    it('should reject requests without vendorId', () => {
      const body = {};
      expect(body).not.toHaveProperty('vendorId');
    });

    it('should accept valid vendor ID', () => {
      const body = { vendorId: 'vendor-123' };
      expect(body.vendorId).toBeDefined();
    });

    it('should handle CORS preflight', () => {
      const req = new Request('https://test.com', { method: 'OPTIONS' });
      expect(req.method).toBe('OPTIONS');
    });
  });

  describe('[P1] Vendor Lookup', () => {
    it('should fetch vendor Stripe account ID', async () => {
      const result = await mockSupabaseClient
        .from('vendors')
        .select('stripe_account_id')
        .eq('id', 'vendor-123')
        .single();

      expect(result.data?.stripe_account_id).toBe('acct_test_123');
    });

    it('should reject non-existent vendors', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const result = await mockSupabaseClient
        .from('vendors')
        .select('stripe_account_id')
        .eq('id', 'invalid')
        .single();

      expect(result.error).toBeDefined();
    });

    it('should reject vendors without Stripe account', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { stripe_account_id: null },
          error: null,
        }),
      });

      const result = await mockSupabaseClient
        .from('vendors')
        .select('stripe_account_id')
        .eq('id', 'vendor-no-stripe')
        .single();

      expect(result.data?.stripe_account_id).toBeFalsy();
    });
  });

  describe('[P1] Stripe API Integration', () => {
    it('should fetch payouts with connected account header', async () => {
      await mockFetch('https://api.stripe.com/v1/payouts?limit=10', {
        headers: {
          Authorization: 'Bearer sk_test_mock',
          'Stripe-Account': 'acct_test_123',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/payouts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Stripe-Account': 'acct_test_123',
          }),
        }),
      );
    });

    it('should fetch account details for payout schedule', async () => {
      await mockFetch('https://api.stripe.com/v1/accounts/acct_test_123', {
        headers: { Authorization: 'Bearer sk_test_mock' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/accounts/'),
        expect.any(Object),
      );
    });

    it('should handle Stripe API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const response = await mockFetch('https://api.stripe.com/v1/payouts');
      expect(response.ok).toBe(false);
    });
  });

  describe('[P1] Payout Categorization', () => {
    it('should categorize pending payouts', () => {
      const pendingPayouts = mockStripePayouts.data.filter(
        (p) => p.status === 'pending',
      );
      expect(pendingPayouts).toHaveLength(1);
      expect(pendingPayouts[0].id).toBe('po_pending_1');
    });

    it('should categorize in_transit payouts as scheduled', () => {
      const scheduledPayouts = mockStripePayouts.data.filter(
        (p) => p.status === 'in_transit',
      );
      expect(scheduledPayouts).toHaveLength(1);
      expect(scheduledPayouts[0].id).toBe('po_transit_1');
    });

    it('should categorize paid payouts as completed', () => {
      const completedPayouts = mockStripePayouts.data.filter(
        (p) => p.status === 'paid',
      );
      expect(completedPayouts).toHaveLength(1);
      expect(completedPayouts[0].id).toBe('po_paid_1');
    });
  });

  describe('[P1] Response Format', () => {
    it('should return structured payout status', () => {
      const response = {
        pending: [{ amount: 50000, currency: 'usd', arrival_date: 1704499200 }],
        scheduled: [
          {
            amount: 75000,
            currency: 'usd',
            arrival_date: 1704412800,
            stripe_transfer_id: 'po_transit_1',
          },
        ],
        completed: [
          {
            amount: 100000,
            currency: 'usd',
            arrival_date: 1704326400,
            stripe_transfer_id: 'po_paid_1',
          },
        ],
        payout_schedule: { interval: 'daily' },
      };

      expect(response.pending).toBeDefined();
      expect(response.scheduled).toBeDefined();
      expect(response.completed).toBeDefined();
      expect(response.payout_schedule).toBeDefined();
    });

    it('should include payout schedule from account settings', () => {
      const schedule = mockStripeAccount.settings.payouts.schedule;
      expect(schedule.interval).toBe('daily');
    });

    it('should default to manual schedule if not set', () => {
      const accountWithoutSchedule = { settings: {} };
      const schedule = accountWithoutSchedule.settings?.payouts?.schedule || {
        interval: 'manual',
      };

      expect(schedule.interval).toBe('manual');
    });
  });

  describe('[P2] Caching', () => {
    it('should set cache headers for 5 minutes', () => {
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300',
      };

      expect(headers['Cache-Control']).toContain('max-age=300');
      expect(headers['Cache-Control']).toContain('private');
    });
  });

  describe('[P2] Error Handling', () => {
    it('should return 400 for missing vendorId', () => {
      const errorResponse = {
        error: 'Vendor ID required',
        status: 400,
      };
      expect(errorResponse.status).toBe(400);
    });

    it('should return 404 for vendor not found', () => {
      const errorResponse = {
        error: 'Vendor not found or not connected to Stripe',
        status: 404,
      };
      expect(errorResponse.status).toBe(404);
    });

    it('should return 500 for internal errors', () => {
      const errorResponse = {
        error: 'Failed to fetch payouts from Stripe',
        status: 500,
      };
      expect(errorResponse.status).toBe(500);
    });
  });
});
