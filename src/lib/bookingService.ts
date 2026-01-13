import { supabase, isSupabaseConfigured } from './supabase';
import { Booking, Trip, TripItem } from './types';
import { Database } from './database.types';
import { calculateTripTotal } from './helpers';
import { createAuditEntry } from './auditService';

const isMockMode = () => import.meta.env.VITE_USE_MOCK_AUTH === 'true';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

/**
 * RPC function parameter types for validate_booking_for_checkin
 */
interface ValidateBookingParams {
  p_booking_id: string;
  p_vendor_id: string;
}

/**
 * RPC function return type for validate_booking_for_checkin
 */
interface ValidateBookingRpcResponse {
  valid: boolean;
  reason?: CheckInValidationReason;
  message?: string;
  booking?: {
    id: string;
    reference: string;
    items: Array<{
      id: string;
      experience_name: string;
      slot_time: string;
      date: string;
      guests: number;
      status: string;
      is_today: boolean;
    }>;
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeBookingId(raw: string): string {
  return raw.trim();
}

function isValidUuid(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export type CheckInValidationReason =
  | 'booking_not_found'
  | 'unauthorized'
  | 'booking_cancelled'
  | 'booking_refunded'
  | 'already_checked_in'
  | 'wrong_date'
  | 'internal_error';

export interface CheckInValidationResult {
  valid: boolean;
  reason: CheckInValidationReason | null;
  message: string;
  booking?: {
    id: string;
    reference: string;
    items: Array<{
      id: string;
      experience_name: string;
      slot_time: string;
      date: string;
      guests: number;
      status: string;
      is_today: boolean;
    }>;
  };
}

export const bookingService = {
  // Create a new booking
  createBooking: async (booking: Booking): Promise<Booking | null> => {
    if (isMockMode()) {
      const stored = localStorage.getItem('pulau_bookings');
      const bookings: Booking[] = stored ? JSON.parse(stored) : [];
      bookings.push(booking);
      localStorage.setItem('pulau_bookings', JSON.stringify(bookings));
      return booking;
    }

    if (!isSupabaseConfigured()) {
      console.warn(
        '[bookingService] Supabase not configured; createBooking skipped',
      );
      return null;
    }

    const payload: BookingInsert = {
      id: booking.id,
      trip_id: booking.tripId,
      reference: booking.reference,
      status: booking.status,
      booked_at: booking.bookedAt,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return null;
    }

    return {
      ...booking,
      id: data.id,
    };
  },

  // Get all bookings for a user
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    if (isMockMode()) {
      const stored = localStorage.getItem('pulau_bookings');
      const bookings: Booking[] = stored ? JSON.parse(stored) : [];
      return bookings.filter((b) => b.trip.userId === userId);
    }

    if (!isSupabaseConfigured()) {
      console.warn(
        '[bookingService] Supabase not configured; returning empty bookings',
      );
      return [];
    }

    // Join bookings with trips to filter by userId
    // Note: 'trips!inner' ensures we only get bookings that have a valid trip belonging to the user
    // We also select trip items to reconstruct the Trip object
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        trips!inner (
          *,
          trip_items (*)
        )
      `,
      )
      .eq('trips.user_id', userId)
      .order('booked_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    // Map to Booking type
    const bookings: Booking[] = data.map((row: any) => {
      const tripData = row.trips;
      // tripData.trip_items is an array of items
      const tripItemsRaw = tripData.trip_items || [];

      const items: TripItem[] = tripItemsRaw.map((item: any) => ({
        experienceId: item.experience_id,
        guests: item.guests,
        totalPrice: Number(item.total_price),
        date: item.date || undefined,
        time: item.time || undefined,
      }));

      const totals = calculateTripTotal(items);

      const trip: Trip = {
        id: tripData.id,
        userId: tripData.user_id,
        destination: tripData.destination_id,
        status: tripData.status as Trip['status'],
        startDate: tripData.start_date || undefined,
        endDate: tripData.end_date || undefined,
        travelers: tripData.travelers,
        items: items,
        ...totals,
      };

      return {
        id: row.id,
        tripId: row.trip_id,
        reference: row.reference,
        status: row.status as Booking['status'],
        bookedAt: row.booked_at,
        trip: trip,
      };
    });

    return bookings;
  },

  // Validate a booking for check-in (Epic 27.2)
  validateBookingForCheckIn: async (
    bookingId: string,
    vendorId: string,
  ): Promise<CheckInValidationResult> => {
    const normalizedBookingId = normalizeBookingId(bookingId);

    if (!normalizedBookingId) {
      return {
        valid: false,
        reason: 'booking_not_found',
        message: 'Missing booking identifier',
      };
    }

    if (!isValidUuid(vendorId)) {
      return {
        valid: false,
        reason: 'unauthorized',
        message: 'Invalid vendor identifier',
      };
    }

    if (isMockMode()) {
      const stored = localStorage.getItem('pulau_bookings');
      const bookings: Booking[] = stored ? JSON.parse(stored) : [];
      const booking = bookings.find(
        (b) =>
          b.id === normalizedBookingId || b.reference === normalizedBookingId,
      );

      if (!booking) {
        return {
          valid: false,
          reason: 'booking_not_found',
          message: 'This ticket is not in our system.',
        };
      }

      // Mock date check - compare only dates
      const today = new Date().toISOString().split('T')[0]!;
      const bookingDate: string = booking.trip.items[0]?.date || today; // Simplified for mock

      if (bookingDate && bookingDate !== today) {
        return {
          valid: true, // We allow in mock for testing
          reason: 'wrong_date',
          message: `Mock Validation: This booking is for ${bookingDate}, but we are allowing it in mock mode.`,
        };
      }

      return {
        valid: true,
        reason: null,
        message: 'Valid ticket (Mock Mode)',
        booking: {
          id: booking.id,
          reference: booking.reference,
          items: [
            {
              id: 'mock-item-1',
              experience_name:
                booking.trip.items[0]?.experienceId || 'Experience',
              slot_time: booking.trip.items[0]?.time || '10:00',
              date: bookingDate,
              guests: booking.trip.items[0]?.guests || 2,
              status: booking.status,
              is_today: bookingDate === today,
            },
          ],
        },
      };
    }

    if (!isSupabaseConfigured()) {
      console.warn(
        '[bookingService] Supabase not configured; validation failed',
      );
      return {
        valid: false,
        reason: 'internal_error',
        message: 'Supabase not configured on this client.',
      };
    }

    // Call RPC function - custom name so we type-assert
    const { data, error } = await supabase.rpc(
      'validate_booking_for_checkin' as any,
      {
        p_booking_id: normalizedBookingId,
        p_vendor_id: vendorId,
      } satisfies ValidateBookingParams,
    );

    if (error) {
      console.error('Error validating booking:', error);
      return {
        valid: false,
        reason: 'internal_error',
        message: 'Failed to validate ticket. Please check your connection.',
      };
    }

    // Type-safe response parsing
    const response = data as unknown as ValidateBookingRpcResponse;

    if (!response.valid) {
      return {
        valid: false,
        reason: response.reason || 'internal_error',
        message: response.message || 'Validation failed',
      };
    }

    return {
      valid: true,
      reason: null,
      message: response.message || 'Valid ticket',
      booking: response.booking,
    };
  },

  // Check a guest in and persist audit trail (Epic 27.3)
  checkInBooking: async (
    bookingId: string,
    vendorId: string,
  ): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured; cannot persist check-in');
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error checking in booking:', error);
      throw new Error('Failed to check in booking');
    }

    await createAuditEntry({
      eventType: 'booking.checked_in',
      entityType: 'booking',
      entityId: bookingId,
      actorId: vendorId,
      actorType: 'vendor',
      metadata: {
        vendor_id: vendorId,
        checked_in_at: new Date().toISOString(),
      },
    });
  },

  // Mark booking as no-show with audit trail (Epic 27.4)
  markNoShow: async (bookingId: string, vendorId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured; cannot persist no-show');
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'no_show',
        // We use a custom metadata or column for no-show time if available
        // for now we just use the status update
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error marking no-show:', error);
      throw new Error('Failed to mark as no-show');
    }

    await createAuditEntry({
      eventType: 'booking.no_show',
      entityType: 'booking',
      entityId: bookingId,
      actorId: vendorId,
      actorType: 'vendor',
      metadata: {
        vendor_id: vendorId,
        marked_at: new Date().toISOString(),
      },
    });
  },
};
