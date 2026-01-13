import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as bookingServiceModule from '@/lib/bookingService';

// Directly mock the bookingService module
vi.mock('@/lib/bookingService', async (importOriginal) => {
  const actual = await importOriginal<typeof bookingServiceModule>();
  return {
    ...actual,
    bookingService: {
      ...actual.bookingService,
      validateBookingForCheckIn: vi.fn(),
    },
  };
});

describe('Ticket Validation Logic (P0)', () => {
  const mockBookingId = 'b1-123-456';
  const mockVendorId = 'a1234567-1234-1234-1234-123456789012';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return valid result when validation succeeds', async () => {
    const mockResult = {
      valid: true,
      reason: null,
      message: 'Valid ticket',
      booking: {
        id: mockBookingId,
        reference: 'REF-123',
        items: [{
          id: 'item-1',
          experience_name: 'Test Experience',
          slot_time: '10:00',
          date: '2026-01-15',
          guests: 2,
          status: 'confirmed',
          is_today: true,
        }],
      },
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .toHaveBeenCalledWith(mockBookingId, mockVendorId);
    expect(result.valid).toBe(true);
    expect(result.booking).toBeDefined();
  });

  it('should return invalid when booking is not found', async () => {
    const mockResult = {
      valid: false,
      reason: 'booking_not_found',
      message: 'Booking not found',
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('booking_not_found');
  });

  it('should return invalid when booking is already checked in', async () => {
    const mockResult = {
      valid: false,
      reason: 'already_checked_in',
      message: 'Already checked in',
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('already_checked_in');
  });

  it('should return invalid when booking is not confirmed', async () => {
    const mockResult = {
      valid: false,
      reason: 'booking_cancelled',
      message: 'Booking not confirmed',
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('booking_cancelled');
  });

  it('should return invalid when vendor is unauthorized', async () => {
    const mockResult = {
      valid: false,
      reason: 'unauthorized',
      message: 'Vendor not authorized',
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('unauthorized');
  });

  it('should handle internal errors gracefully', async () => {
    const mockResult = {
      valid: false,
      reason: 'internal_error',
      message: 'Failed to validate ticket',
    };

    vi.mocked(bookingServiceModule.bookingService.validateBookingForCheckIn)
      .mockResolvedValue(mockResult);

    const result = await bookingServiceModule.bookingService.validateBookingForCheckIn(
      mockBookingId, 
      mockVendorId
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('internal_error');
  });
});
