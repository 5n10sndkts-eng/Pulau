// ================================================
// Edge Function: generate-ticket
// Story: 24.6 - Generate and Send PDF Ticket
// Phase: 2a - Core Transactional
// ================================================
// Generates a PDF ticket for a confirmed booking and emails
// it to the user. Also stores the ticket in Supabase Storage
// for later access.
// ================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  PDFDocument,
  rgb,
  StandardFonts,
} from 'https://cdn.skypack.dev/pdf-lib@1.17.1';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// ================================================
// Types
// ================================================

interface GenerateTicketRequest {
  bookingId: string;
}

interface TripItemDetails {
  experienceName: string;
  date: string;
  time: string;
  guestCount: number;
  meetingPointName: string | null;
  meetingPointAddress: string | null;
  meetingPointInstructions: string | null;
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
  cancellationPolicy: string | null;
}

interface BookingDetails {
  id: string;
  reference: string;
  tripId: string;
  userEmail: string;
  userName: string | null;
  items: TripItemDetails[]; // Support multiple trip items
  // Legacy single-item fields for backwards compatibility in PDF generation
  experienceName: string;
  date: string;
  time: string;
  guestCount: number;
  meetingPointName: string | null;
  meetingPointAddress: string | null;
  meetingPointInstructions: string | null;
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
  cancellationPolicy: string | null;
}

// ================================================
// Main Handler
// ================================================

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // ================================================
    // Step 1: Parse Request
    // ================================================
    let body: GenerateTicketRequest;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid request body', 400);
    }

    const { bookingId } = body;
    if (!bookingId) {
      return errorResponse('bookingId is required', 400);
    }

    // ================================================
    // Step 2: Fetch Booking Details (AC #1)
    // ================================================
    const bookingDetails = await fetchBookingDetails(supabase, bookingId);
    if (!bookingDetails) {
      return errorResponse('Booking not found', 404);
    }

    // ================================================
    // Step 3: Generate PDF Ticket (AC #1)
    // ================================================
    console.log(`Generating ticket for booking ${bookingDetails.reference}`);
    const pdfBytes = await generateTicketPdf(bookingDetails);

    // ================================================
    // Step 4: Upload to Storage (AC #3)
    // ================================================
    const ticketPath = `${bookingId}/ticket.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(ticketPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload ticket:', uploadError);
      // Continue even if upload fails - email is more important
    }

    // Update booking with ticket URL
    await supabase
      .from('bookings')
      .update({
        ticket_url: ticketPath,
        ticket_generated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    // ================================================
    // Step 5: Send Email with Ticket (AC #2)
    // ================================================
    let emailSent = false;
    if (resendApiKey && bookingDetails.userEmail) {
      try {
        emailSent = await sendTicketEmail(
          resendApiKey,
          bookingDetails,
          pdfBytes,
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Log but don't fail - ticket is still generated
      }
    } else {
      console.log(
        'Email not sent: RESEND_API_KEY not configured or no user email',
      );
    }

    // ================================================
    // Step 6: Create Audit Log (AC #2)
    // ================================================
    await supabase.from('audit_logs').insert({
      event_type: 'ticket.generated',
      entity_type: 'booking',
      entity_id: bookingId,
      actor_type: 'system',
      metadata: {
        reference: bookingDetails.reference,
        ticket_path: ticketPath,
        email_sent: emailSent,
        email_address: bookingDetails.userEmail,
        experience_name: bookingDetails.experienceName,
      },
    });

    console.log(
      `Ticket generated for booking ${bookingDetails.reference}, email_sent=${emailSent}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        ticketPath,
        emailSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('generate-ticket error:', error);
    return errorResponse('Internal server error', 500);
  }
});

// ================================================
// Helper Functions
// ================================================

async function fetchBookingDetails(
  supabase: ReturnType<typeof createClient>,
  bookingId: string,
): Promise<BookingDetails | null> {
  // First get the booking and trip
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      `
      id,
      reference,
      trip_id,
      trips!inner (
        id,
        user_id,
        profiles:user_id (
          email,
          full_name,
          first_name
        )
      )
    `,
    )
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    console.error('Booking fetch error:', bookingError?.message);
    return null;
  }

  // Get ALL trip items with experience details (support multi-item trips)
  const { data: tripItems, error: itemsError } = await supabase
    .from('trip_items')
    .select(
      `
      id,
      guests,
      date,
      time,
      experiences!inner (
        id,
        title,
        meeting_point_name,
        meeting_point_address,
        meeting_point_instructions,
        cancellation_policy,
        vendors!inner (
          business_name,
          phone,
          business_email
        )
      )
    `,
    )
    .eq('trip_id', booking.trip_id)
    .order('date', { ascending: true });

  if (itemsError || !tripItems || tripItems.length === 0) {
    console.error('Trip items fetch error:', itemsError?.message);
    return null;
  }

  const trip = booking.trips as {
    id: string;
    user_id: string;
    profiles: {
      email: string;
      full_name: string | null;
      first_name: string | null;
    };
  };

  // Map all trip items to TripItemDetails
  const items: TripItemDetails[] = tripItems.map((item) => {
    const experience = item.experiences as {
      id: string;
      title: string;
      meeting_point_name: string | null;
      meeting_point_address: string | null;
      meeting_point_instructions: string | null;
      cancellation_policy: string | null;
      vendors: {
        business_name: string;
        phone: string | null;
        business_email: string | null;
      };
    };
    return {
      experienceName: experience.title,
      date: item.date || 'TBD',
      time: item.time || 'TBD',
      guestCount: item.guests || 1,
      meetingPointName: experience.meeting_point_name,
      meetingPointAddress: experience.meeting_point_address,
      meetingPointInstructions: experience.meeting_point_instructions,
      vendorName: experience.vendors.business_name,
      vendorPhone: experience.vendors.phone,
      vendorEmail: experience.vendors.business_email,
      cancellationPolicy:
        experience.cancellation_policy ||
        'Contact vendor for cancellation policy',
    };
  });

  // Use first item for legacy single-item fields (backwards compatibility)
  const firstItem = items[0];

  return {
    id: booking.id,
    reference: booking.reference,
    tripId: booking.trip_id,
    userEmail: trip.profiles.email,
    userName: trip.profiles.full_name || trip.profiles.first_name,
    items,
    // Legacy fields from first item
    experienceName: firstItem.experienceName,
    date: firstItem.date,
    time: firstItem.time,
    guestCount: firstItem.guestCount,
    meetingPointName: firstItem.meetingPointName,
    meetingPointAddress: firstItem.meetingPointAddress,
    meetingPointInstructions: firstItem.meetingPointInstructions,
    vendorName: firstItem.vendorName,
    vendorPhone: firstItem.vendorPhone,
    vendorEmail: firstItem.vendorEmail,
    cancellationPolicy: firstItem.cancellationPolicy,
  };
}

async function generateTicketPdf(booking: BookingDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // For multi-item trips, we generate a page per experience
  // Currently uses first item for backwards compatibility
  // TODO: Future enhancement - generate multiple pages for multi-item trips
  const itemsToRender =
    booking.items.length > 1 ? booking.items : [booking.items[0]];

  for (let itemIndex = 0; itemIndex < itemsToRender.length; itemIndex++) {
    const item = itemsToRender[itemIndex];
    await generateTicketPage(
      pdfDoc,
      booking,
      item,
      itemIndex + 1,
      itemsToRender.length,
    );
  }

  return await pdfDoc.save();
}

async function generateTicketPage(
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>,
  booking: BookingDetails,
  item: TripItemDetails,
  pageNum: number,
  totalPages: number,
): Promise<void> {
  const page = pdfDoc.addPage([400, 600]); // A6-ish size

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  // Colors
  const primaryColor = rgb(0.2, 0.4, 0.6); // Blue
  const textColor = rgb(0.1, 0.1, 0.1);
  const lightGray = rgb(0.6, 0.6, 0.6);

  // ================================================
  // Header - PULAU TICKET
  // ================================================
  page.drawText('PULAU', {
    x: margin,
    y: y,
    font: boldFont,
    size: 28,
    color: primaryColor,
  });
  y -= 20;
  page.drawText('E-TICKET', {
    x: margin,
    y: y,
    font: font,
    size: 12,
    color: lightGray,
  });
  y -= 40;

  // ================================================
  // QR Code (AC #1)
  // ================================================
  try {
    const qrDataUrl = await QRCode.toDataURL(booking.reference, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    // Convert data URL to bytes
    const qrBase64 = qrDataUrl.split(',')[1];
    const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: margin,
      y: y - 120,
      width: 120,
      height: 120,
    });
  } catch (qrError) {
    console.error('QR code generation failed:', qrError);
    // Draw placeholder text if QR fails
    page.drawText('QR Code', {
      x: margin + 35,
      y: y - 60,
      font: font,
      size: 10,
      color: lightGray,
    });
  }

  // ================================================
  // Experience Details (right of QR)
  // ================================================
  const detailsX = margin + 140;

  page.drawText(truncateText(item.experienceName, 25), {
    x: detailsX,
    y: y,
    font: boldFont,
    size: 14,
    color: textColor,
  });
  y -= 25;

  // Date and Time
  const formattedDate = formatDate(item.date);
  page.drawText(`Date: ${formattedDate}`, {
    x: detailsX,
    y: y,
    font: font,
    size: 11,
    color: textColor,
  });
  y -= 18;

  page.drawText(`Time: ${formatTime(item.time)}`, {
    x: detailsX,
    y: y,
    font: font,
    size: 11,
    color: textColor,
  });
  y -= 18;

  // Guest count (AC #4)
  page.drawText(`Guests: ${item.guestCount}`, {
    x: detailsX,
    y: y,
    font: font,
    size: 11,
    color: textColor,
  });

  y -= 80; // Move below QR code area

  // ================================================
  // Booking Reference
  // ================================================
  page.drawText('BOOKING REFERENCE', {
    x: margin,
    y: y,
    font: boldFont,
    size: 9,
    color: lightGray,
  });
  y -= 15;
  page.drawText(booking.reference, {
    x: margin,
    y: y,
    font: boldFont,
    size: 16,
    color: primaryColor,
  });
  y -= 30;

  // Divider line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 0.5,
    color: lightGray,
  });
  y -= 20;

  // ================================================
  // Meeting Point (AC #1)
  // ================================================
  page.drawText('MEETING POINT', {
    x: margin,
    y: y,
    font: boldFont,
    size: 9,
    color: lightGray,
  });
  y -= 15;

  const meetingPoint =
    item.meetingPointName || item.meetingPointAddress || 'To be confirmed';
  page.drawText(truncateText(meetingPoint, 50), {
    x: margin,
    y: y,
    font: font,
    size: 10,
    color: textColor,
  });
  y -= 14;

  if (item.meetingPointAddress && item.meetingPointName) {
    page.drawText(truncateText(item.meetingPointAddress, 50), {
      x: margin,
      y: y,
      font: font,
      size: 9,
      color: lightGray,
    });
    y -= 14;
  }

  if (item.meetingPointInstructions) {
    page.drawText(truncateText(item.meetingPointInstructions, 55), {
      x: margin,
      y: y,
      font: font,
      size: 9,
      color: textColor,
    });
    y -= 14;
  }

  y -= 10;

  // ================================================
  // Vendor Contact (AC #1)
  // ================================================
  page.drawText('VENDOR', {
    x: margin,
    y: y,
    font: boldFont,
    size: 9,
    color: lightGray,
  });
  y -= 15;

  page.drawText(truncateText(item.vendorName, 40), {
    x: margin,
    y: y,
    font: font,
    size: 10,
    color: textColor,
  });
  y -= 14;

  if (item.vendorPhone) {
    page.drawText(item.vendorPhone, {
      x: margin,
      y: y,
      font: font,
      size: 9,
      color: lightGray,
    });
    y -= 14;
  }

  y -= 10;

  // Divider line
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 0.5,
    color: lightGray,
  });
  y -= 20;

  // ================================================
  // Cancellation Policy (AC #1)
  // ================================================
  page.drawText('CANCELLATION POLICY', {
    x: margin,
    y: y,
    font: boldFont,
    size: 9,
    color: lightGray,
  });
  y -= 15;

  // Word wrap cancellation policy
  const policyLines = wrapText(item.cancellationPolicy || 'Contact vendor', 55);
  for (const line of policyLines.slice(0, 3)) {
    page.drawText(line, {
      x: margin,
      y: y,
      font: font,
      size: 9,
      color: textColor,
    });
    y -= 12;
  }

  // ================================================
  // Footer
  // ================================================
  page.drawText('Generated by Pulau', {
    x: margin,
    y: 30,
    font: font,
    size: 8,
    color: lightGray,
  });

  // Show page number if multi-page ticket
  const footerRight =
    totalPages > 1
      ? `Page ${pageNum}/${totalPages} • ${new Date().toISOString().split('T')[0]}`
      : new Date().toISOString().split('T')[0];

  page.drawText(footerRight, {
    x: width - margin - (totalPages > 1 ? 100 : 60),
    y: 30,
    font: font,
    size: 8,
    color: lightGray,
  });
}

async function sendTicketEmail(
  apiKey: string,
  booking: BookingDetails,
  pdfBytes: Uint8Array,
): Promise<boolean> {
  const formattedDate = formatDate(booking.date);
  const formattedTime = formatTime(booking.time);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .booking-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
    .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .value { font-size: 16px; font-weight: 600; color: #1f2937; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .cta { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${booking.userName || 'there'},</p>
      <p>Great news! Your booking for <strong>${booking.experienceName}</strong> has been confirmed.</p>

      <div class="booking-box">
        <div class="label">Booking Reference</div>
        <div class="value" style="color: #2563eb; font-size: 20px;">${booking.reference}</div>
      </div>

      <div class="booking-box">
        <div class="label">When</div>
        <div class="value">${formattedDate} at ${formattedTime}</div>
        <div style="margin-top: 10px;">
          <div class="label">Guests</div>
          <div class="value">${booking.guestCount}</div>
        </div>
      </div>

      <div class="booking-box">
        <div class="label">Meeting Point</div>
        <div class="value">${booking.meetingPointName || booking.meetingPointAddress || 'To be confirmed'}</div>
        ${booking.meetingPointAddress && booking.meetingPointName ? `<div style="color: #6b7280;">${booking.meetingPointAddress}</div>` : ''}
      </div>

      <div class="booking-box">
        <div class="label">Vendor</div>
        <div class="value">${booking.vendorName}</div>
        ${booking.vendorPhone ? `<div style="color: #6b7280;">${booking.vendorPhone}</div>` : ''}
      </div>

      <p style="margin-top: 20px;"><strong>Your e-ticket is attached to this email.</strong> Please show it (printed or on your phone) when you arrive.</p>

    </div>
    <div class="footer">
      <p>Thank you for booking with Pulau!</p>
      <p>If you have any questions, please contact us at support@pulau.travel</p>
    </div>
  </div>
</body>
</html>
  `;

  // Convert PDF bytes to base64 for attachment
  const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Pulau <tickets@pulau.travel>',
      to: booking.userEmail,
      subject: `Your booking is confirmed - ${booking.experienceName}`,
      html: emailHtml,
      attachments: [
        {
          filename: `ticket-${booking.reference}.pdf`,
          content: pdfBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error:', response.status, errorText);
    return false;
  }

  return true;
}

// ================================================
// Utility Functions
// ================================================

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'TBD') return 'TBD';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr || timeStr === 'TBD') return 'TBD';
  try {
    // Handle HH:MM format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + '...'
    : text;
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}
