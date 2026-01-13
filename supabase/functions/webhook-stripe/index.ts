// ================================================
// Edge Function: webhook-stripe
// Story: 22.2 - Handle Stripe Account Update Webhooks
// Story: 22.5 - Integrate State Machine Transitions
// Story: 24.4 - Handle Stripe Webhooks for Payment Events
// Phase: 2a - Core Transactional
// ================================================
// Handles Stripe webhook events for account updates,
// payment events, refunds, and other Stripe-initiated notifications.
// Integrates with vendor onboarding state machine and payment processing.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

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
  | 'suspended';

const VALID_TRANSITIONS: Record<
  VendorOnboardingStateValue,
  VendorOnboardingStateValue[]
> = {
  registered: ['kyc_submitted'],
  kyc_submitted: ['kyc_verified', 'kyc_rejected'],
  kyc_verified: ['bank_linked'],
  kyc_rejected: ['kyc_submitted'],
  bank_linked: ['active'],
  active: ['suspended'],
  suspended: ['active'],
};

function isValidTransition(
  current: VendorOnboardingStateValue,
  target: VendorOnboardingStateValue,
): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

/**
 * Determine target state based on Stripe account data
 */
function determineStateFromStripeData(data: {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}): VendorOnboardingStateValue {
  const { chargesEnabled, payoutsEnabled, detailsSubmitted } = data;

  // Full verification and bank linked - ready for activation
  if (chargesEnabled && payoutsEnabled) {
    return 'bank_linked';
  }

  // Identity verified but bank not linked
  if (chargesEnabled && !payoutsEnabled) {
    return 'kyc_verified';
  }

  // Details submitted but not yet verified
  if (detailsSubmitted && !chargesEnabled) {
    return 'kyc_submitted';
  }

  return 'kyc_submitted';
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
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  // Skip if already at target state
  if (currentState === targetState) {
    return { success: true };
  }

  // Validate transition
  if (!isValidTransition(currentState, targetState)) {
    console.log(
      `Skipping invalid transition from ${currentState} to ${targetState}`,
    );
    return { success: true }; // Don't fail webhook for invalid transition
  }

  const { error: updateError } = await supabase
    .from('vendors')
    .update({ onboarding_state: targetState })
    .eq('id', vendorId);

  if (updateError) {
    console.error('Failed to update vendor state:', updateError);
    return { success: false, error: updateError.message };
  }

  // Create audit log entry
  await supabase.from('audit_logs').insert({
    event_type: 'vendor.state_transition',
    entity_type: 'vendor',
    entity_id: vendorId,
    actor_type: 'stripe',
    stripe_event_id: stripeEventId,
    metadata: {
      previous_state: currentState,
      new_state: targetState,
      trigger: 'account.updated',
      ...metadata,
    },
  });

  console.log(
    `Transitioned vendor ${vendorId} from ${currentState} to ${targetState}`,
  );
  return { success: true };
}

serve(async (req: Request): Promise<Response> => {
  // Webhooks must be POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Check for duplicate event processing (idempotency)
    const { data: existingLog } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingLog) {
      // Already processed this event, return success
      console.log(`Duplicate webhook event ${event.id}, skipping`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(supabase, event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event);
        break;

      default:
        // Log unhandled event types for monitoring
        console.log(`Unhandled event type: ${event.type}`);
        await createAuditLog(supabase, {
          eventType: `stripe.${event.type}`,
          entityType: 'stripe_event',
          entityId: event.id,
          actorType: 'stripe',
          stripeEventId: event.id,
          metadata: { handled: false, event_type: event.type },
        });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 500 so Stripe will retry
    return new Response('Internal server error', { status: 500 });
  }
});

// ================================================
// Event Handlers
// ================================================

async function handleAccountUpdated(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const account = event.data.object as Stripe.Account;

  console.log(`Processing account.updated for ${account.id}`);

  // Find vendor by stripe_account_id
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id, stripe_onboarding_complete, owner_id, onboarding_state')
    .eq('stripe_account_id', account.id)
    .single();

  if (vendorError || !vendor) {
    console.error(`Vendor not found for Stripe account ${account.id}`);
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
    });
    return;
  }

  // Determine onboarding status
  const chargesEnabled = account.charges_enabled || false;
  const payoutsEnabled = account.payouts_enabled || false;
  const detailsSubmitted = account.details_submitted || false;
  const onboardingComplete = chargesEnabled && payoutsEnabled;

  // Check if status changed
  const statusChanged =
    vendor.stripe_onboarding_complete !== onboardingComplete;

  // Update vendor record
  const { error: updateError } = await supabase
    .from('vendors')
    .update({
      stripe_onboarding_complete: onboardingComplete,
    })
    .eq('id', vendor.id);

  if (updateError) {
    console.error('Failed to update vendor:', updateError);
    throw updateError;
  }

  // === STATE MACHINE TRANSITIONS (Story 22.5) ===
  const currentState =
    (vendor.onboarding_state as VendorOnboardingStateValue) || 'registered';
  const targetState = determineStateFromStripeData({
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
  });

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
    },
  );

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
      },
    );
  }

  // Create audit log
  await createAuditLog(supabase, {
    eventType: statusChanged
      ? onboardingComplete
        ? 'vendor.stripe_onboarding_complete'
        : 'vendor.stripe_status_changed'
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
  });

  console.log(
    `Updated vendor ${vendor.id}: onboarding_complete=${onboardingComplete}, state=${targetState}`,
  );
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log(`Processing checkout.session.completed for ${session.id}`);

  // Extract metadata - check both formats (from checkout Edge Function)
  const tripId = session.metadata?.trip_id || session.metadata?.tripId;
  const userId = session.metadata?.user_id || session.metadata?.userId;

  if (!tripId || !userId) {
    console.error(
      'Missing tripId or userId in session metadata:',
      session.metadata,
    );
    await createAuditLog(supabase, {
      eventType: 'payment.checkout_completed_error',
      entityType: 'checkout_session',
      entityId: session.id,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        error: 'Missing tripId or userId in metadata',
        session_id: session.id,
        metadata_received: session.metadata,
      },
    });
    return;
  }

  // ================================================
  // Step 1: Find and update payment record (AC #1)
  // ================================================
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('stripe_checkout_session_id', session.id)
    .select('id, booking_id, amount')
    .single();

  if (paymentError || !payment) {
    console.error(
      'Payment not found for session:',
      session.id,
      paymentError?.message,
    );
    // Create payment record if missing (reconciliation scenario)
    await createAuditLog(supabase, {
      eventType: 'payment.checkout_completed_no_payment',
      entityType: 'checkout_session',
      entityId: session.id,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        error: 'Payment record not found',
        session_id: session.id,
        trip_id: tripId,
        user_id: userId,
      },
    });
    return;
  }

  // ================================================
  // Step 2: Fetch booking for confirmation (AC #1)
  // Note: Status update is handled by confirm_booking_atomic RPC
  // ================================================
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, trip_id, reference')
    .eq('id', payment.booking_id)
    .single();

  if (bookingError || !booking) {
    console.error(
      'Booking not found:',
      payment.booking_id,
      bookingError?.message,
    );
    return;
  }

  // ================================================
  // Step 3: Atomic booking confirmation (AC #1) - Story 24.5
  // Uses PostgreSQL function with row-level locking
  // ================================================
  const { data: confirmResult, error: confirmError } = await supabase.rpc(
    'confirm_booking_atomic',
    {
      p_booking_id: booking.id,
      p_trip_id: booking.trip_id,
    },
  );

  if (confirmError) {
    // Fallback to manual confirmation if RPC fails
    console.log(
      'Atomic confirm RPC failed, using manual fallback:',
      confirmError.message,
    );

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', booked_at: new Date().toISOString() })
      .eq('id', booking.id);

    // Check if slots were already reserved in checkout (atomic reservation)
    const slotsAlreadyReserved = session.metadata?.slots_reserved === 'true';

    if (slotsAlreadyReserved) {
      console.log(
        'Slots already atomically reserved in checkout, skipping decrement',
      );
    } else {
      // Legacy path: Decrement slots here (old behavior before atomic reservation)
      console.log('Decrementing slots in webhook (legacy path)');

      // Decrement each slot using the atomic RPC for row-level locking
      // This provides per-slot atomicity even if full transaction atomicity isn't available
      const { data: tripItems } = await supabase
        .from('trip_items')
        .select('id, experience_id, guests, date, time')
        .eq('trip_id', booking.trip_id);

      if (tripItems) {
        const slotResults: Array<{
          slotId: string;
          success: boolean;
          error?: string;
        }> = [];
        for (const item of tripItems) {
          if (item.date && item.time) {
            // Use decrement_slot_availability RPC which has row-level locking
            const { data: decrementResult, error: decrementError } =
              await supabase.rpc('decrement_slot_availability', {
                p_experience_id: item.experience_id,
                p_slot_date: item.date,
                p_slot_time: item.time,
                p_count: item.guests || 1,
              });

            if (decrementError) {
              // Fallback to manual decrement if RPC not available
              console.warn(
                'decrement_slot_availability RPC failed, using manual update:',
                decrementError.message,
              );
              const { data: slot } = await supabase
                .from('experience_slots')
                .select('id, available_count')
                .eq('experience_id', item.experience_id)
                .eq('slot_date', item.date)
                .eq('slot_time', item.time)
                .single();

              if (slot) {
                const newCount = Math.max(
                  0,
                  slot.available_count - (item.guests || 1),
                );
                await supabase
                  .from('experience_slots')
                  .update({ available_count: newCount })
                  .eq('id', slot.id);
                slotResults.push({ slotId: slot.id, success: true });
              }
            } else {
              slotResults.push({
                slotId: decrementResult?.slot_id || 'unknown',
                success: decrementResult?.success || false,
              });
            }
          }
        }
        console.log(
          'Fallback slot decrements completed:',
          JSON.stringify(slotResults),
        );
      }
    }

    // Update trip status manually
    await supabase
      .from('trips')
      .update({ status: 'booked', booked_at: new Date().toISOString() })
      .eq('id', booking.trip_id);
  } else {
    // Log atomic confirmation result
    console.log(
      'Atomic booking confirmation result:',
      JSON.stringify(confirmResult),
    );

    // Check if any slots failed
    if (!confirmResult?.success) {
      console.warn(
        'Some slots may have had issues:',
        confirmResult?.slot_results,
      );
    }
  }

  // ================================================
  // Step 5: Create audit log (AC #1)
  // ================================================
  await createAuditLog(supabase, {
    eventType: 'payment.checkout_completed',
    entityType: 'payment',
    entityId: payment.id,
    actorId: userId,
    actorType: 'stripe',
    stripeEventId: event.id,
    metadata: {
      session_id: session.id,
      payment_intent: paymentIntentId,
      amount_total: session.amount_total,
      currency: session.currency,
      booking_id: booking.id,
      booking_reference: booking.reference,
      trip_id: booking.trip_id,
    },
  });

  // ================================================
  // Step 6: Trigger ticket generation (Story 24.6)
  // Async - don't block webhook response
  // ================================================
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Fire and forget - ticket generation happens async
  fetch(`${supabaseUrl}/functions/v1/generate-ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ bookingId: booking.id }),
  })
    .then((response) => {
      if (response.ok) {
        console.log(
          `Ticket generation triggered for booking ${booking.reference}`,
        );
      } else {
        console.error(
          `Ticket generation failed for booking ${booking.reference}:`,
          response.status,
        );
      }
    })
    .catch((error) => {
      console.error(
        `Ticket generation error for booking ${booking.reference}:`,
        error,
      );
    });

  // ================================================
  // Step 7: Send confirmation email (Story 30.1)
  // Async - fire and forget, don't block webhook
  // ================================================
  sendConfirmationEmail(supabaseUrl, supabaseServiceKey, booking.id, userId);

  console.log(
    `Checkout completed: payment=${payment.id}, booking=${booking.reference}`,
  );
}

async function handlePaymentSucceeded(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log(`Processing payment_intent.succeeded for ${paymentIntent.id}`);

  // Find payment record by stripe_payment_intent_id
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, booking_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

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
    });
    return;
  }

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Failed to update payment:', updateError);
    throw updateError;
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
  });

  console.log(`Updated payment ${payment.id} to succeeded`);
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log(
    `Processing payment_intent.payment_failed for ${paymentIntent.id}`,
  );

  // Find payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('id, booking_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (payment) {
    // Update payment status to failed (AC #2)
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // Update booking status (AC #2)
    await supabase
      .from('bookings')
      .update({ status: 'payment_failed' })
      .eq('id', payment.booking_id);
  }

  // Create audit log (AC #2)
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
      failure_reason: paymentIntent.last_payment_error?.message,
      failure_code: paymentIntent.last_payment_error?.code,
    },
  });

  console.log(`Payment failed: ${paymentIntent.id}`);
}

/**
 * Handle charge.refunded event (AC #3)
 * - Updates payment refund_amount and status
 * - Updates booking status if full refund
 */
async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const charge = event.data.object as Stripe.Charge;

  console.log(`Processing charge.refunded for ${charge.id}`);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.error('No payment_intent on charge:', charge.id);
    await createAuditLog(supabase, {
      eventType: 'payment.refund_error',
      entityType: 'charge',
      entityId: charge.id,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        error: 'No payment_intent on charge',
        charge_id: charge.id,
      },
    });
    return;
  }

  // Calculate refund amounts
  const totalRefunded = charge.amount_refunded;
  const originalAmount = charge.amount;
  const isFullRefund = totalRefunded >= originalAmount;

  // Determine new status
  const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

  // Find and update payment record (AC #3)
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({
      refund_amount: totalRefunded,
      status: newStatus,
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select('id, booking_id')
    .single();

  if (paymentError || !payment) {
    console.error(
      'Payment not found for intent:',
      paymentIntentId,
      paymentError?.message,
    );
    await createAuditLog(supabase, {
      eventType: 'payment.refund_error',
      entityType: 'payment_intent',
      entityId: paymentIntentId,
      actorType: 'stripe',
      stripeEventId: event.id,
      metadata: {
        error: 'Payment record not found',
        payment_intent_id: paymentIntentId,
        charge_id: charge.id,
      },
    });
    return;
  }

  // If full refund, update booking status (AC #3)
  if (isFullRefund) {
    await supabase
      .from('bookings')
      .update({ status: 'refunded' })
      .eq('id', payment.booking_id);
  }

  // Create audit log (AC #3)
  await createAuditLog(supabase, {
    eventType: isFullRefund ? 'payment.refunded' : 'payment.partially_refunded',
    entityType: 'payment',
    entityId: payment.id,
    actorType: 'stripe',
    stripeEventId: event.id,
    metadata: {
      charge_id: charge.id,
      payment_intent_id: paymentIntentId,
      refund_amount: totalRefunded,
      original_amount: originalAmount,
      is_full_refund: isFullRefund,
      booking_id: payment.booking_id,
    },
  });

  console.log(
    `Refund processed: payment=${payment.id}, amount=${totalRefunded}, full=${isFullRefund}`,
  );
}

// ================================================
// Helpers
// ================================================

/**
 * Send booking confirmation email via send-email Edge Function (Story 30.1)
 * Fire and forget - does not block webhook response (AC #5)
 */
async function sendConfirmationEmail(
  supabaseUrl: string,
  supabaseServiceKey: string,
  bookingId: string,
  userId: string,
) {
  try {
    // Fetch booking details for email
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        reference,
        guest_count,
        total_amount,
        profiles!inner(email, full_name),
        experiences!inner(title, meeting_point),
        experience_slots!inner(slot_date, slot_time)
      `,
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error(
        'Failed to fetch booking for email:',
        bookingError?.message,
      );
      return;
    }

    // Extract data with type safety
    const profile = booking.profiles as { email: string; full_name: string };
    const experience = booking.experiences as {
      title: string;
      meeting_point?: string;
    };
    const slot = booking.experience_slots as {
      slot_date: string;
      slot_time: string;
    };

    // Send email (fire and forget)
    fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        type: 'booking_confirmation',
        to: profile.email,
        booking_id: bookingId,
        data: {
          booking_reference: booking.reference,
          experience_name: experience.title,
          experience_date: slot.slot_date,
          experience_time: slot.slot_time,
          guest_count: booking.guest_count || 1,
          total_amount: (booking.total_amount || 0) / 100, // Convert from cents
          currency: 'USD',
          traveler_name: profile.full_name || 'Traveler',
          meeting_point: experience.meeting_point,
        },
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log(
            `Confirmation email sent for booking ${booking.reference}`,
          );
        } else {
          console.error(
            `Confirmation email failed for booking ${booking.reference}:`,
            response.status,
          );
        }
      })
      .catch((error) => {
        console.error(
          `Confirmation email error for booking ${booking.reference}:`,
          error,
        );
      });
  } catch (error) {
    console.error('Error preparing confirmation email:', error);
    // Don't throw - email is non-blocking
  }
}

interface AuditLogParams {
  eventType: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actorType: 'user' | 'vendor' | 'system' | 'stripe';
  stripeEventId: string;
  metadata: Record<string, unknown>;
}

async function createAuditLog(
  supabase: ReturnType<typeof createClient>,
  params: AuditLogParams,
) {
  const { error } = await supabase.from('audit_logs').insert({
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    actor_id: params.actorId || null,
    actor_type: params.actorType,
    stripe_event_id: params.stripeEventId,
    metadata: params.metadata,
  });

  if (error) {
    console.error('Failed to create audit log:', error);
  }
}
