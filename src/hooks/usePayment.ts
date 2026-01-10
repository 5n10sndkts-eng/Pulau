/**
 * Payment Hooks
 * Story: 24.7 - Create Payment Service Module
 * Phase: 2a - Core Transactional
 *
 * TanStack Query hooks for payment operations.
 * Provides data fetching, caching, and mutation handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPaymentByBookingId,
  getPaymentsByUserId,
  getPaymentBySessionId,
  initiateCheckout,
} from '@/lib/paymentService'
import { useAuth } from '@/contexts/AuthContext'

// ================================================
// Query Keys
// ================================================

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (userId: string) => [...paymentKeys.lists(), userId] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (bookingId: string) => [...paymentKeys.details(), bookingId] as const,
  bySession: (sessionId: string) => [...paymentKeys.all, 'session', sessionId] as const,
}

// ================================================
// Query Hooks
// ================================================

/**
 * Hook to fetch a payment by booking ID
 * @param bookingId - UUID of the booking
 */
export function usePaymentByBookingId(bookingId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(bookingId || ''),
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID required')
      const result = await getPaymentByBookingId(bookingId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!bookingId,
  })
}

/**
 * Hook to fetch all payments for the current user
 */
export function useUserPayments() {
  const { user } = useAuth()

  return useQuery({
    queryKey: paymentKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      const result = await getPaymentsByUserId(user.id)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!user?.id,
  })
}

/**
 * Hook to fetch a payment by Stripe session ID
 * Useful for the checkout success page
 * @param sessionId - Stripe Checkout Session ID
 */
export function usePaymentBySessionId(sessionId: string | null) {
  return useQuery({
    queryKey: paymentKeys.bySession(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required')
      const result = await getPaymentBySessionId(sessionId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!sessionId,
    // Retry for a while since payment processing may take time
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// ================================================
// Mutation Hooks
// ================================================

/**
 * Hook to initiate a checkout session
 * Returns a mutation that creates a Stripe Checkout session
 */
export function useInitiateCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tripId: string) => {
      const result = await initiateCheckout(tripId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful checkout initiation
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (error) => {
      console.error('Checkout initiation failed:', error)
    },
  })
}

/**
 * Hook for checkout with automatic redirect
 * Convenience hook that handles the redirect to Stripe
 */
export function useCheckoutWithRedirect() {
  const mutation = useInitiateCheckout()

  const checkout = async (tripId: string) => {
    try {
      const result = await mutation.mutateAsync(tripId)
      if (result?.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.sessionUrl
        return { success: true, redirected: true }
      }
      return { success: false, error: 'No session URL returned' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
      }
    }
  }

  return {
    checkout,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
