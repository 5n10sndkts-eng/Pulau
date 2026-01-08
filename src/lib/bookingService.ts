import { supabase } from './supabase'
import { Booking, Trip, TripItem } from './types'
import { Database } from './database.types'
import { calculateTripTotal } from './helpers'

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

type BookingRow = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']

export const bookingService = {
    // Create a new booking
    createBooking: async (booking: Booking): Promise<Booking | null> => {
        if (USE_MOCK_DATA) {
            const stored = localStorage.getItem('pulau_bookings')
            const bookings: Booking[] = stored ? JSON.parse(stored) : []
            bookings.push(booking)
            localStorage.setItem('pulau_bookings', JSON.stringify(bookings))
            return booking
        }

        const payload: BookingInsert = {
            id: booking.id,
            trip_id: booking.tripId,
            reference: booking.reference,
            status: booking.status,
            booked_at: booking.bookedAt
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert(payload)
            .select()
            .single()

        if (error) {
            console.error('Error creating booking:', error)
            return null
        }

        return {
            ...booking,
            id: data.id
        }
    },

    // Get all bookings for a user
    getUserBookings: async (userId: string): Promise<Booking[]> => {
        if (USE_MOCK_DATA) {
            const stored = localStorage.getItem('pulau_bookings')
            const bookings: Booking[] = stored ? JSON.parse(stored) : []
            return bookings.filter(b => b.trip.userId === userId)
        }

        // Join bookings with trips to filter by userId
        // Note: 'trips!inner' ensures we only get bookings that have a valid trip belonging to the user
        // We also select trip items to reconstruct the Trip object
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        trips!inner (
          *,
          trip_items (*)
        )
      `)
            .eq('trips.user_id', userId)
            .order('booked_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookings:', error)
            return []
        }

        // Map to Booking type
        const bookings: Booking[] = data.map((row: any) => {
            const tripData = row.trips
            // tripData.trip_items is an array of items
            const tripItemsRaw = tripData.trip_items || []

            const items: TripItem[] = tripItemsRaw.map((item: any) => ({
                experienceId: item.experience_id,
                guests: item.guests,
                totalPrice: Number(item.total_price),
                date: item.date || undefined,
                time: item.time || undefined
            }))

            const totals = calculateTripTotal(items)

            const trip: Trip = {
                id: tripData.id,
                userId: tripData.user_id,
                destination: tripData.destination_id,
                status: tripData.status as Trip['status'],
                startDate: tripData.start_date || undefined,
                endDate: tripData.end_date || undefined,
                travelers: tripData.travelers,
                items: items,
                ...totals
            }

            return {
                id: row.id,
                tripId: row.trip_id,
                reference: row.reference,
                status: row.status as Booking['status'],
                bookedAt: row.booked_at,
                trip: trip
            }
        })

        return bookings
    }
}
