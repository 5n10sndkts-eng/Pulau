// ================================================
// Edge Function: send-email
// Story: 30.1 - Create Email Notification Edge Function
// Story: 30.2 - Build Email Template System
// Phase: 2b - Enhanced Operations & Notifications
// ================================================
// Sends transactional emails via Resend API.
// Supports booking confirmation, cancellation, and reminder emails.
// Uses branded templates with responsive design.
// Logs all email attempts to audit_logs for compliance.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  generateBookingConfirmationEmail,
  generateBookingCancellationEmail,
  generateBookingReminderEmail,
  type BookingConfirmationData,
  type BookingCancellationData,
  type BookingReminderData,
} from './templates/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ================================================
// Types (AC #2: Email Types and Schemas)
// ================================================

type EmailType =
  | 'booking_confirmation'
  | 'booking_cancellation'
  | 'booking_reminder';

interface BaseEmailData {
  booking_reference: string;
  experience_name: string;
  experience_date: string;
  experience_time: string;
  guest_count: number;
  total_amount: number;
  currency: string;
  traveler_name: string;
}

interface ConfirmationEmailData extends BaseEmailData {
  experience_description?: string;
  experience_image?: string;
  duration_minutes?: number;
  meeting_point?: string;
  what_to_bring?: string[];
  inclusions?: string[];
  cancellation_policy?: string;
  ticket_url?: string;
}

interface CancellationEmailData extends BaseEmailData {
  refund_amount?: number;
  refund_status?: 'pending' | 'processing' | 'completed' | 'none';
  cancellation_reason?: string;
}

interface ReminderEmailData extends BaseEmailData {
  experience_image?: string;
  meeting_point?: string;
  what_to_bring?: string[];
  weather_note?: string;
  ticket_url?: string;
  reminder_type?: '24h' | '2h' | 'morning';
}

type EmailData =
  | ConfirmationEmailData
  | CancellationEmailData
  | ReminderEmailData;

interface EmailPayload {
  type: EmailType;
  to: string;
  booking_id: string;
  data: EmailData;
}

interface ResendResponse {
  id: string;
}

interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}

// ================================================
// Email Provider (AC #3: Resend Integration)
// ================================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const EMAIL_TIMEOUT_MS = 5000; // 5 second timeout (AC #5)
const MAX_RETRIES = 2;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
  }>;
}

async function sendWithResend(
  params: SendEmailParams,
  retryCount = 0,
): Promise<ResendResponse> {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    // Graceful degradation: log warning but don't crash
    console.warn('[send-email] RESEND_API_KEY not configured - email will not be sent');
    return { id: `mock-${Date.now()}` } as ResendResponse;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const emailBody: Record<string, unknown> = {
      from: 'Pulau <bookings@pulau.app>',
      to: [params.to],
      subject: params.subject,
      html: params.html,
    };

    // Add attachments if provided (for PDF ticket - AC #3 Story 30-2)
    if (params.attachments && params.attachments.length > 0) {
      emailBody.attachments = params.attachments;
    }

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: ResendError;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          statusCode: response.status,
          message: errorText,
          name: 'ResendError',
        };
      }

      // Retry on rate limit or server errors (AC #3, #5)
      if (
        (response.status === 429 || response.status >= 500) &&
        retryCount < MAX_RETRIES
      ) {
        console.log(
          `Retrying email send (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1)),
        );
        return sendWithResend(params, retryCount + 1);
      }

      throw new Error(
        `Resend API error (${response.status}): ${errorData.message}`,
      );
    }

    return (await response.json()) as ResendResponse;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Email send timed out');
    }

    throw error;
  }
}

// ================================================
// PDF Ticket Generation (AC #3 Story 30-2)
// ================================================

interface TicketPdfResponse {
  pdf_base64: string;
}

async function generateTicketPdf(bookingId: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Missing Supabase credentials for ticket generation');
      return null;
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-ticket`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId }),
      },
    );

    if (!response.ok) {
      console.warn(`Ticket generation failed: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TicketPdfResponse;
    return data.pdf_base64 || null;
  } catch (error) {
    console.error('Failed to generate ticket PDF:', error);
    return null;
  }
}

// ================================================
// Helpers
// ================================================

/**
 * Hash email for audit logging (PII protection - AC #4)
 * Uses SHA-256 for proper cryptographic hashing
 */
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/**
 * Rate limiting map (in-memory per instance)
 * Limits emails per booking_id to prevent abuse (AC #1 security)
 * 
 * ⚠️ LIMITATION: In-memory rate limiting is per-instance only.
 * Edge Functions are serverless and stateless - each invocation may get
 * a fresh runtime. For production, consider migrating to:
 * - Redis/Upstash for distributed rate limiting
 * - Supabase table with atomic increment
 * Current implementation provides basic protection but is not foolproof.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // Max emails per booking per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(bookingId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(bookingId);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(bookingId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

/**
 * Validate authentication (AC #1: service role key or valid JWT)
 */
async function validateAuthentication(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<{ valid: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  // Allow service role key (for internal system calls)
  if (token === serviceKey) {
    return { valid: true };
  }
  
  // Validate JWT for user calls
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { valid: false, error: 'Invalid or expired token' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Authentication failed' };
  }
}

/**
 * Validate email payload (AC #2)
 */
function validatePayload(
  payload: unknown,
): { valid: true; data: EmailPayload } | { valid: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload format' };
  }

  const p = payload as Record<string, unknown>;

  if (
    !p.type ||
    ![
      'booking_confirmation',
      'booking_cancellation',
      'booking_reminder',
    ].includes(p.type as string)
  ) {
    return { valid: false, error: 'Invalid or missing email type' };
  }

  if (!p.to || typeof p.to !== 'string' || !p.to.includes('@')) {
    return { valid: false, error: 'Invalid or missing recipient email' };
  }

  if (!p.booking_id || typeof p.booking_id !== 'string') {
    return { valid: false, error: 'Invalid or missing booking_id' };
  }

  if (!p.data || typeof p.data !== 'object') {
    return { valid: false, error: 'Invalid or missing data object' };
  }

  const data = p.data as Record<string, unknown>;
  const requiredFields = [
    'booking_reference',
    'experience_name',
    'experience_date',
    'experience_time',
    'guest_count',
    'total_amount',
    'currency',
    'traveler_name',
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return { valid: false, error: `Missing required field: data.${field}` };
    }
  }

  return { valid: true, data: payload as EmailPayload };
}

/**
 * Map email type to in-app notification type (Story 30.4)
 */
function mapEmailTypeToNotificationType(
  emailType: EmailType,
  reminderType?: '24h' | '2h' | 'morning',
): 'booking_confirmed' | 'booking_cancelled' | 'reminder_24h' | 'reminder_2h' {
  switch (emailType) {
    case 'booking_confirmation':
      return 'booking_confirmed';
    case 'booking_cancellation':
      return 'booking_cancelled';
    case 'booking_reminder':
      return reminderType === '2h' ? 'reminder_2h' : 'reminder_24h';
  }
}

/**
 * Create notification message for in-app notification (Story 30.4)
 */
function createNotificationMessage(
  type:
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'reminder_24h'
    | 'reminder_2h',
  experienceName: string,
): { title: string; message: string } {
  switch (type) {
    case 'booking_confirmed':
      return {
        title: 'Booking Confirmed',
        message: `Your booking for "${experienceName}" has been confirmed!`,
      };
    case 'booking_cancelled':
      return {
        title: 'Booking Cancelled',
        message: `Your booking for "${experienceName}" has been cancelled.`,
      };
    case 'reminder_24h':
      return {
        title: 'Reminder: Tomorrow',
        message: `Your experience "${experienceName}" is tomorrow. Don't forget to check the meeting point!`,
      };
    case 'reminder_2h':
      return {
        title: 'Starting Soon',
        message: `"${experienceName}" starts in 2 hours! Time to get ready.`,
      };
  }
}

/**
 * Create in-app notification for the user (Story 30.4)
 */
async function createInAppNotification(
  supabase: ReturnType<typeof createClient>,
  params: {
    userId: string;
    type:
      | 'booking_confirmed'
      | 'booking_cancelled'
      | 'reminder_24h'
      | 'reminder_2h';
    experienceName: string;
    bookingId: string;
  },
) {
  const { title, message } = createNotificationMessage(
    params.type,
    params.experienceName,
  );

  const { error } = await supabase.from('customer_notifications').insert({
    user_id: params.userId,
    type: params.type,
    title,
    message,
    booking_id: params.bookingId,
  });

  if (error) {
    console.error('Failed to create in-app notification:', error);
  } else {
    console.log(
      `In-app notification created: type=${params.type}, user=${params.userId}`,
    );
  }
}

/**
 * Get user_id from booking_id (Story 30.4)
 */
async function getUserIdFromBooking(
  supabase: ReturnType<typeof createClient>,
  bookingId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('trips(user_id)')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      console.warn(`Could not find user for booking ${bookingId}:`, error);
      return null;
    }

    // Handle nested response
    const trips = data.trips as { user_id: string } | null;
    return trips?.user_id ?? null;
  } catch (err) {
    console.error('Error getting user from booking:', err);
    return null;
  }
}

/**
 * Create audit log entry (AC #4)
 */
async function createAuditLog(
  supabase: ReturnType<typeof createClient>,
  params: {
    eventType: string;
    entityType: string;
    entityId: string;
    actorType: 'user' | 'vendor' | 'system' | 'stripe';
    metadata: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from('audit_logs').insert({
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    actor_type: params.actorType,
    metadata: params.metadata,
  });

  if (error) {
    console.error('Failed to create audit log:', error);
  }
}

// ================================================
// Email Generation
// ================================================

function generateEmailContent(
  type: EmailType,
  data: EmailData,
): { subject: string; html: string } {
  switch (type) {
    case 'booking_confirmation': {
      const confirmData = data as ConfirmationEmailData;
      const html = generateBookingConfirmationEmail(
        confirmData as BookingConfirmationData,
      );
      return {
        subject: `Booking Confirmed: ${data.experience_name}`,
        html,
      };
    }

    case 'booking_cancellation': {
      const cancelData = data as CancellationEmailData;
      const html = generateBookingCancellationEmail(
        cancelData as BookingCancellationData,
      );
      return {
        subject: `Booking Cancelled: ${data.experience_name}`,
        html,
      };
    }

    case 'booking_reminder': {
      const reminderData = data as ReminderEmailData;
      const reminderType = reminderData.reminder_type ?? '24h';
      const urgencyText = {
        '24h': 'is tomorrow',
        '2h': 'starts in 2 hours',
        morning: 'is today',
      }[reminderType];

      const html = generateBookingReminderEmail(
        reminderData as BookingReminderData,
      );
      return {
        subject: `Reminder: ${data.experience_name} ${urgencyText}!`,
        html,
      };
    }
  }
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Validate authentication (AC #1: service role key or valid JWT)
  const authResult = await validateAuthentication(req, supabase);
  if (!authResult.valid) {
    return new Response(
      JSON.stringify({ error: authResult.error || 'Unauthorized' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    // Parse and validate request body (AC #2)
    let rawPayload: unknown;
    try {
      rawPayload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = validatePayload(rawPayload);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = validation.data;

    // Check rate limit (security: prevent email abuse)
    const rateLimit = checkRateLimit(payload.booking_id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT_MAX} emails per booking per hour`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate email content using branded templates (Story 30-2)
    const { subject, html } = generateEmailContent(payload.type, payload.data);

    // For confirmation emails, try to attach PDF ticket (AC #3 Story 30-2)
    let attachments: Array<{ filename: string; content: string }> | undefined;

    if (payload.type === 'booking_confirmation') {
      const pdfBase64 = await generateTicketPdf(payload.booking_id);

      if (pdfBase64) {
        attachments = [
          {
            filename: `Pulau-Ticket-${payload.data.booking_reference}.pdf`,
            content: pdfBase64,
          },
        ];
        console.log(`PDF ticket attached for booking ${payload.booking_id}`);
      } else {
        console.log(
          `No PDF ticket attached for booking ${payload.booking_id} (generation failed or skipped)`,
        );
      }
    }

    // Send email via Resend (AC #1, #3)
    const result = await sendWithResend({
      to: payload.to,
      subject,
      html,
      attachments,
    });

    // Log to email_logs table (Story 30.1.1)
    await supabase.from('email_logs').insert({
      resend_message_id: result.id,
      booking_id: payload.booking_id,
      to_email: payload.to,
      template: payload.type,
      subject,
      status: 'sent',
      metadata: {
        has_attachment: !!attachments,
        reminder_type: (payload.data as ReminderEmailData).reminder_type,
      },
    });

    // Also log to audit_logs for compliance (AC #4)
    await createAuditLog(supabase, {
      eventType: 'email.sent',
      entityType: 'booking',
      entityId: payload.booking_id,
      actorType: 'system',
      metadata: {
        email_type: payload.type,
        recipient_hash: await hashEmail(payload.to),
        provider_message_id: result.id,
        status: 'sent',
        has_attachment: !!attachments,
      },
    });

    console.log(
      `Email sent: type=${payload.type}, booking=${payload.booking_id}, message_id=${result.id}`,
    );

    // Create in-app notification (Story 30.4)
    const userId = await getUserIdFromBooking(supabase, payload.booking_id);
    if (userId) {
      const reminderData = payload.data as ReminderEmailData;
      const notificationType = mapEmailTypeToNotificationType(
        payload.type,
        reminderData.reminder_type,
      );

      await createInAppNotification(supabase, {
        userId,
        type: notificationType,
        experienceName: payload.data.experience_name,
        bookingId: payload.booking_id,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message_id: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Send email error:', errorMessage);

    // Log failed send attempt to email_logs and audit_logs (AC #4, #5)
    try {
      const rawPayload = (await req
        .clone()
        .json()
        .catch(() => ({}))) as Record<string, unknown>;
      if (rawPayload.booking_id) {
        // Log to email_logs table
        await supabase.from('email_logs').insert({
          booking_id: rawPayload.booking_id as string,
          to_email: (rawPayload.to as string) || 'unknown',
          template: (rawPayload.type as string) || 'unknown',
          status: 'failed',
          error_message: errorMessage,
          metadata: {
            error_type: error instanceof Error ? error.name : 'UnknownError',
          },
        });

        // Also log to audit_logs for compliance
        await createAuditLog(supabase, {
          eventType: 'email.failed',
          entityType: 'booking',
          entityId: rawPayload.booking_id as string,
          actorType: 'system',
          metadata: {
            email_type: rawPayload.type || 'unknown',
            recipient_hash: rawPayload.to
              ? await hashEmail(rawPayload.to as string)
              : 'unknown',
            status: 'failed',
            error: errorMessage,
          },
        });
      }
    } catch (auditError) {
      console.error('Failed to log email error:', auditError);
    }

    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
