import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from '@/lib/bookingService';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Ticket Validation Logic (P0)', () => {
  const mockBookingId = 'b1-123-456';
  const mockVendorId = 'v1-789';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authenticated vendor user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: { id: 'u1', user_metadata: { vendor_id: mockVendorId } },
      },
      error: null,
    } as any);
  });

  it('should return valid result when RPC returns success', async () => {
    const mockRpcResponse = {
      valid: true,
      booking: {
        id: mockBookingId,
        status: 'confirmed',
        customer_name: 'Alice',
        guest_count: 2,
      },
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockRpcResponse,
      error: null,
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    // Verify RPC was called with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith(
      'validate_booking_for_checkin',
      expect.objectContaining({
        booking_id_param: mockBookingId,
      }),
    );

    expect(result.valid).toBe(true);
    expect(result.booking).toBeDefined();
    expect(result.booking?.customer_name).toBe('Alice');
  });

  it('should return invalid when booking is not found', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        valid: false,
        error: 'Booking not found',
      },
      error: null,
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Booking not found');
  });

  it('should return invalid when booking is already checked in', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        valid: false,
        error: 'Already checked in',
      },
      error: null,
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Already checked in');
  });

  it('should return invalid when booking is not confirmed', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        valid: false,
        error: 'Booking not confirmed',
      },
      error: null,
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Booking not confirmed');
  });

  it('should return invalid when vendor is unauthorized', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        valid: false,
        error: 'Unauthorized',
      },
      error: null,
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('should handle RPC network errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    } as any);

    const result = await bookingService.validateBooking(mockBookingId);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
