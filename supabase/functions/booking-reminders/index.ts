// ================================================
// Edge Function: booking-reminders
// Story: 30.3 - Implement Booking Reminder Scheduler
// Phase: 2b - Enhanced Operations & Notifications
// ================================================
// Processes pending booking reminders and sends emails.
// Runs on a schedule (hourly) to send 24h and 2h reminders.
// Tracks reminder status to prevent duplicates.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ================================================
// Types
// ================================================

type ReminderType = '24h' | '2h' | 'morning'
type ReminderStatus = 'pending' | 'sent' | 'skipped' | 'failed'

interface BookingWithDetails {
  id: string
  reference: string
  guest_count: number
  status: string
  user_id: string
  slot_id: string
  profiles: {
    email: string
    full_name: string
  }
  experiences: {
    id: string
    title: string
    images: string[]
    meeting_point: string
    what_to_bring: string[]
  }
  experience_slots: {
    date: string
    start_time: string
  }
}

interface ReminderResult {
  booking_id: string
  reminder_type: ReminderType
  status: 'sent' | 'skipped' | 'failed'
  error?: string
}

interface SchedulerResults {
  sent: number
  skipped: number
  failed: number
  details: ReminderResult[]
}

// ================================================
// Configuration
// ================================================

// Time windows for reminders (in milliseconds)
const REMINDER_WINDOWS = {
  '24h': {
    minMs: 23.5 * 60 * 60 * 1000, // 23.5 hours
    maxMs: 24.5 * 60 * 60 * 1000, // 24.5 hours
  },
  '2h': {
    minMs: 1.75 * 60 * 60 * 1000, // 1h 45m
    maxMs: 2.25 * 60 * 60 * 1000, // 2h 15m
  },
}

// Maximum bookings to process per run (prevent timeout)
const MAX_BOOKINGS_PER_RUN = 100

// Rate limiting delay between emails (ms)
const EMAIL_DELAY_MS = 100

// ================================================
// Helper Functions
// ================================================

/**
 * Parse experience date and time into a Date object
 * Assumes Bali timezone (Asia/Makassar, UTC+8)
 */
function parseExperienceDateTime(date: string, time: string): Date {
  // Format: "2026-01-15" and "09:00" or "9:00 AM"
  const dateStr = date
  let hours = 0
  let minutes = 0

  // Parse time - handle both 24h and 12h formats
  const time24Match = time.match(/^(\d{1,2}):(\d{2})$/)
  const time12Match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (time24Match) {
    hours = parseInt(time24Match[1] ?? '0', 10)
    minutes = parseInt(time24Match[2] ?? '0', 10)
  } else if (time12Match) {
    hours = parseInt(time12Match[1] ?? '0', 10)
    minutes = parseInt(time12Match[2] ?? '0', 10)
    const period = time12Match[3]?.toUpperCase() ?? 'AM'
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
  }

  // Create date in UTC (Bali is UTC+8)
  const isoString = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+08:00`
  return new Date(isoString)
}

/**
 * Check if a booking falls within a reminder window
 */
function isInReminderWindow(
  experienceDateTime: Date,
  now: Date,
  window: { minMs: number; maxMs: number }
): boolean {
  const msUntilExperience = experienceDateTime.getTime() - now.getTime()
  return msUntilExperience >= window.minMs && msUntilExperience <= window.maxMs
}

/**
 * Check if reminder was already sent or is pending
 */
async function getReminderStatus(
  supabase: SupabaseClient,
  bookingId: string,
  reminderType: ReminderType
): Promise<{ exists: boolean; status?: ReminderStatus }> {
  const { data, error } = await supabase
    .from('booking_reminders')
    .select('status')
    .eq('booking_id', bookingId)
    .eq('reminder_type', reminderType)
    .maybeSingle()

  if (error) {
    console.error(`Error checking reminder status: ${error.message}`)
    return { exists: false }
  }

  if (!data) {
    return { exists: false }
  }

  return { exists: true, status: data.status as ReminderStatus }
}

/**
 * Create or update reminder record
 */
async function upsertReminder(
  supabase: SupabaseClient,
  bookingId: string,
  reminderType: ReminderType,
  status: ReminderStatus,
  errorMessage?: string
): Promise<void> {
  const data: Record<string, unknown> = {
    booking_id: bookingId,
    reminder_type: reminderType,
    scheduled_for: new Date().toISOString(),
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'sent') {
    data.sent_at = new Date().toISOString()
    data.error_message = null
  } else if (status === 'failed' && errorMessage) {
    data.error_message = errorMessage
  }

  const { error } = await supabase.from('booking_reminders').upsert(data, {
    onConflict: 'booking_id,reminder_type',
  })

  if (error) {
    console.error(`Error upserting reminder: ${error.message}`)
  }
}

/**
 * Send reminder email via send-email function
 */
async function sendReminderEmail(
  booking: BookingWithDetails,
  reminderType: ReminderType
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return { success: false, error: 'Missing Supabase credentials' }
  }

  // Prepare email data
  const emailPayload = {
    type: 'booking_reminder',
    to: booking.profiles.email,
    booking_id: booking.id,
    data: {
      booking_reference: booking.reference,
      experience_name: booking.experiences.title,
      experience_date: booking.experience_slots.date,
      experience_time: booking.experience_slots.start_time,
      guest_count: booking.guest_count,
      total_amount: 0, // Not needed for reminders but required by schema
      currency: 'USD',
      traveler_name: booking.profiles.full_name || 'Traveler',
      experience_image: booking.experiences.images?.[0],
      meeting_point: booking.experiences.meeting_point,
      what_to_bring: booking.experiences.what_to_bring,
      reminder_type: reminderType,
      ticket_url: `https://pulau.app/bookings/${booking.id}/ticket`,
    },
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `Email API error (${response.status}): ${errorText}` }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Process a single reminder
 */
async function processReminder(
  supabase: SupabaseClient,
  booking: BookingWithDetails,
  reminderType: ReminderType
): Promise<ReminderResult> {
  const result: ReminderResult = {
    booking_id: booking.id,
    reminder_type: reminderType,
    status: 'failed',
  }

  try {
    // Check if already sent (AC #3: Duplicate Prevention)
    const existing = await getReminderStatus(supabase, booking.id, reminderType)

    if (existing.exists && existing.status === 'sent') {
      result.status = 'skipped'
      return result
    }

    // Check if booking is cancelled (AC #4)
    if (booking.status === 'cancelled') {
      await upsertReminder(supabase, booking.id, reminderType, 'skipped')
      result.status = 'skipped'
      return result
    }

    // Mark as pending (in case of crash)
    await upsertReminder(supabase, booking.id, reminderType, 'pending')

    // Send email
    const emailResult = await sendReminderEmail(booking, reminderType)

    if (emailResult.success) {
      await upsertReminder(supabase, booking.id, reminderType, 'sent')
      result.status = 'sent'
      console.log(`✓ Sent ${reminderType} reminder for booking ${booking.id}`)
    } else {
      await upsertReminder(supabase, booking.id, reminderType, 'failed', emailResult.error)
      result.status = 'failed'
      result.error = emailResult.error
      console.error(`✗ Failed ${reminderType} reminder for booking ${booking.id}: ${emailResult.error}`)
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await upsertReminder(supabase, booking.id, reminderType, 'failed', errorMessage)
    result.status = 'failed'
    result.error = errorMessage
    console.error(`✗ Error processing ${reminderType} reminder for booking ${booking.id}: ${errorMessage}`)
    return result
  }
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const now = new Date()

  console.log(`=== Booking Reminder Scheduler Started at ${now.toISOString()} ===`)

  const results: SchedulerResults = {
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [],
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate time windows
    const window24h = REMINDER_WINDOWS['24h']
    const window2h = REMINDER_WINDOWS['2h']

    // Calculate date range (today and tomorrow covers both windows)
    const today = now.toISOString().split('T')[0]
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Query confirmed bookings with slots in the relevant date range
    const { data: bookings, error: queryError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        reference,
        guest_count,
        status,
        user_id,
        slot_id,
        profiles!inner(email, full_name),
        experiences!inner(id, title, images, meeting_point, what_to_bring),
        experience_slots!inner(date, start_time)
      `
      )
      .eq('status', 'confirmed')
      .gte('experience_slots.date', today)
      .lte('experience_slots.date', tomorrow)
      .limit(MAX_BOOKINGS_PER_RUN)

    if (queryError) {
      throw new Error(`Query error: ${queryError.message}`)
    }

    console.log(`Found ${bookings?.length ?? 0} confirmed bookings to check`)

    // Process each booking
    for (const booking of (bookings as unknown as BookingWithDetails[]) || []) {
      // Parse experience date/time
      const experienceDateTime = parseExperienceDateTime(
        booking.experience_slots.date,
        booking.experience_slots.start_time
      )

      // Check 24h window
      if (isInReminderWindow(experienceDateTime, now, window24h)) {
        const result = await processReminder(supabase, booking, '24h')
        results.details.push(result)
        results[result.status]++

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY_MS))
      }

      // Check 2h window
      if (isInReminderWindow(experienceDateTime, now, window2h)) {
        const result = await processReminder(supabase, booking, '2h')
        results.details.push(result)
        results[result.status]++

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY_MS))
      }
    }

    const duration = Date.now() - startTime

    console.log(
      `=== Scheduler Complete: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed (${duration}ms) ===`
    )

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        duration_ms: duration,
        results: {
          sent: results.sent,
          skipped: results.skipped,
          failed: results.failed,
        },
        // Only include details if there were any reminders processed
        ...(results.details.length > 0 && results.details.length <= 20
          ? { details: results.details }
          : {}),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const duration = Date.now() - startTime

    console.error(`=== Scheduler Error: ${errorMessage} (${duration}ms) ===`)

    return new Response(
      JSON.stringify({
        success: false,
        timestamp: now.toISOString(),
        duration_ms: duration,
        error: errorMessage,
        results,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
