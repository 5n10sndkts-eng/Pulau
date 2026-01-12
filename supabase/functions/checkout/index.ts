// ================================================
// Edge Function: checkout
// Story: 24.1 - Create Checkout Edge Function
// Phase: 2a - Core Transactional
// ================================================
// Creates a Stripe Checkout Session for trip purchases.
// Validates inventory, vendor payment readiness, and creates
// pending payment records before redirecting to Stripe.
// ================================================

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
// Constants
// ================================================

const PLATFORM_FEE_PERCENTAGE = 0.15 // 15% platform fee

// ================================================
// Types
// ================================================

interface CheckoutRequest {
  tripId: string
}

interface CheckoutResponse {
  success: boolean
  sessionUrl?: string
  sessionId?: string
  error?: string
  errorCode?: string
}

interface TripItem {
  id: string
  experience_id: string
  guests: number | null
  date: string | null
  time: string | null
  total_price: number
}

interface Experience {
  id: string
  title: string
  price_amount: number
  vendor_id: string
  cutoff_hours: number | null
  instant_book_enabled: boolean | null
}

interface Vendor {
  id: string
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean | null
  business_name: string
}

interface Trip {
  id: string
  user_id: string
  total: number | null
  status: string | null
}

// ================================================
// Helper Functions
// ================================================

function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE)
}

function calculateVendorPayout(amount: number): number {
  return amount - calculatePlatformFee(amount)
}

function generateIdempotencyKey(tripId: string, userId: string): string {
  // Use tripId + userId for true idempotency - same user checking out same trip
  // gets the same Stripe session (prevents double-click issues)
  return `checkout-${tripId}-${userId}`
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
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // ================================================
    // Step 1: Authenticate User (AC #1)
    // ================================================
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      await createAuditLog(supabase, {
        eventType: 'checkout.failed',
        entityType: 'checkout',
        entityId: 'unknown',
        actorType: 'system',
        metadata: { error: 'Missing authorization header' },
      })
      return errorResponse('Missing authorization header', 'UNAUTHENTICATED', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      await createAuditLog(supabase, {
        eventType: 'checkout.failed',
        entityType: 'checkout',
        entityId: 'unknown',
        actorType: 'system',
        metadata: { error: 'Invalid or expired token' },
      })
      return errorResponse('Invalid or expired token', 'UNAUTHENTICATED', 401)
    }

    // ================================================
    // Step 2: Parse and Validate Request (AC #1)
    // ================================================
    let body: CheckoutRequest
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid request body', 'INVALID_REQUEST', 400)
    }

    const { tripId } = body
    if (!tripId) {
      return errorResponse('tripId is required', 'INVALID_REQUEST', 400)
    }

    // ================================================
    // Step 3: Fetch Trip with Items and Experiences (AC #1)
    // ================================================
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id, total, status')
      .eq('id', tripId)
      .eq('user_id', user.id) // Ensure user owns this trip
      .single()

    if (tripError || !trip) {
      await createAuditLog(supabase, {
        eventType: 'checkout.failed',
        entityType: 'trip',
        entityId: tripId,
        actorId: user.id,
        actorType: 'user',
        metadata: { error: 'Trip not found or access denied' },
      })
      return errorResponse('Trip not found', 'TRIP_NOT_FOUND', 404)
    }

    // Fetch trip items
    const { data: tripItems, error: itemsError } = await supabase
      .from('trip_items')
      .select('id, experience_id, guests, date, time, total_price')
      .eq('trip_id', tripId)

    if (itemsError || !tripItems || tripItems.length === 0) {
      return errorResponse('Trip has no items', 'EMPTY_TRIP', 400)
    }

    // Fetch experiences for all trip items
    const experienceIds = tripItems.map(item => item.experience_id)
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('id, title, price_amount, vendor_id, cutoff_hours, instant_book_enabled')
      .in('id', experienceIds)

    if (expError || !experiences) {
      return errorResponse('Failed to fetch experiences', 'INTERNAL_ERROR', 500)
    }

    // Create a map for quick lookup
    const experienceMap = new Map<string, Experience>()
    experiences.forEach(exp => experienceMap.set(exp.id, exp))

    // ================================================
    // Step 4: Validate Vendor Payment Readiness (AC #1)
    // ================================================
    const vendorIds = [...new Set(experiences.map(exp => exp.vendor_id))]

    // MVP CONSTRAINT: Single-vendor checkout only
    // Multi-vendor trips would require separate PaymentIntents per vendor
    if (vendorIds.length > 1) {
      await createAuditLog(supabase, {
        eventType: 'checkout.failed',
        entityType: 'trip',
        entityId: tripId,
        actorId: user.id,
        actorType: 'user',
        metadata: {
          error: 'Multi-vendor checkout not supported',
          vendor_count: vendorIds.length,
          vendor_ids: vendorIds,
        },
      })
      return errorResponse(
        'Your trip contains experiences from multiple vendors. Please checkout experiences from one vendor at a time.',
        'MULTI_VENDOR_NOT_SUPPORTED',
        400
      )
    }

    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, stripe_account_id, stripe_onboarding_complete, business_name')
      .in('id', vendorIds)

    if (vendorError || !vendors) {
      return errorResponse('Failed to fetch vendor information', 'INTERNAL_ERROR', 500)
    }

    // Check all vendors are payment-ready
    const vendorMap = new Map<string, Vendor>()
    for (const vendor of vendors) {
      vendorMap.set(vendor.id, vendor)

      if (!vendor.stripe_account_id || !vendor.stripe_onboarding_complete) {
        await createAuditLog(supabase, {
          eventType: 'checkout.failed',
          entityType: 'trip',
          entityId: tripId,
          actorId: user.id,
          actorType: 'user',
          metadata: {
            error: 'Vendor not payment ready',
            vendor_id: vendor.id,
            vendor_name: vendor.business_name,
          },
        })
        return errorResponse(
          `Vendor "${vendor.business_name}" is not ready to accept payments. Please contact support.`,
          'VENDOR_NOT_PAYMENT_READY',
          400
        )
      }
    }

    // ================================================
    // Step 5: Validate Inventory and Cutoff Times (AC #1)
    // ================================================
    
    // Track reserved slots for potential rollback
    const reservedSlots: Array<{ slotId: string; guestCount: number }> = []
    
    for (const item of tripItems) {
      const experience = experienceMap.get(item.experience_id)
      if (!experience) continue

      // Validate cutoff time (default 2 hours if not specified)
      if (item.date && item.time) {
        const cutoffHours = experience.cutoff_hours ?? 2
        const slotDateTime = new Date(`${item.date}T${item.time}`)
        const now = new Date()
        const hoursUntilSlot = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilSlot < cutoffHours) {
          // Rollback any previously reserved slots
          await rollbackSlotReservations(supabase, reservedSlots)
          
          await createAuditLog(supabase, {
            eventType: 'checkout.failed',
            entityType: 'trip',
            entityId: tripId,
            actorId: user.id,
            actorType: 'user',
            metadata: {
              error: 'Booking cutoff time passed',
              experience_id: item.experience_id,
              cutoff_hours: cutoffHours,
              hours_until_slot: hoursUntilSlot,
            },
          })
          return errorResponse(
            `"${experience.title}" requires booking at least ${cutoffHours} hours in advance. This slot is no longer available for online booking.`,
            'CUTOFF_TIME_PASSED',
            400
          )
        }

        // ================================================
        // ATOMIC RESERVATION: Decrement inventory with atomic WHERE clause
        // This prevents race conditions by ensuring only ONE request succeeds
        // if available_count drops below the required amount
        // ================================================
        const guestCount = item.guests || 1
        
        const { data: updatedSlot, error: reserveError } = await supabase
          .from('experience_slots')
          .update({ 
            available_count: supabase.raw(`available_count - ${guestCount}`)
          })
          .eq('experience_id', item.experience_id)
          .eq('slot_date', item.date)
          .eq('slot_time', item.time)
          .gte('available_count', guestCount) // CRITICAL: Only update if enough capacity
          .eq('is_blocked', false) // Also check not blocked
          .select('id, available_count')
          .maybeSingle()

        if (reserveError) {
          // Rollback previously reserved slots
          await rollbackSlotReservations(supabase, reservedSlots)
          
          console.error('Slot reservation failed:', reserveError)
          return errorResponse(
            'Failed to reserve slot. Please try again.',
            'RESERVATION_FAILED',
            500
          )
        }

        if (!updatedSlot) {
          // Atomic reservation failed - either:
          // 1. Slot doesn't exist
          // 2. available_count < guestCount (race condition - another request got it first)
          // 3. Slot is blocked
          
          // Rollback previously reserved slots
          await rollbackSlotReservations(supabase, reservedSlots)
          
          await createAuditLog(supabase, {
            eventType: 'checkout.failed',
            entityType: 'trip',
            entityId: tripId,
            actorId: user.id,
            actorType: 'user',
            metadata: {
              error: 'Inventory unavailable (atomic check failed)',
              experience_id: item.experience_id,
              requested: guestCount,
              date: item.date,
              time: item.time,
            },
          })
          
          return errorResponse(
            `"${experience.title}" is no longer available for ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'} on ${item.date} at ${item.time}. Please select a different time.`,
            'INVENTORY_EXHAUSTED',
            409 // HTTP 409 Conflict - resource state changed
          )
        }

        // Success! Track this reservation for potential rollback
        reservedSlots.push({ slotId: updatedSlot.id, guestCount })
        
        console.log(`✓ Reserved ${guestCount} spots for slot ${updatedSlot.id}, new available_count: ${updatedSlot.available_count}`)
      }
    }

    // ================================================
    // Step 5b: Payment Method Acceptance (AC #1)
    // Note: For MVP, we use Stripe Checkout with 'card' payment method only.
    // Stripe Checkout inherently handles payment method acceptance validation.
    // If experiences need custom payment method restrictions, implement in future.
    // ================================================

    // ================================================
    // Step 6: Build Line Items for Stripe (AC #2)
    // ================================================
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let totalAmount = 0

    for (const item of tripItems) {
      const experience = experienceMap.get(item.experience_id)
      if (!experience) continue

      // Validate price is a positive integer (cents)
      const priceInCents = Math.round(Number(experience.price_amount))
      if (!Number.isInteger(priceInCents) || priceInCents <= 0) {
        return errorResponse(
          `Invalid price configuration for "${experience.title}". Please contact support.`,
          'INVALID_PRICE',
          400
        )
      }

      const guestCount = item.guests || 1
      const itemTotal = priceInCents * guestCount
      totalAmount += itemTotal

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: experience.title,
            metadata: {
              experience_id: experience.id,
              trip_item_id: item.id,
            },
          },
          unit_amount: priceInCents, // Validated to be integer cents
        },
        quantity: guestCount,
      })
    }

    // ================================================
    // Step 7: Calculate Platform Fee (AC #2)
    // ================================================
    const platformFee = calculatePlatformFee(totalAmount)
    const vendorPayout = calculateVendorPayout(totalAmount)

    // ================================================
    // Step 8: Create Stripe Checkout Session (AC #2)
    // For MVP with single vendor, use destination charges
    // ================================================

    // Get the primary vendor (first one for MVP)
    const primaryExperience = experiences[0]
    const primaryVendor = vendorMap.get(primaryExperience.vendor_id)

    if (!primaryVendor?.stripe_account_id) {
      return errorResponse('Primary vendor not configured for payments', 'VENDOR_NOT_PAYMENT_READY', 400)
    }

    const idempotencyKey = generateIdempotencyKey(tripId, user.id)

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: primaryVendor.stripe_account_id,
          },
          metadata: {
            trip_id: tripId,
            user_id: user.id,
            platform: 'pulau',
          },
        },
        success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/checkout/cancel`,
        customer_email: user.email,
        metadata: {
          trip_id: tripId,
          user_id: user.id,
          platform: 'pulau',
          slots_reserved: 'true', // Flag to prevent double-decrement in webhook
          reserved_slot_ids: reservedSlots.map(s => s.slotId).join(','),
        },
      }, {
        idempotencyKey,
      })
    } catch (stripeError) {
      // Rollback slot reservations - Stripe failed, so release inventory
      await rollbackSlotReservations(supabase, reservedSlots)
      
      // Log Stripe error without exposing full error object
      console.error('Stripe session creation failed for trip:', tripId)

      await createAuditLog(supabase, {
        eventType: 'checkout.stripe_error',
        entityType: 'trip',
        entityId: tripId,
        actorId: user.id,
        actorType: 'user',
        metadata: {
          error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
          slots_rolled_back: reservedSlots.length,
        },
      })

      if (stripeError instanceof Stripe.errors.StripeError) {
        return errorResponse(`Payment error: ${stripeError.message}`, 'STRIPE_ERROR', 400)
      }
      return errorResponse('Failed to create checkout session', 'STRIPE_ERROR', 500)
    }

    // ================================================
    // Step 9: Create Pending Payment Record (AC #3)
    // ================================================
    // Note: We need a booking_id, but booking is created after payment succeeds
    // For now, we'll create a preliminary booking record to link the payment

    // Create a preliminary booking
    const bookingReference = `PL-${Date.now().toString(36).toUpperCase()}`
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        reference: bookingReference,
        status: 'pending_payment',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      // Log without exposing schema details
      console.error('Failed to create preliminary booking for trip:', tripId)
      // Don't fail the checkout - we can reconcile via webhook
    }

    // Create payment record
    if (booking && session.payment_intent) {
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent.id

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          stripe_payment_intent_id: paymentIntentId,
          stripe_checkout_session_id: session.id,
          amount: totalAmount,
          currency: 'usd',
          platform_fee: platformFee,
          vendor_payout: vendorPayout,
          status: 'pending',
        })

      if (paymentError) {
        // Log without exposing schema details
        console.error('Failed to create payment record for booking:', booking.id)
        // Don't fail - webhook will reconcile
      }
    }

    // ================================================
    // Step 10: Create Audit Log (AC #4)
    // ================================================
    await createAuditLog(supabase, {
      eventType: 'checkout.initiated',
      entityType: 'trip',
      entityId: tripId,
      actorId: user.id,
      actorType: 'user',
      metadata: {
        stripe_session_id: session.id,
        total_amount: totalAmount,
        platform_fee: platformFee,
        vendor_payout: vendorPayout,
        item_count: tripItems.length,
        booking_reference: booking?.reference,
      },
    })

    // ================================================
    // Step 11: Return Success Response (AC #3)
    // ================================================
    const response: CheckoutResponse = {
      success: true,
      sessionUrl: session.url!,
      sessionId: session.id,
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('checkout error:', error)

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return errorResponse(`Stripe error: ${error.message}`, 'STRIPE_ERROR', 400)
    }

    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
})

// ================================================
// Utility Functions
// ================================================

function errorResponse(message: string, code: string, status: number): Response {
  const response: CheckoutResponse = {
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
  // Must match database CHECK constraint: user, vendor, system, stripe
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
    // Don't fail the main operation if audit logging fails
    console.error('Failed to create audit log:', e)
  }
}

/**
 * Rollback slot reservations if checkout fails after atomic reservation
 * This prevents inventory from being locked if Stripe session creation fails
 */
async function rollbackSlotReservations(
  supabase: ReturnType<typeof createClient>,
  reservedSlots: Array<{ slotId: string; guestCount: number }>
): Promise<void> {
  if (reservedSlots.length === 0) return
  
  console.log(`Rolling back ${reservedSlots.length} slot reservations...`)
  
  for (const { slotId, guestCount } of reservedSlots) {
    try {
      const { error } = await supabase
        .from('experience_slots')
        .update({ 
          available_count: supabase.raw(`available_count + ${guestCount}`)
        })
        .eq('id', slotId)
      
      if (error) {
        console.error(`Failed to rollback slot ${slotId}:`, error)
      } else {
        console.log(`✓ Rolled back ${guestCount} spots for slot ${slotId}`)
      }
    } catch (e) {
      console.error(`Exception rolling back slot ${slotId}:`, e)
    }
  }
}
