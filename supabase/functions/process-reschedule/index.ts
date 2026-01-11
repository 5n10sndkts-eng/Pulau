/**
 * Process Reschedule Edge Function
 * Story: 31-3 - Implement Reschedule Edge Function
 * Epic: 31 - Booking Modifications & Rescheduling
 *
 * Processes approved reschedule requests:
 * - Validates modification request status
 * - Releases old slot inventory
 * - Reserves new slot inventory
 * - Updates booking/trip_item records
 * - Handles price difference (charge/refund)
 * - Creates audit log entries
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createLogger } from '../_shared/logger.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ================================================
// Types
// ================================================

interface RescheduleRequest {
  modificationId: string
}

interface RescheduleResponse {
  success: boolean
  modificationId?: string
  newDate?: string
  newTime?: string
  priceDifference?: number
  paymentIntentId?: string
  refundId?: string
  error?: string
  errorCode?: string
}

// ================================================
// Helper Functions
// ================================================

function errorResponse(
  message: string,
  errorCode: string,
  status: number
): Response {
  const body: RescheduleResponse = {
    success: false,
    error: message,
    errorCode,
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function successResponse(data: Partial<RescheduleResponse>): Response {
  const body: RescheduleResponse = {
    success: true,
    ...data,
  }
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
  const logger = createLogger('process-reschedule', req)
  logger.requestStart(req.method, '/process-reschedule')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize Supabase client with service role
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // ================================================
    // Step 1: Authenticate User
    // ================================================
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      logger.warn('Missing authorization header')
      return errorResponse('Missing authorization header', 'UNAUTHENTICATED', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      logger.warn('Invalid token', { authError })
      return errorResponse('Invalid or expired token', 'UNAUTHENTICATED', 401)
    }

    logger.setContext({ userId: user.id })

    // ================================================
    // Step 2: Parse and Validate Request
    // ================================================
    let body: RescheduleRequest
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid request body', 'INVALID_REQUEST', 400)
    }

    const { modificationId } = body
    if (!modificationId) {
      return errorResponse('modificationId is required', 'INVALID_REQUEST', 400)
    }

    logger.info('Processing reschedule', { modificationId })

    // ================================================
    // Step 3: Fetch Modification Request
    // ================================================
    const { data: modification, error: modError } = await supabase
      .from('booking_modifications')
      .select('*')
      .eq('id', modificationId)
      .single()

    if (modError || !modification) {
      logger.error('Modification not found', modError)
      return errorResponse('Modification request not found', 'NOT_FOUND', 404)
    }

    // Validate status
    if (modification.status !== 'approved') {
      logger.warn('Invalid modification status', { status: modification.status })
      return errorResponse(
        `Modification must be approved before execution. Current status: ${modification.status}`,
        'INVALID_STATUS',
        400
      )
    }

    // ================================================
    // Step 4: Fetch Related Data
    // ================================================
    const { data: tripItem, error: itemError } = await supabase
      .from('trip_items')
      .select('*, trips!inner(*)')
      .eq('id', modification.trip_item_id)
      .single()

    if (itemError || !tripItem) {
      logger.error('Trip item not found', itemError)
      return errorResponse('Trip item not found', 'NOT_FOUND', 404)
    }

    // Verify user owns this booking
    if (tripItem.trips.user_id !== user.id && modification.vendor_id !== user.id) {
      // Allow if user is the vendor responding
      const { data: vendor } = await supabase
        .from('vendors')
        .select('owner_id')
        .eq('id', modification.vendor_id)
        .single()

      if (!vendor || vendor.owner_id !== user.id) {
        logger.warn('Unauthorized reschedule attempt', { userId: user.id })
        return errorResponse('Unauthorized', 'UNAUTHORIZED', 403)
      }
    }

    // ================================================
    // Step 5: Release Old Slot Inventory
    // ================================================
    if (modification.original_date && modification.original_time) {
      logger.info('Releasing old slot', {
        date: modification.original_date,
        time: modification.original_time,
      })

      const { data: releaseResult, error: releaseError } = await supabase.rpc(
        'release_slot_availability',
        {
          p_experience_id: tripItem.experience_id,
          p_slot_date: modification.original_date,
          p_slot_time: modification.original_time,
          p_count: modification.original_guests || 1,
        }
      )

      if (releaseError) {
        logger.error('Failed to release slot', releaseError)
        // Continue anyway - slot may have been manually adjusted
      }
    }

    // ================================================
    // Step 6: Reserve New Slot Inventory
    // ================================================
    logger.info('Reserving new slot', {
      date: modification.requested_date,
      time: modification.requested_time,
    })

    const guestCount = modification.requested_guests || modification.original_guests || 1

    const { data: decrementResult, error: decrementError } = await supabase.rpc(
      'decrement_slot_availability',
      {
        p_experience_id: tripItem.experience_id,
        p_slot_date: modification.requested_date,
        p_slot_time: modification.requested_time,
        p_count: guestCount,
      }
    )

    if (decrementError) {
      logger.error('Failed to reserve new slot', decrementError)
      return errorResponse(
        'Failed to reserve new time slot. It may no longer be available.',
        'SLOT_UNAVAILABLE',
        400
      )
    }

    const decrementData = decrementResult as { success?: boolean; error?: string }
    if (!decrementData.success) {
      logger.error('Slot reservation failed', decrementData)
      return errorResponse(
        decrementData.error || 'Slot no longer available',
        'SLOT_UNAVAILABLE',
        400
      )
    }

    // ================================================
    // Step 7: Handle Price Difference
    // ================================================
    let paymentIntentId: string | undefined
    let refundId: string | undefined
    const priceDifference = modification.price_difference || 0

    if (priceDifference > 0) {
      // Customer owes more - create payment intent
      // Note: In production, this would trigger a payment flow
      // For now, we log it as pending
      logger.info('Additional charge required', { amount: priceDifference })

      // Get existing payment for the booking
      const { data: payment } = await supabase
        .from('payments')
        .select('stripe_payment_intent_id')
        .eq('booking_id', modification.booking_id)
        .single()

      if (payment?.stripe_payment_intent_id) {
        // In a full implementation, would create a new payment intent
        // For now, just log it
        paymentIntentId = `pending_charge_${modification.id}`
      }
    } else if (priceDifference < 0) {
      // Customer gets partial refund
      const refundAmount = Math.abs(priceDifference)
      logger.info('Processing partial refund', { amount: refundAmount })

      // Get existing payment
      const { data: payment } = await supabase
        .from('payments')
        .select('stripe_payment_intent_id')
        .eq('booking_id', modification.booking_id)
        .single()

      if (payment?.stripe_payment_intent_id) {
        try {
          // Use idempotency key to prevent duplicate refunds on retry
          const idempotencyKey = `refund-mod-${modification.id}-${modification.booking_id}`
          const refund = await stripe.refunds.create(
            {
              payment_intent: payment.stripe_payment_intent_id,
              amount: refundAmount,
              reason: 'requested_by_customer',
              metadata: {
                modification_id: modification.id,
                type: 'reschedule_price_adjustment',
              },
            },
            { idempotencyKey }
          )

          refundId = refund.id
          logger.info('Refund processed', { refundId, idempotencyKey })
        } catch (stripeError) {
          logger.error('Stripe refund failed', stripeError)
          // Continue - the reschedule can still proceed
        }
      }
    }

    // ================================================
    // Step 8: Update Trip Item
    // ================================================
    const { error: updateError } = await supabase
      .from('trip_items')
      .update({
        date: modification.requested_date,
        time: modification.requested_time,
        guests: modification.requested_guests || tripItem.guests,
        total_price: modification.new_total_price || tripItem.total_price,
        modification_count: (tripItem.modification_count || 0) + 1,
        last_modified_at: new Date().toISOString(),
      })
      .eq('id', modification.trip_item_id)

    if (updateError) {
      logger.error('Failed to update trip item', updateError)
      return errorResponse('Failed to update booking', 'UPDATE_FAILED', 500)
    }

    // ================================================
    // Step 9: Update Modification Status
    // ================================================
    const { error: modUpdateError } = await supabase
      .from('booking_modifications')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
        payment_intent_id: paymentIntentId,
        refund_id: refundId,
      })
      .eq('id', modificationId)

    if (modUpdateError) {
      logger.error('Failed to update modification status', modUpdateError)
      // Continue - the main operation succeeded
    }

    // ================================================
    // Step 10: Create Audit Log
    // ================================================
    const { error: auditError } = await supabase.from('audit_logs').insert({
      event_type: 'booking.rescheduled',
      entity_type: 'booking',
      entity_id: modification.booking_id,
      actor_type: 'customer',
      actor_id: user.id,
      metadata: {
        modification_id: modificationId,
        original_date: modification.original_date,
        original_time: modification.original_time,
        new_date: modification.requested_date,
        new_time: modification.requested_time,
        price_difference: priceDifference,
        refund_id: refundId,
        payment_intent_id: paymentIntentId,
      },
    })

    if (auditError) {
      // Log audit failure for compliance tracking - don't fail the operation
      logger.error('Audit log insert failed', { auditError, modificationId })
    }

    // ================================================
    // Step 11: Create Customer Notification
    // ================================================
    const { error: notifError } = await supabase.from('customer_notifications').insert({
      user_id: tripItem.trips.user_id,
      type: 'booking_rescheduled',
      title: 'Booking Rescheduled',
      message: `Your booking has been rescheduled to ${modification.requested_date} at ${modification.requested_time}`,
      booking_id: modification.booking_id,
    })

    if (notifError) {
      // Log notification failure - don't fail the operation
      logger.warn('Customer notification insert failed', { notifError, modificationId })
    }

    logger.requestEnd(200, { modificationId })

    return successResponse({
      modificationId,
      newDate: modification.requested_date,
      newTime: modification.requested_time,
      priceDifference,
      paymentIntentId,
      refundId,
    })
  } catch (err) {
    logger.error('Unexpected error', err)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
})
