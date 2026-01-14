/**
 * Resend Booking Email Edge Function
 * Story: 30.1.4 - Add Email Triggers to Checkout
 *
 * Allows manual resend of booking confirmation emails
 * for cases where initial send failed
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ResendRequest {
  bookingId: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { bookingId }: ResendRequest = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'bookingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch booking with user verification
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        reference,
        guest_count,
        total_amount,
        email_resend_count,
        profiles!inner(id, email, full_name),
        experiences!inner(title, meeting_point),
        experience_slots!inner(slot_date, slot_time),
        trips!inner(user_id)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns this booking or is admin
    const tripData = booking.trips as { user_id: string };
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = tripData.user_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit resends
    if ((booking.email_resend_count || 0) >= 5) {
      return new Response(
        JSON.stringify({ error: 'Maximum resend limit reached (5)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract data
    const customerProfile = booking.profiles as { email: string; full_name: string };
    const experience = booking.experiences as { title: string; meeting_point?: string };
    const slot = booking.experience_slots as { slot_date: string; slot_time: string };

    // Send email with retry
    const emailResult = await sendEmailWithRetry(supabase, {
      bookingId,
      bookingReference: booking.reference,
      toEmail: customerProfile.email,
      travelerName: customerProfile.full_name || 'Traveler',
      experienceName: experience.title,
      experienceDate: slot.slot_date,
      experienceTime: slot.slot_time,
      guestCount: booking.guest_count || 1,
      totalAmount: (booking.total_amount || 0) / 100,
      meetingPoint: experience.meeting_point,
    });

    if (!emailResult.success) {
      // Log failure for manual follow-up
      await supabase.from('failed_emails').insert({
        booking_id: bookingId,
        email: customerProfile.email,
        template: 'booking_confirmation',
        error_message: emailResult.error,
        attempts: 3,
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email send failed after retries',
          message: 'Support has been notified'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking with email status
    await supabase
      .from('bookings')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_resend_count: (booking.email_resend_count || 0) + 1,
      })
      .eq('id', bookingId);

    // Mark failed_emails as resolved if exists
    await supabase
      .from('failed_emails')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
      })
      .eq('booking_id', bookingId)
      .eq('resolved', false);

    // Create audit log entry
    await supabase.from('audit_logs').insert({
      event_type: 'email.resent',
      entity_type: 'booking',
      entity_id: bookingId,
      actor_id: user.id,
      actor_type: isAdmin ? 'admin' : 'user',
      metadata: {
        email: customerProfile.email,
        template: 'booking_confirmation',
        resend_count: (booking.email_resend_count || 0) + 1,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email resent successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resend email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface EmailData {
  bookingId: string;
  bookingReference: string;
  toEmail: string;
  travelerName: string;
  experienceName: string;
  experienceDate: string;
  experienceTime: string;
  guestCount: number;
  totalAmount: number;
  meetingPoint?: string;
}

async function sendEmailWithRetry(
  supabase: ReturnType<typeof createClient>,
  data: EmailData,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: data.toEmail,
          booking_id: data.bookingId,
          data: {
            booking_reference: data.bookingReference,
            experience_name: data.experienceName,
            experience_date: data.experienceDate,
            experience_time: data.experienceTime,
            guest_count: data.guestCount,
            total_amount: data.totalAmount,
            currency: 'USD',
            traveler_name: data.travelerName,
            meeting_point: data.meetingPoint,
          },
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorText = await response.text();
      console.error(`Email attempt ${attempt} failed:`, errorText);

      if (attempt === maxRetries) {
        return { success: false, error: errorText };
      }

      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));

    } catch (error) {
      console.error(`Email attempt ${attempt} error:`, error);

      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}
