import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookingService } from './bookingService'
import { supabase } from './supabase'
import { calculateTripTotal } from './helpers'
import { Booking } from './types'

// Mock dependencies
vi.mock('./supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn(),
    },
}))

vi.mock('./helpers', () => ({
    calculateTripTotal: vi.fn().mockReturnValue({
        subtotal: 100,
        serviceFee: 10,
        total: 110,
    }),
}))

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString()
        }),
        clear: vi.fn(() => {
            store = {}
        }),
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

describe('bookingService', () => {
    const mockUserId = 'user-123'
    const mockBookingId = 'booking-456'
    const mockTripId = 'trip-789'

    const mockBooking: Booking = {
        id: mockBookingId,
        tripId: mockTripId,
        reference: 'PULAU-REF-123',
        status: 'confirmed',
        bookedAt: '2026-01-01T00:00:00Z',
        trip: {
            id: mockTripId,
            userId: mockUserId,
            destination: 'bali',
            status: 'planning',
            travelers: 2,
            items: [],
            subtotal: 0,
            serviceFee: 0,
            total: 0
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        localStorageMock.clear()
        // Default to mock mode false for Supabase tests
        vi.stubEnv('VITE_USE_MOCK_AUTH', 'false')
    })

    describe('createBooking', () => {
        it('successfully creates a booking via Supabase', async () => {
            const mockSingle = vi.fn().mockResolvedValue({
                data: { id: mockBookingId },
                error: null
            })
            const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
            const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

            vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

            const result = await bookingService.createBooking(mockBooking)

            expect(result).not.toBeNull()
            expect(result?.id).toBe(mockBookingId)
            expect(supabase.from).toHaveBeenCalledWith('bookings')
        })

        it('returns null on Supabase error', async () => {
            const mockSingle = vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Insert failed' }
            })
            const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
            const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

            vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

            const result = await bookingService.createBooking(mockBooking)

            expect(result).toBeNull()
        })

        it('successfully creates a booking in mock mode (localStorage)', async () => {
            vi.stubEnv('VITE_USE_MOCK_AUTH', 'true')

            const result = await bookingService.createBooking(mockBooking)

            expect(result).toEqual(mockBooking)
            expect(localStorageMock.setItem).toHaveBeenCalledWith('pulau_bookings', expect.stringContaining(mockBookingId))
        })
    })

    describe('getUserBookings', () => {
        it('returns processed bookings from Supabase', async () => {
            const mockData = [{
                id: mockBookingId,
                trip_id: mockTripId,
                reference: 'PULAU-REF-123',
                status: 'confirmed',
                booked_at: '2026-01-01T00:00:00Z',
                trips: {
                    id: mockTripId,
                    user_id: mockUserId,
                    destination_id: 'bali',
                    status: 'planning',
                    travelers: 2,
                    trip_items: [{
                        experience_id: 'exp-1',
                        guests: 2,
                        total_price: 100,
                        date: '2026-06-01',
                        time: '10:00'
                    }]
                }
            }]

            const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
            const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

            vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

            const results = await bookingService.getUserBookings(mockUserId)

            expect(results).toHaveLength(1)
            const firstResult = results[0]!
            expect(firstResult.id).toBe(mockBookingId)
            expect(firstResult.trip.items).toHaveLength(1)
            expect(firstResult.trip.total).toBe(110) // From mocked calculateTripTotal
            expect(calculateTripTotal).toHaveBeenCalled()
        })

        it('returns filtered bookings in mock mode', async () => {
            vi.stubEnv('VITE_USE_MOCK_AUTH', 'true')
            localStorageMock.setItem('pulau_bookings', JSON.stringify([mockBooking]))

            const results = await bookingService.getUserBookings(mockUserId)

            expect(results).toHaveLength(1)
            expect(results[0]!.id).toBe(mockBookingId)
        })

        it('returns empty array on Supabase error', async () => {
            const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch failed' } })
            const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

            vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

            const results = await bookingService.getUserBookings(mockUserId)

            expect(results).toHaveLength(0)
        })
    })

    describe('validateBookingForCheckIn', () => {
        const mockVendorId = 'vendor-999'

        it('calls Supabase RPC with correct arguments', async () => {
            const mockRpcResponse = {
                valid: true,
                booking: {
                    id: mockBookingId,
                    reference: 'REF',
                    items: [
                        { id: '1', experience_name: 'Exp', slot_time: '10:00', date: '2026-06-01', guests: 2, status: 'confirmed', is_today: true }
                    ]
                }
            }
            vi.mocked(supabase.rpc).mockResolvedValue({ data: mockRpcResponse, error: null })

            const result = await bookingService.validateBookingForCheckIn(mockBookingId, mockVendorId)

            expect(supabase.rpc).toHaveBeenCalledWith('validate_booking_for_checkin' as any, {
                p_booking_id: mockBookingId,
                p_vendor_id: mockVendorId
            })
            // Service transforms RPC response - check transformed result
            expect(result.valid).toBe(true)
            expect(result.reason).toBeNull()
            expect(result.message).toBe('Valid ticket')
            expect(result.booking).toEqual(mockRpcResponse.booking)
        })

        it('returns error on RPC failure', async () => {
            vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: { message: 'RPC Error' } })

            const result = await bookingService.validateBookingForCheckIn(mockBookingId, mockVendorId)

            expect(result.valid).toBe(false)
            expect(result.reason).toBe('internal_error')
        })

        it('works in mock mode with existing booking', async () => {
            vi.stubEnv('VITE_USE_MOCK_AUTH', 'true')
            localStorageMock.setItem('pulau_bookings', JSON.stringify([mockBooking]))

            const result = await bookingService.validateBookingForCheckIn(mockBookingId, mockVendorId)

            expect(result.valid).toBe(true)
            expect(result.booking?.id).toBe(mockBookingId)
        })

        it('returns booking_not_found in mock mode if missing', async () => {
            vi.stubEnv('VITE_USE_MOCK_AUTH', 'true')
            localStorageMock.setItem('pulau_bookings', JSON.stringify([]))

            const result = await bookingService.validateBookingForCheckIn('non-existent', mockVendorId)

            expect(result.valid).toBe(false)
            expect(result.reason).toBe('booking_not_found')
        })
    })
})
