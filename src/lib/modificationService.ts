/**
 * Booking Modification Service
 * Story: 31-1 - Define Modification Policy Schema
 * Epic: 31 - Booking Modifications & Rescheduling
 *
 * Handles booking modifications including reschedules and guest count changes.
 * Integrates with Supabase RPC functions for validation and execution.
 */

import { supabase } from './supabase'
import { Database } from './database.types'

// ============================================================================
// TYPES
// ============================================================================

export type ModificationType = Database['public']['Enums']['modification_type']
export type ModificationStatus = Database['public']['Enums']['modification_request_status']
export type BookingModification = Database['public']['Tables']['booking_modifications']['Row']
export type BookingModificationInsert = Database['public']['Tables']['booking_modifications']['Insert']

export interface ModificationAllowedResult {
  allowed: boolean
  reason?: string
  modification_count?: number
  max_modifications?: number
  cutoff_hours?: number
  hours_until_start?: number
}

export interface ModificationPriceResult {
  original_total: number
  new_total: number
  price_difference: number
  price_per_guest: number
  guests: number
  slot_available: boolean
  original_date?: string
  original_time?: string
  original_guests?: number
  error?: string
}

export interface ModificationRequest {
  bookingId: string
  tripItemId: string
  vendorId: string
  modificationType: ModificationType
  originalDate?: string
  originalTime?: string
  originalGuests?: number
  originalTotalPrice?: number
  requestedDate?: string
  requestedTime?: string
  requestedGuests?: number
  customerNotes?: string
}

// ============================================================================
// UUID VALIDATION
// ============================================================================

/**
 * UUID v4 validation regex pattern
 * Prevents injection attacks by ensuring IDs match expected format
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validate that a string is a valid UUID
 * @throws Error if the ID is not a valid UUID format
 */
function validateUUID(id: string, paramName: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new Error(`Invalid ${paramName}: must be a valid UUID format`)
  }
}

// ============================================================================
// CHECK MODIFICATION ELIGIBILITY
// ============================================================================

/**
 * Check if a booking modification is allowed
 * Validates against cutoff time, modification limits, and experience policy
 */
export async function checkModificationAllowed(
  tripItemId: string,
  modificationType: ModificationType = 'reschedule'
): Promise<ModificationAllowedResult> {
  validateUUID(tripItemId, 'tripItemId')

  const { data, error } = await supabase.rpc('check_modification_allowed', {
    p_trip_item_id: tripItemId,
    p_modification_type: modificationType,
  })

  if (error) {
    console.error('Error checking modification eligibility:', error)
    return {
      allowed: false,
      reason: 'Failed to check modification eligibility',
    }
  }

  return data as unknown as ModificationAllowedResult
}

// ============================================================================
// CALCULATE MODIFICATION PRICE
// ============================================================================

/**
 * Calculate price difference for a proposed modification
 * Returns original price, new price, and difference (positive = customer owes more)
 */
export async function calculateModificationPrice(
  tripItemId: string,
  newDate?: string,
  newTime?: string,
  newGuests?: number
): Promise<ModificationPriceResult> {
  validateUUID(tripItemId, 'tripItemId')

  const { data, error } = await supabase.rpc('calculate_modification_price', {
    p_trip_item_id: tripItemId,
    p_new_date: newDate,
    p_new_time: newTime,
    p_new_guests: newGuests,
  })

  if (error) {
    console.error('Error calculating modification price:', error)
    return {
      original_total: 0,
      new_total: 0,
      price_difference: 0,
      price_per_guest: 0,
      guests: 0,
      slot_available: false,
      error: 'Failed to calculate price',
    }
  }

  return data as unknown as ModificationPriceResult
}

// ============================================================================
// CREATE MODIFICATION REQUEST
// ============================================================================

/**
 * Create a new modification request
 * Request goes to vendor for approval (unless instant modification is allowed)
 */
export async function createModificationRequest(
  request: ModificationRequest
): Promise<{ data: BookingModification | null; error: string | null }> {
  // Validate all UUID parameters
  validateUUID(request.bookingId, 'bookingId')
  validateUUID(request.tripItemId, 'tripItemId')
  validateUUID(request.vendorId, 'vendorId')

  // First check if modification is allowed
  const eligibility = await checkModificationAllowed(
    request.tripItemId,
    request.modificationType
  )

  if (!eligibility.allowed) {
    return {
      data: null,
      error: eligibility.reason || 'Modification not allowed',
    }
  }

  // Calculate price difference
  const priceCalc = await calculateModificationPrice(
    request.tripItemId,
    request.requestedDate,
    request.requestedTime,
    request.requestedGuests
  )

  if (priceCalc.error) {
    return {
      data: null,
      error: priceCalc.error,
    }
  }

  if (!priceCalc.slot_available) {
    return {
      data: null,
      error: 'No available slot for the requested date/time',
    }
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      data: null,
      error: 'User not authenticated',
    }
  }

  // Create expiry date (48 hours from now for vendor to respond)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 48)

  // Create the modification request
  const { data, error } = await supabase
    .from('booking_modifications')
    .insert({
      booking_id: request.bookingId,
      trip_item_id: request.tripItemId,
      requestor_id: user.id,
      vendor_id: request.vendorId,
      modification_type: request.modificationType,
      status: 'pending',
      original_date: request.originalDate,
      original_time: request.originalTime,
      original_guests: request.originalGuests,
      original_total_price: request.originalTotalPrice,
      requested_date: request.requestedDate,
      requested_time: request.requestedTime,
      requested_guests: request.requestedGuests,
      price_difference: priceCalc.price_difference,
      new_total_price: priceCalc.new_total,
      customer_notes: request.customerNotes,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating modification request:', error)
    return {
      data: null,
      error: 'Failed to create modification request',
    }
  }

  return { data, error: null }
}

// ============================================================================
// GET MODIFICATION REQUESTS
// ============================================================================

/**
 * Get modification requests for a booking
 */
export async function getModificationsByBooking(
  bookingId: string
): Promise<BookingModification[]> {
  validateUUID(bookingId, 'bookingId')

  const { data, error } = await supabase
    .from('booking_modifications')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching modifications:', error)
    return []
  }

  return data
}

/**
 * Get pending modification requests for a vendor
 */
export async function getVendorPendingModifications(
  vendorId: string
): Promise<BookingModification[]> {
  validateUUID(vendorId, 'vendorId')

  const { data, error } = await supabase
    .from('booking_modifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vendor modifications:', error)
    return []
  }

  return data
}

/**
 * Get all modification requests for a vendor (including resolved)
 */
export async function getVendorModifications(
  vendorId: string,
  limit: number = 50
): Promise<BookingModification[]> {
  validateUUID(vendorId, 'vendorId')

  const { data, error } = await supabase
    .from('booking_modifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching vendor modifications:', error)
    return []
  }

  return data
}

// ============================================================================
// VENDOR RESPONSE
// ============================================================================

/**
 * Vendor approves a modification request
 */
export async function approveModification(
  modificationId: string,
  vendorNotes?: string
): Promise<{ success: boolean; error: string | null }> {
  validateUUID(modificationId, 'modificationId')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('booking_modifications')
    .update({
      status: 'approved',
      vendor_response_at: new Date().toISOString(),
      vendor_response_by: user.id,
      vendor_notes: vendorNotes,
    })
    .eq('id', modificationId)
    .eq('status', 'pending')

  if (error) {
    console.error('Error approving modification:', error)
    return { success: false, error: 'Failed to approve modification' }
  }

  return { success: true, error: null }
}

/**
 * Vendor rejects a modification request
 */
export async function rejectModification(
  modificationId: string,
  rejectionReason: string
): Promise<{ success: boolean; error: string | null }> {
  validateUUID(modificationId, 'modificationId')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('booking_modifications')
    .update({
      status: 'rejected',
      vendor_response_at: new Date().toISOString(),
      vendor_response_by: user.id,
      rejection_reason: rejectionReason,
    })
    .eq('id', modificationId)
    .eq('status', 'pending')

  if (error) {
    console.error('Error rejecting modification:', error)
    return { success: false, error: 'Failed to reject modification' }
  }

  return { success: true, error: null }
}

// ============================================================================
// CUSTOMER ACTIONS
// ============================================================================

/**
 * Customer cancels their pending modification request
 */
export async function cancelModificationRequest(
  modificationId: string
): Promise<{ success: boolean; error: string | null }> {
  validateUUID(modificationId, 'modificationId')

  const { error } = await supabase
    .from('booking_modifications')
    .update({ status: 'cancelled' })
    .eq('id', modificationId)
    .eq('status', 'pending')

  if (error) {
    console.error('Error cancelling modification request:', error)
    return { success: false, error: 'Failed to cancel request' }
  }

  return { success: true, error: null }
}

// ============================================================================
// EXECUTE MODIFICATION
// ============================================================================

export interface ExecuteModificationResult {
  success: boolean
  error: string | null
  newDate?: string
  newTime?: string
  priceDifference?: number
  refundId?: string
  paymentIntentId?: string
}

/**
 * Execute an approved modification via Edge Function
 * Handles slot inventory, price differences, and Stripe operations
 */
export async function executeModification(
  modificationId: string
): Promise<ExecuteModificationResult> {
  validateUUID(modificationId, 'modificationId')

  try {
    const { data, error } = await supabase.functions.invoke('process-reschedule', {
      body: { modificationId },
    })

    if (error) {
      console.error('Error executing modification:', error)
      return { success: false, error: 'Failed to execute modification' }
    }

    const result = data as {
      success?: boolean
      error?: string
      newDate?: string
      newTime?: string
      priceDifference?: number
      refundId?: string
      paymentIntentId?: string
    }

    if (!result.success) {
      return { success: false, error: result.error || 'Modification failed' }
    }

    return {
      success: true,
      error: null,
      newDate: result.newDate,
      newTime: result.newTime,
      priceDifference: result.priceDifference,
      refundId: result.refundId,
      paymentIntentId: result.paymentIntentId,
    }
  } catch (err) {
    console.error('Unexpected error executing modification:', err)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Execute an approved modification via RPC (simpler version)
 * Use this for basic modifications without Stripe integration
 */
export async function executeModificationSimple(
  modificationId: string
): Promise<{ success: boolean; error: string | null }> {
  validateUUID(modificationId, 'modificationId')

  const { data, error } = await supabase.rpc('execute_booking_modification', {
    p_modification_id: modificationId,
  })

  if (error) {
    console.error('Error executing modification:', error)
    return { success: false, error: 'Failed to execute modification' }
  }

  const result = data as unknown as { success?: boolean; error?: string }

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, error: null }
}

// ============================================================================
// MODIFICATION POLICY HELPERS
// ============================================================================

/**
 * Get human-readable modification policy description
 */
export function getModificationPolicyDescription(
  rescheduleAllowed: boolean,
  guestChangeAllowed: boolean,
  cutoffHours: number
): string {
  const policies: string[] = []

  if (rescheduleAllowed) {
    policies.push(`Rescheduling allowed up to ${cutoffHours}h before`)
  } else {
    policies.push('No rescheduling')
  }

  if (guestChangeAllowed) {
    policies.push('Guest count changes allowed')
  } else {
    policies.push('Guest count fixed')
  }

  return policies.join(' • ')
}

/**
 * Format price difference for display
 * Positive = customer owes more, negative = customer gets refund
 */
export function formatPriceDifference(priceDiffCents: number): string {
  const amount = Math.abs(priceDiffCents / 100)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  if (priceDiffCents > 0) {
    return `+${formatted} (additional charge)`
  } else if (priceDiffCents < 0) {
    return `-${formatted} (refund)`
  }
  return 'No price change'
}
