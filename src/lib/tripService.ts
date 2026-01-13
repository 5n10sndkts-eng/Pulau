import { supabase as client, isSupabaseConfigured } from './supabase';
import { Trip, TripItem } from './types';
import { calculateTripTotal } from './helpers';
import { Database } from './database.types';

// Fallback manual definitions to unblock 'never' inference type errors
interface TripRow {
  id: string;
  user_id: string;
  destination_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  created_at: string;
  updated_at: string;
}

interface TripItemRow {
  id: string;
  trip_id: string;
  experience_id: string;
  guests: number;
  total_price: number;
  date: string | null;
  time: string | null;
  created_at: string;
}

interface TripInsert {
  id?: string;
  user_id: string;
  destination_id: string;
  status: string;
  start_date?: string | null;
  end_date?: string | null;
  travelers: number;
  updated_at: string;
  created_at?: string;
}

interface TripItemInsert {
  id?: string;
  trip_id: string;
  experience_id: string;
  guests: number;
  total_price: number;
  date?: string | null;
  time?: string | null;
  created_at?: string;
}

// Ensure supabase client is treated as generic to allow 'any' chaining if strict types fail
const supabase = client as any;

// Use mock data if Supabase not configured or explicitly enabled
const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured();

// Helper to convert DB row to Trip
function toTrip(trip: TripRow, tripItems: TripItemRow[]): Trip {
  const items: TripItem[] = tripItems.map((item) => ({
    experienceId: item.experience_id,
    guests: item.guests,
    totalPrice: Number(item.total_price),
    date: item.date || undefined,
    time: item.time || undefined,
  }));

  const totals = calculateTripTotal(items);

  return {
    id: trip.id,
    userId: trip.user_id,
    destination: trip.destination_id,
    status: trip.status as Trip['status'],
    startDate: trip.start_date || undefined,
    endDate: trip.end_date || undefined,
    travelers: trip.travelers,
    items: items,
    ...totals,
  };
}

export const tripService = {
  /**
   * Get the user's current "active" planning trip
   */
  getActiveTrip: async (userId: string): Promise<Trip | null> => {
    if (USE_MOCK_DATA) {
      const stored = localStorage.getItem(`pulau_trip_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }

    const { data: tripData, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'planning')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[tripService] Error fetching active trip:', error);
      return null;
    }

    if (!tripData) return null;

    const trip = tripData as TripRow;

    // Fetch items
    const { data: itemsData, error: itemsError } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', trip.id);

    if (itemsError) {
      console.error('[tripService] Error fetching trip items:', itemsError);
      return null;
    }

    return toTrip(trip, (itemsData || []) as TripItemRow[]);
  },

  /**
   * Get all trips for a user
   */
  getUserTrips: async (userId: string): Promise<Trip[]> => {
    if (USE_MOCK_DATA) {
      const stored = localStorage.getItem(`pulau_trip_${userId}`);
      return stored ? [JSON.parse(stored)] : [];
    }

    const { data: tripsData, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[tripService] Error fetching user trips:', error);
      return [];
    }

    if (!tripsData || tripsData.length === 0) return [];

    // Fetch all trip items for these trips
    const tripIds = tripsData.map((t: TripRow) => t.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('trip_items')
      .select('*')
      .in('trip_id', tripIds);

    if (itemsError) {
      console.error('[tripService] Error fetching trip items:', itemsError);
      return [];
    }

    const allItems = (itemsData || []) as TripItemRow[];

    return tripsData.map((trip: TripRow) => {
      const tripItems = allItems.filter((item) => item.trip_id === trip.id);
      return toTrip(trip, tripItems);
    });
  },

  /**
   * Create a new trip
   */
  createTrip: async (
    userId: string,
    destination: string = 'bali',
  ): Promise<Trip> => {
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      userId,
      destination,
      status: 'planning',
      travelers: 2,
      items: [],
      subtotal: 0,
      serviceFee: 0,
      total: 0,
    };

    if (USE_MOCK_DATA) {
      localStorage.setItem(`pulau_trip_${userId}`, JSON.stringify(newTrip));
      return newTrip;
    }

    const tripPayload: TripInsert = {
      user_id: userId,
      destination_id: destination,
      status: 'planning',
      travelers: 2,
      updated_at: new Date().toISOString(),
    };

    const { data: savedTrip, error } = await supabase
      .from('trips')
      .insert(tripPayload)
      .select()
      .single();

    if (error) {
      console.error('[tripService] Error creating trip:', error);
      throw error;
    }

    return {
      ...newTrip,
      id: savedTrip.id,
    };
  },

  /**
   * Save/update a trip
   */
  saveTrip: async (trip: Trip): Promise<Trip> => {
    if (USE_MOCK_DATA) {
      localStorage.setItem(`pulau_trip_${trip.userId}`, JSON.stringify(trip));
      return trip;
    }

    // Check if ID is a valid UUID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        trip.id,
      );

    const tripPayload: TripInsert = {
      user_id: trip.userId,
      destination_id: trip.destination || '',
      status: trip.status,
      start_date: trip.startDate,
      end_date: trip.endDate,
      travelers: trip.travelers,
      updated_at: new Date().toISOString(),
    };

    if (isUUID) {
      tripPayload.id = trip.id;
    }

    // Upsert Trip
    const { data: savedTrip, error: tripError } = await supabase
      .from('trips')
      .upsert(tripPayload, { onConflict: 'id' })
      .select()
      .single();

    if (tripError) {
      console.error('[tripService] Error saving trip:', tripError);
      throw tripError;
    }

    if (!savedTrip) {
      throw new Error('Failed to save trip');
    }

    const tripId = savedTrip.id;

    // Replace items: Delete all for this trip, then insert new ones
    const { error: deleteError } = await supabase
      .from('trip_items')
      .delete()
      .eq('trip_id', tripId);

    if (deleteError) {
      console.error(
        '[tripService] Error deleting old trip items:',
        deleteError,
      );
      throw deleteError;
    }

    if (trip.items.length > 0) {
      const itemsPayload: TripItemInsert[] = trip.items.map((item) => ({
        trip_id: tripId,
        experience_id: item.experienceId,
        guests: item.guests,
        total_price: item.totalPrice,
        date: item.date,
        time: item.time,
      }));

      const { error: itemsError } = await supabase
        .from('trip_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.error('[tripService] Error saving trip items:', itemsError);
        throw itemsError;
      }
    }

    return {
      ...trip,
      id: tripId,
    };
  },

  /**
   * Delete a trip
   */
  deleteTrip: async (tripId: string, userId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      localStorage.removeItem(`pulau_trip_${userId}`);
      return;
    }

    // Trip items will cascade delete due to FK constraint
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);

    if (error) {
      console.error('[tripService] Error deleting trip:', error);
      throw error;
    }
  },
};
