// ================================================
// Edge Function: vendor-onboard
// Story: 22.1 - Create Stripe Connect Account for Vendor
// Story: 22.5 - Integrate State Machine Transitions
// Phase: 2a - Core Transactional
// ================================================
// Creates a Stripe Connect Express account for vendors
// and returns an Account Link URL for onboarding.
// Transitions vendor state machine on account creation.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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

async function transitionVendorState(
  supabase: ReturnType<typeof createClient>,
  vendorId: string,
  currentState: VendorOnboardingStateValue,
  targetState: VendorOnboardingStateValue,
  actor: 'system' | 'admin' | 'stripe_webhook' | 'vendor',
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidTransition(currentState, targetState)) {
    return {
      success: false,
      error: `Invalid transition from ${currentState} to ${targetState}`,
    };
  }

  const { error: updateError } = await supabase
    .from('vendors')
    .update({ onboarding_state: targetState })
    .eq('id', vendorId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Create audit log entry
  await supabase.from('audit_logs').insert({
    event_type: 'vendor.state_transition',
    entity_type: 'vendor',
    entity_id: vendorId,
    actor_type: actor,
    metadata: {
      previous_state: currentState,
      new_state: targetState,
      reason: reason || null,
      ...metadata,
    },
  });

  return { success: true };
}

interface VendorOnboardRequest {
  vendorId?: string;
}

interface VendorOnboardResponse {
  success: boolean;
  accountLinkUrl?: string;
  stripeAccountId?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get vendor record for this user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select(
        'id, business_email, business_name, stripe_account_id, owner_id, onboarding_state',
      )
      .eq('owner_id', user.id)
      .single();

    if (vendorError || !vendor) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Vendor not found for this user',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    let stripeAccountId = vendor.stripe_account_id;

    // If vendor already has a Stripe account, just create a new account link
    if (!stripeAccountId) {
      // Create new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ID', // Indonesia
        email: vendor.business_email || user.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: vendor.business_name,
          product_description: 'Travel experiences and activities in Bali',
        },
        metadata: {
          vendor_id: vendor.id,
          pulau_user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      // Update vendor record with Stripe account ID
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          stripe_account_id: stripeAccountId,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);

      if (updateError) {
        console.error(
          'Failed to update vendor with Stripe account ID:',
          updateError,
        );
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to save Stripe account',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Create audit log entry for account creation
      await supabase.from('audit_logs').insert({
        event_type: 'vendor.stripe_account_created',
        entity_type: 'vendor',
        entity_id: vendor.id,
        actor_id: user.id,
        actor_type: 'vendor',
        metadata: {
          stripe_account_id: stripeAccountId,
          business_name: vendor.business_name,
        },
      });

      // Transition vendor state from 'registered' to 'kyc_submitted'
      const currentState =
        (vendor.onboarding_state as VendorOnboardingStateValue) || 'registered';
      if (currentState === 'registered') {
        await transitionVendorState(
          supabase,
          vendor.id,
          currentState,
          'kyc_submitted',
          'system',
          'Stripe Connect account created - initiating KYC',
          { stripe_account_id: stripeAccountId },
        );
      }
    }

    // Generate Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/vendor/stripe/refresh`,
      return_url: `${appUrl}/vendor/stripe/return`,
      type: 'account_onboarding',
    });

    // Log the onboarding initiation
    await supabase.from('audit_logs').insert({
      event_type: 'vendor.stripe_onboarding_started',
      entity_type: 'vendor',
      entity_id: vendor.id,
      actor_id: user.id,
      actor_type: 'vendor',
      metadata: {
        stripe_account_id: stripeAccountId,
        account_link_created: true,
      },
    });

    const response: VendorOnboardResponse = {
      success: true,
      accountLinkUrl: accountLink.url,
      stripeAccountId: stripeAccountId,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('vendor-onboard error:', error);

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Stripe error: ${error.message}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
