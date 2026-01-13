/**
 * Vendor Payout Status Edge Function
 * Story: 27.5 - Create Vendor Payout Status Edge Function
 *
 * Supabase Edge Function to fetch vendor payout status from Stripe
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface PayoutStatus {
  pending: Array<{
    amount: number;
    currency: string;
    arrival_date: number;
  }>;
  scheduled: Array<{
    amount: number;
    currency: string;
    arrival_date: number;
    stripe_transfer_id: string;
  }>;
  completed: Array<{
    amount: number;
    currency: string;
    arrival_date: number;
    stripe_transfer_id: string;
  }>;
  payout_schedule: {
    interval: string;
    monthly_anchor?: number;
    weekly_anchor?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get vendor ID from request
    const { vendorId } = await req.json();

    if (!vendorId) {
      return new Response(JSON.stringify({ error: 'Vendor ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !supabaseKey || !stripeKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get vendor's Stripe account ID
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('stripe_account_id')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor?.stripe_account_id) {
      return new Response(
        JSON.stringify({
          error: 'Vendor not found or not connected to Stripe',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Fetch payouts from Stripe API
    const payoutsResponse = await fetch(
      `https://api.stripe.com/v1/payouts?limit=10`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Stripe-Account': vendor.stripe_account_id,
        },
      },
    );

    if (!payoutsResponse.ok) {
      throw new Error('Failed to fetch payouts from Stripe');
    }

    const payoutsData = await payoutsResponse.json();

    // Fetch account details for payout schedule
    const accountResponse = await fetch(
      `https://api.stripe.com/v1/accounts/${vendor.stripe_account_id}`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      },
    );

    if (!accountResponse.ok) {
      throw new Error('Failed to fetch account details from Stripe');
    }

    const accountData = await accountResponse.json();

    // Organize payouts by status
    const pending: PayoutStatus['pending'] = [];
    const scheduled: PayoutStatus['scheduled'] = [];
    const completed: PayoutStatus['completed'] = [];

    for (const payout of payoutsData.data) {
      const payoutInfo = {
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        stripe_transfer_id: payout.id,
      };

      if (payout.status === 'pending') {
        pending.push(payoutInfo);
      } else if (payout.status === 'in_transit') {
        scheduled.push(payoutInfo);
      } else if (payout.status === 'paid') {
        completed.push(payoutInfo);
      }
    }

    const response: PayoutStatus = {
      pending,
      scheduled,
      completed,
      payout_schedule: accountData.settings?.payouts?.schedule || {
        interval: 'manual',
      },
    };

    // Cache response for 5 minutes
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching payout status:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
