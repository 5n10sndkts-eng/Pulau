/**
 * Payment Service Module
 * Story: 24.7 - Create Payment Service Module
 * Phase: 2a - Core Transactional
 *
 * Centralizes all Stripe-related operations with type-safe interfaces.
 * Provides functions for checkout, payment queries, and fee calculations.
 */

import { supabase } from '@/lib/supabase'
import type { Payment, CheckoutResponse, ApiResponse } from '@/lib/types'

// ================================================
// Constants
// ================================================

/**
 * Platform fee percentage (15%)
 * This matches the server-side calculation in checkout Edge Function
 */
export const PLATFORM_FEE_PERCENTAGE = 0.15

// ================================================
// Fee Calculation Utilities (AC #1)
// ================================================

/**
 * Calculate platform fee from a total amount
 * @param amountCents - Total amount in cents
 * @returns Platform fee in cents (15% of total, rounded)
 */
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * PLATFORM_FEE_PERCENTAGE)
}

/**
 * Calculate vendor payout from a total amount
 * @param amountCents - Total amount in cents
 * @returns Vendor payout in cents (amount minus platform fee)
 */
export function calculateVendorPayout(amountCents: number): number {
  return amountCents - calculatePlatformFee(amountCents)
}

/**
 * Format an amount in cents to a currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatAmountFromCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// ================================================
// Checkout Functions (AC #1, #2, #4)
// ================================================

/**
 * Initiate a checkout session for a trip
 * Calls the checkout Edge Function and returns the Stripe session URL
 *
 * @param tripId - UUID of the trip to checkout
 * @returns CheckoutResponse with sessionUrl on success
 */
export async function initiateCheckout(
  tripId: string
): Promise<ApiResponse<CheckoutResponse>> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { data: null, error: 'Not authenticated' }
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      return { data: null, error: 'Supabase URL not configured' }
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/checkout`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripId }),
      }
    )

    const result: CheckoutResponse = await response.json()

    if (!response.ok || !result.success) {
      return { data: null, error: result.error || 'Checkout failed' }
    }

    return { data: result, error: null }
  } catch (err) {
    console.error('Checkout error:', err)
    return { data: null, error: 'Network error during checkout' }
  }
}

// ================================================
// Payment Query Functions (AC #1, #2)
// ================================================

/**
 * Transform database payment record to camelCase Payment type
 */
function transformPayment(record: Record<string, unknown>): Payment {
  return {
    id: record.id as string,
    bookingId: record.booking_id as string,
    stripePaymentIntentId: record.stripe_payment_intent_id as string,
    stripeCheckoutSessionId: record.stripe_checkout_session_id as string | null,
    amount: record.amount as number,
    currency: record.currency as string,
    platformFee: record.platform_fee as number,
    vendorPayout: record.vendor_payout as number,
    status: record.status as Payment['status'],
    refundAmount: (record.refund_amount as number) || 0,
    refundReason: record.refund_reason as string | null,
    createdAt: record.created_at as string,
    updatedAt: record.updated_at as string,
  }
}

/**
 * Get a payment by booking ID
 * @param bookingId - UUID of the booking
 * @returns Payment record or null if not found
 */
export async function getPaymentByBookingId(
  bookingId: string
): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return { data: null, error: 'Payment not found' }
    }
    return { data: null, error: error.message }
  }

  return { data: transformPayment(data), error: null }
}

/**
 * Get all payments for a user
 * Queries through bookings -> trips -> user relationship
 * @param userId - UUID of the user (optional, defaults to current user)
 * @returns Array of Payment records
 */
export async function getPaymentsByUserId(
  userId?: string
): Promise<ApiResponse<Payment[]>> {
  // If no userId provided, get current user
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }
    userId = user.id
  }

  // Query payments through the booking -> trip -> user relationship
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      bookings!inner (
        id,
        trip_id,
        trips!inner (
          user_id
        )
      )
    `)
    .eq('bookings.trips.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  const payments = data.map(record => transformPayment(record))
  return { data: payments, error: null }
}

/**
 * Get payment by Stripe checkout session ID
 * Useful for handling return from Stripe Checkout
 * @param sessionId - Stripe Checkout Session ID
 * @returns Payment record or null
 */
export async function getPaymentBySessionId(
  sessionId: string
): Promise<ApiResponse<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_checkout_session_id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: 'Payment not found' }
    }
    return { data: null, error: error.message }
  }

  return { data: transformPayment(data), error: null }
}

// ================================================
// Payment Status Helpers
// ================================================

/**
 * Check if a payment is in a successful state
 */
export function isPaymentSuccessful(status: Payment['status']): boolean {
  return status === 'succeeded'
}

/**
 * Check if a payment has been refunded (fully or partially)
 */
export function isPaymentRefunded(status: Payment['status']): boolean {
  return status === 'refunded' || status === 'partially_refunded'
}

/**
 * Get a human-readable label for payment status
 */
export function getPaymentStatusLabel(status: Payment['status']): string {
  const labels: Record<Payment['status'], string> = {
    pending: 'Pending',
    succeeded: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
  }
  return labels[status] || status
}

/**
 * Get the appropriate color class for a payment status
 * For use with Tailwind CSS badge styling
 */
export function getPaymentStatusColor(status: Payment['status']): string {
  const colors: Record<Payment['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    partially_refunded: 'bg-orange-100 text-orange-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
