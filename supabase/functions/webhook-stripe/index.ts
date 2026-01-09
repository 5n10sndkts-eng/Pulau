// ================================================
// Edge Function: webhook-stripe
// Story: 22.2 - Handle Stripe Account Update Webhooks
// Story: 22.5 - Integrate State Machine Transitions
// Phase: 2a - Core Transactional
// ================================================
// Handles Stripe webhook events for account updates,
// payment events, and other Stripe-initiated notifications.
// Integrates with vendor onboarding state machine.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// ================================================
// State Machine (inline for Deno edge function)
// Matches vendorStateMachine.ts in src/lib
// ================================================

type VendorOnboardingStateValue =
  | 'registered'
  | 'kyc_submitted'
  | 'kyc_verified'
  | 'kyc_rejected'
  | 'bank_linked'
  | 'active'
  | 'suspended'

const VALID_TRANSITIONS: Record<VendorOnboardingStateValue, VendorOnboardingStateValue[]> = {
  registered: ['kyc_submitted'],
  kyc_submitted: ['kyc_verified', 'kyc_rejected'],
  kyc_verified: ['bank_linked'],
  kyc_rejected: ['kyc_submitted'],
  bank_linked: ['active'],
  active: ['suspended'],
  suspended: ['active'],
}

function isValidTransition(
  current: VendorOnboardingStateValue,
  target: VendorOnboardingStateValue
): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false
}

/**
 * Determine target state based on Stripe account data
 */
function determineStateFromStripeData(data: {
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}): VendorOnboardingStateValue {
  const { chargesEnabled, payoutsEnabled, detailsSubmitted } = data

  // Full verification and bank linked - ready for activation
  if (chargesEnabled && payoutsEnabled) {
    return 'bank_linked'
  }

  // Identity verified but bank not linked
  if (chargesEnabled && !payoutsEnabled) {
    return 'kyc_verified'
  }

  // Details submitted but not yet verified
  if (detailsSubmitted && !chargesEnabled) {
    return 'kyc_submitted'
  }

  return 'kyc_submitted'
}

/**
 * Transition vendor state with validation and audit logging
 */
async function transitionVendorState(
  supabase: ReturnType<typeof createClient>,
  vendorId: string,
  currentState: VendorOnboardingStateValue,
  targetState: VendorOnboardingStateValue,
  stripeEventId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  // Skip if already at target state
  if (currentState === targetState) {
    return { success: true }
  }

  // Validate transition
  if (!isValidTransition(currentState, targetState)) {
    console.log(`Skipping invalid transition from ${currentState} to ${targetState}`)
    return { success: true } // Don't fail webhook for invalid transition
  }

  const { error: updateError } = await supabase
    .from('vendors')
    .update({ onboarding_state: targetState })
    .eq('id', vendorId)

  if (updateError) {
    console.error('Failed to update vendor state:', updateError)
    return { success: false, error: updateError.message }
  }

  // Create audit log entry
  await supabase.from('audit_logs').insert({
    event_type: 'vendor.state_transition',
    entity_type: 'vendor',
    entity_id: vendorId,
    actor_type: 'stripe_webhook',
    stripe_event_id: stripeEventId,
    metadata: {
      previous_state: currentState,
      new_state: targetState,
      trigger: 'account.updated',
      ...metadata,
    },
  })

  console.log(`Transitioned vendor ${vendorId} from ${currentState} to ${targetState}`)
  return { success: true }
}

serve(async (req: Request): Promise<Response> => {
  // Webhooks must be POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('Missing signature', { status: 400 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    // Check for duplicate event processing (idempotency)
    const { data: existingLog } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingLog) {
      // Already processed this event, return success
      console.log(`Duplicate webhook event ${event.id}, skipping`)
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Handle different event types
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(supabase, event)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event)
        break

      default:
        // Log unhandled event types for monitoring
        console.log(`Unhandled event type: ${event.type}`)
        await createAuditLog(supabase, {
          eventType: `stripe.${event.type}`,
          entityType: 'stripe_event',
          entityId: event.id,
          actorType: 'stripe',
          stripeEventId: event.id,
          metadata: { handled: false, event_type: event.type },
        })
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    // Return 500 so Stripe will retry
    return new Response('Internal server error', { status: 500 })
  }
})

// ================================================
// Event Handlers
// ================================================

async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event
) {
  const account = event.data.object as Stripe.Account

  console.log(`Processing account.updated for ${account.id}`)

  // Find vendor by stripe_account_id
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, stripe_onboarding_complete, owner_id, onboarding_state')
    .eq('stripe_account_id', account.id)
    .single()

  if (vendorError || !vendor) {
    console.error(`Vendor not found for Stripe account ${account.id}`)
    await createAuditLog(supabase, {
      eventType: 'vendor.stripe_account_not_found',
      entityType: 'stripe_account',
      entityId: account.id,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        stripe_account_id: account.id,
        error: 'Vendor not found',
      },
    })
    return
  }

  // Determine onboarding status
  const chargesEnabled = account.charges_enabled || false
  const payoutsEnabled = account.payouts_enabled || false
  const detailsSubmitted = account.details_submitted || false
  const onboardingComplete = chargesEnabled && payoutsEnabled

  // Check if status changed
  const statusChanged = vendor.stripe_onboarding_complete !== onboardingComplete

  // Update vendor record
  const { error: updateError } = await supabase
    .from('vendors')
    .update({
      stripe_onboarding_complete: onboardingComplete,
    })
    .eq('id', vendor.id)

  if (updateError) {
    console.error('Failed to update vendor:', updateError)
    throw updateError
  }

  // === STATE MACHINE TRANSITIONS (Story 22.5) ===
  const currentState = (vendor.onboarding_state as VendorOnboardingStateValue) || 'registered'
  const targetState = determineStateFromStripeData({
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
  })

  // Execute state transition
  await transitionVendorState(
    supabase,
    vendor.id,
    currentState,
    targetState,
    event.id,
    {
      stripe_account_id: account.id,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      details_submitted: detailsSubmitted,
    }
  )

  // Auto-activate vendor when bank_linked is achieved
  if (targetState === 'bank_linked' && currentState !== 'bank_linked') {
    // Check if we can auto-progress to active
    await transitionVendorState(
      supabase,
      vendor.id,
      'bank_linked',
      'active',
      event.id,
      {
        stripe_account_id: account.id,
        auto_activation: true,
        reason: 'Automatic activation after bank linked',
      }
    )
  }

  // Create audit log
  await createAuditLog(supabase, {
    eventType: statusChanged
      ? (onboardingComplete ? 'vendor.stripe_onboarding_complete' : 'vendor.stripe_status_changed')
      : 'vendor.stripe_account_updated',
    entityType: 'vendor',
    entityId: vendor.id,
    actorId: vendor.owner_id,
    actorType: 'stripe',
    stripeEventId: event.id,
    metadata: {
      stripe_account_id: account.id,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      details_submitted: detailsSubmitted,
      onboarding_complete: onboardingComplete,
      status_changed: statusChanged,
      state_transition: { from: currentState, to: targetState },
    },
  })

  console.log(`Updated vendor ${vendor.id}: onboarding_complete=${onboardingComplete}, state=${targetState}`)
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event
) {
  const session = event.data.object as Stripe.Checkout.Session

  console.log(`Processing checkout.session.completed for ${session.id}`)

  // Extract metadata
  const tripId = session.metadata?.tripId
  const userId = session.metadata?.userId

  if (!tripId || !userId) {
    console.error('Missing tripId or userId in session metadata')
    return
  }

  // Create audit log for checkout completion
  await createAuditLog(supabase, {
    eventType: 'payment.checkout_completed',
    entityType: 'trip',
    entityId: tripId,
    actorId: userId,
    actorType: 'user',
    stripeEventId: event.id,
    metadata: {
      session_id: session.id,
      payment_intent: session.payment_intent,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  })

  // Note: Booking creation is handled by a separate Edge Function
  // that will be triggered after payment confirmation
}

async function handlePaymentSucceeded(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  console.log(`Processing payment_intent.succeeded for ${paymentIntent.id}`)

  // Find payment record by stripe_payment_intent_id
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, booking_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (paymentError || !payment) {
    // Payment record may not exist yet, create audit log
    await createAuditLog(supabase, {
      eventType: 'payment.succeeded',
      entityType: 'payment_intent',
      entityId: paymentIntent.id,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_record_found: false,
      },
    })
    return
  }

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (updateError) {
    console.error('Failed to update payment:', updateError)
    throw updateError
  }

  // Create audit log
  await createAuditLog(supabase, {
    eventType: 'payment.succeeded',
    entityType: 'payment',
    entityId: payment.id,
    actorType: 'stripe',
    stripeEventId: event.id,
    metadata: {
      payment_intent_id: paymentIntent.id,
      booking_id: payment.booking_id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    },
  })

  console.log(`Updated payment ${payment.id} to succeeded`)
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  console.log(`Processing payment_intent.payment_failed for ${paymentIntent.id}`)

  // Find payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('id, booking_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (payment) {
    // Update payment status to failed
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
  }

  // Create audit log
  await createAuditLog(supabase, {
    eventType: 'payment.failed',
    entityType: payment ? 'payment' : 'payment_intent',
    entityId: payment?.id || paymentIntent.id,
    actorType: 'stripe',
    stripeEventId: event.id,
    metadata: {
      payment_intent_id: paymentIntent.id,
      booking_id: payment?.booking_id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      last_payment_error: paymentIntent.last_payment_error?.message,
    },
  })

  console.log(`Payment failed: ${paymentIntent.id}`)
}

// ================================================
// Helpers
// ================================================

interface AuditLogParams {
  eventType: string
  entityType: string
  entityId: string
  actorId?: string
  actorType: 'user' | 'vendor' | 'system' | 'stripe'
  stripeEventId: string
  metadata: Record<string, unknown>
}

async function createAuditLog(
  supabase: ReturnType<typeof createClient>,
  params: AuditLogParams
) {
  const { error } = await supabase.from('audit_logs').insert({
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    actor_id: params.actorId || null,
    actor_type: params.actorType,
    stripe_event_id: params.stripeEventId,
    metadata: params.metadata,
  })

  if (error) {
    console.error('Failed to create audit log:', error)
  }
}
