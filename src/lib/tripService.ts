import { SupabaseClient } from '@supabase/supabase-js'
import { supabase as client } from './supabase'
import { Trip, TripItem } from './types'
import { calculateTripTotal } from './helpers'
import { Database } from './database.types'

// Fallback manual definitions to unblock 'never' inference type errors
interface TripRow {
    id: string
    user_id: string
    destination_id: string
    status: string
    start_date: string | null
    end_date: string | null
    travelers: number
    created_at: string
    updated_at: string
}

interface TripItemRow {
    id: string
    trip_id: string
    experience_id: string
    guests: number
    total_price: number
    date: string | null
    time: string | null
    created_at: string
}

interface TripInsert {
    id?: string
    user_id: string
    destination_id: string
    status: string
    start_date?: string | null
    end_date?: string | null
    travelers: number
    updated_at: string
    created_at?: string
}

interface TripItemInsert {
    id?: string
    trip_id: string
    experience_id: string
    guests: number
    total_price: number
    date?: string | null
    time?: string | null
    created_at?: string
}

// Ensure supabase client is treated as generic to allow 'any' chaining if strict types fail
const supabase = client as any

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

export const tripService = {
    // Get the user's current "active" planning trip
    // For simplicity, we just look for the most recent trip with status 'planning'
    getActiveTrip: async (userId: string): Promise<Trip | null> => {
        if (USE_MOCK_DATA) {
            const stored = localStorage.getItem(`pulau_trip_${userId} `)
            return stored ? JSON.parse(stored) : null
        }

        const { data: tripData, error } = await supabase
            .from('trips')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'planning')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('Error fetching active trip:', error)
            return null
        }

        if (!tripData) return null

        const trip = tripData as TripRow

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
            .from('trip_items')
            .select('*')
            .eq('trip_id', trip.id)

        if (itemsError) {
            console.error('Error fetching trip items:', itemsError)
            return null
        }

        const tripItems = (itemsData || []) as TripItemRow[]

        // Map DB items to UI items
        const items: TripItem[] = tripItems.map(item => ({
            experienceId: item.experience_id,
            guests: item.guests,
            totalPrice: Number(item.total_price),
            date: item.date || undefined,
            time: item.time || undefined
        }))

        const totals = calculateTripTotal(items)

        return {
            id: trip.id,
            userId: trip.user_id,
            destination: trip.destination_id,
            status: trip.status as Trip['status'],
            startDate: trip.start_date || undefined,
            endDate: trip.end_date || undefined,
            travelers: trip.travelers,
            items: items,
            ...totals
        }
    },

    saveTrip: async (trip: Trip): Promise<Trip> => {
        if (USE_MOCK_DATA) {
            localStorage.setItem(`pulau_trip_${trip.userId} `, JSON.stringify(trip))
            return trip
        }

        // Prepare Trip Payload
        // Check if ID is a valid UUID (simple regex check) to decide if we should include it
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trip.id)

        const tripPayload: TripInsert = {
            user_id: trip.userId,
            destination_id: trip.destination || '', // Handle potential undefined if strict
            status: trip.status,
            start_date: trip.startDate,
            end_date: trip.endDate,
            travelers: trip.travelers,
            updated_at: new Date().toISOString()
        }

        if (isUUID) {
            tripPayload.id = trip.id
        }

        // Upsert Trip
        const { data: savedTrip, error: tripError } = await supabase
            .from('trips')
            .upsert(tripPayload, { onConflict: 'id' })
            .select()
            .single()

        if (tripError) {
            console.error('Error saving trip:', tripError)
            throw tripError
        }

        if (!savedTrip) {
            throw new Error('Failed to save trip')
        }

        const tripId = savedTrip.id

        // Replace items: Delete all for this trip, then insert new ones
        const { error: deleteError } = await supabase
            .from('trip_items')
            .delete()
            .eq('trip_id', tripId)

        if (deleteError) {
            console.error('Error deleting old trip items:', deleteError)
            throw deleteError
        }

        if (trip.items.length > 0) {
            const itemsPayload: TripItemInsert[] = trip.items.map(item => ({
                trip_id: tripId,
                experience_id: item.experienceId,
                guests: item.guests,
                total_price: item.totalPrice,
                date: item.date,
                time: item.time
            }))

            const { error: itemsError } = await supabase
                .from('trip_items')
                .insert(itemsPayload)

            if (itemsError) {
                console.error('Error saving trip items:', itemsError)
                throw itemsError
            }
        }

        // Return updated trip with new ID if it was generated
        return {
            ...trip,
            id: tripId
        }
    }
}
