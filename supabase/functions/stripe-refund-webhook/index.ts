/**
 * Stripe Refund Webhook Handler
 * Story: 28-7 - Implement Refund Processing
 *
 * Handles async Stripe refund webhook events to sync refund status
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check environment variables inside handler to avoid module-load crash
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-12-18.acacia',
  });

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle refund events
    switch (event.type) {
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const refund = charge.refunds?.data[0];
        
        if (!refund) break;

        // Find payment record by payment_intent_id
        const { data: payment } = await supabase
          .from('payments')
          .select('id, booking_id, amount, refund_amount')
          .eq('stripe_payment_intent_id', charge.payment_intent)
          .single();

        if (payment) {
          const newRefundTotal = (payment.refund_amount || 0) + refund.amount;
          const isFullRefund = newRefundTotal >= payment.amount;

          // Update payment status
          await supabase
            .from('payments')
            .update({
              status: isFullRefund ? 'refunded' : 'partially_refunded',
              refund_amount: newRefundTotal,
              refund_id: refund.id,
              refunded_at: new Date(refund.created * 1000).toISOString(),
            })
            .eq('id', payment.id);

          // Update booking status if full refund
          if (isFullRefund) {
            await supabase
              .from('bookings')
              .update({
                status: 'refunded',
                refunded_at: new Date(refund.created * 1000).toISOString(),
              })
              .eq('id', payment.booking_id);
          }

          // Create audit log
          await supabase.from('audit_logs').insert({
            event_type: isFullRefund ? 'booking.refund' : 'booking.partial_refund',
            entity_type: 'booking',
            entity_id: payment.booking_id,
            actor_type: 'stripe',
            metadata: {
              stripe_refund_id: refund.id,
              refund_amount: refund.amount,
              webhook_event_id: event.id,
              total_refunded: newRefundTotal,
              is_full_refund: isFullRefund,
            },
          });
        }
        break;
      }

      case 'charge.refund.updated': {
        // Handle refund status updates if needed
        const refund = event.data.object as Stripe.Refund;
        
        // Log the update
        await supabase.from('audit_logs').insert({
          event_type: 'refund.stripe_error',
          entity_type: 'payment',
          entity_id: refund.payment_intent as string,
          actor_type: 'stripe',
          metadata: {
            stripe_refund_id: refund.id,
            refund_status: refund.status,
            webhook_event_id: event.id,
          },
        });
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Webhook error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
