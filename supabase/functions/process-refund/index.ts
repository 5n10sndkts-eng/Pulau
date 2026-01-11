/**
 * Process Refund Edge Function
 * Story: 28.3 - Implement Refund Edge Function
 *
 * Processes refund requests for confirmed bookings via Stripe.
 * Updates booking status, payment records, and creates audit logs.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

interface RefundRequest {
  bookingId: string
  amount?: number // Optional: partial refund amount in cents. Full refund if not provided.
  reason?: string
}

interface RefundResponse {
  success: boolean
  refundId?: string
  refundedAmount?: number
  error?: string
  errorCode?: string
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
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
      return errorResponse('Missing authorization header', 'UNAUTHENTICATED', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return errorResponse('Invalid or expired token', 'UNAUTHENTICATED', 401)
    }

    // ================================================
    // Step 2: Parse and Validate Request
    // ================================================
    let body: RefundRequest
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid request body', 'INVALID_REQUEST', 400)
    }

    const { bookingId, amount, reason } = body
    if (!bookingId) {
      return errorResponse('bookingId is required', 'INVALID_REQUEST', 400)
    }

    // ================================================
    // Step 3: Fetch Booking and Payment
    // ================================================
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        reference,
        status,
        trip_id,
        trips!inner (
          user_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      await createAuditLog(supabase, {
        eventType: 'refund.failed',
        entityType: 'booking',
        entityId: bookingId,
        actorId: user.id,
        actorType: 'user',
        metadata: { error: 'Booking not found' },
      })
      return errorResponse('Booking not found', 'BOOKING_NOT_FOUND', 404)
    }

    // Verify user owns this booking (through trip relationship)
    const tripData = booking.trips as { user_id: string }
    if (tripData.user_id !== user.id) {
      return errorResponse('Access denied', 'FORBIDDEN', 403)
    }

    // Check booking is in a refundable state
    if (booking.status === 'refunded') {
      return errorResponse('Booking has already been refunded', 'ALREADY_REFUNDED', 400)
    }

    if (booking.status !== 'confirmed' && booking.status !== 'cancelled') {
      return errorResponse(
        `Cannot refund booking with status: ${booking.status}`,
        'INVALID_STATUS',
        400
      )
    }

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (paymentError || !payment) {
      return errorResponse('Payment record not found', 'PAYMENT_NOT_FOUND', 404)
    }

    if (payment.status !== 'succeeded') {
      return errorResponse(
        `Cannot refund payment with status: ${payment.status}`,
        'PAYMENT_NOT_REFUNDABLE',
        400
      )
    }

    // ================================================
    // Step 4: Calculate Refund Amount
    // ================================================
    const maxRefundable = payment.amount - (payment.refund_amount || 0)

    if (maxRefundable <= 0) {
      return errorResponse('No refundable amount remaining', 'FULLY_REFUNDED', 400)
    }

    // Use provided amount or full remaining amount
    const refundAmount = amount ? Math.min(amount, maxRefundable) : maxRefundable
    const isFullRefund = refundAmount >= maxRefundable

    // ================================================
    // Step 5: Process Refund via Stripe
    // ================================================
    let refund: Stripe.Refund
    try {
      // Generate idempotency key to prevent duplicate refunds
      // Format: refund-{bookingId}-{timestamp} as specified in AC
      const idempotencyKey = `refund-${bookingId}-${Date.now()}`

      refund = await stripe.refunds.create(
        {
          payment_intent: payment.stripe_payment_intent_id,
          amount: refundAmount,
          reason: 'requested_by_customer',
          metadata: {
            booking_id: bookingId,
            booking_reference: booking.reference,
            user_id: user.id,
            platform: 'pulau',
            custom_reason: reason || 'Customer requested refund',
            idempotency_key: idempotencyKey,
          },
        },
        {
          idempotencyKey,
        }
      )
    } catch (stripeError) {
      console.error('Stripe refund failed for booking:', bookingId)

      await createAuditLog(supabase, {
        eventType: 'refund.stripe_error',
        entityType: 'booking',
        entityId: bookingId,
        actorId: user.id,
        actorType: 'user',
        metadata: {
          error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
          payment_intent_id: payment.stripe_payment_intent_id,
        },
      })

      if (stripeError instanceof Stripe.errors.StripeError) {
        return errorResponse(`Refund failed: ${stripeError.message}`, 'STRIPE_ERROR', 400)
      }
      return errorResponse('Failed to process refund', 'STRIPE_ERROR', 500)
    }

    // ================================================
    // Step 6: Update Payment Record
    // ================================================
    const newRefundTotal = (payment.refund_amount || 0) + refundAmount
    const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded'

    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: newPaymentStatus,
        refund_amount: newRefundTotal,
        refund_reason: reason || 'Customer requested refund',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (paymentUpdateError) {
      console.error('Failed to update payment record:', payment.id)
      // Don't fail - refund was processed, log for reconciliation
    }

    // ================================================
    // Step 7: Update Booking Status
    // ================================================
    const newBookingStatus = isFullRefund ? 'refunded' : booking.status

    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({
        status: newBookingStatus,
      })
      .eq('id', bookingId)

    if (bookingUpdateError) {
      console.error('Failed to update booking status:', bookingId)
    }

    // ================================================
    // Step 8: Create Audit Log
    // ================================================
    await createAuditLog(supabase, {
      eventType: isFullRefund ? 'booking.refunded' : 'booking.partially_refunded',
      entityType: 'booking',
      entityId: bookingId,
      actorId: user.id,
      actorType: 'user',
      metadata: {
        stripe_refund_id: refund.id,
        refund_amount: refundAmount,
        total_refunded: newRefundTotal,
        is_full_refund: isFullRefund,
        reason: reason || 'Customer requested refund',
        booking_reference: booking.reference,
      },
    })

    // ================================================
    // Step 9: Return Success Response
    // ================================================
    const response: RefundResponse = {
      success: true,
      refundId: refund.id,
      refundedAmount: refundAmount,
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Refund processing error:', error)
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
})

// ================================================
// Utility Functions
// ================================================

function errorResponse(message: string, code: string, status: number): Response {
  const response: RefundResponse = {
    success: false,
    error: message,
    errorCode: code,
  }
  return new Response(
    JSON.stringify(response),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

interface AuditLogParams {
  eventType: string
  entityType: string
  entityId: string
  actorId?: string
  actorType: 'user' | 'vendor' | 'system' | 'stripe'
  metadata: Record<string, unknown>
}

async function createAuditLog(
  supabase: ReturnType<typeof createClient>,
  params: AuditLogParams
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      event_type: params.eventType,
      entity_type: params.entityType,
      entity_id: params.entityId,
      actor_id: params.actorId || null,
      actor_type: params.actorType,
      metadata: params.metadata,
    })
  } catch (e) {
    console.error('Failed to create audit log:', e)
  }
}
