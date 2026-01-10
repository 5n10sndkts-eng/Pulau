# Story 24.6: Generate and Send PDF Ticket

Status: done

## Story

As a **traveler**,
I want to receive a PDF ticket immediately after booking,
So that I have proof of purchase and entry credentials.

## Acceptance Criteria

1. **Given** my booking is confirmed
   **When** confirmation processing completes
   **Then** a PDF ticket is generated containing:
     - QR code encoding booking ID
     - Experience name and date/time
     - Guest count
     - Meeting point information
     - Vendor contact info
     - Cancellation policy

2. **Given** a PDF ticket is generated
   **When** the ticket is ready
   **Then** PDF is emailed to my registered email
   **And** email delivery is logged for support reference

3. **Given** I want to access my ticket later
   **When** I view my bookings page
   **Then** PDF is stored and accessible from my bookings page
   **And** I can download the ticket at any time

4. **Given** multiple guests on a booking
   **When** the ticket is generated
   **Then** the ticket shows total guest count
   **And** a single QR code covers all guests on that booking

## Tasks / Subtasks

- [x] Task 1: Create PDF generation Edge Function (AC: #1)
  - [x] 1.1: Created `supabase/functions/generate-ticket/index.ts`
  - [x] 1.2: Using pdf-lib (Deno-compatible, pure JavaScript)
  - [x] 1.3: Designed clean ticket template with header, QR code, details sections
  - [x] 1.4: Implemented full PDF generation with booking data

- [x] Task 2: Generate QR code (AC: #1)
  - [x] 2.1: Using qrcode library (esm.sh/qrcode@1.5.3)
  - [x] 2.2: Encodes booking reference in QR code
  - [x] 2.3: Embeds QR code as base64 PNG in PDF
  - [x] 2.4: 120x120 size with high error correction level

- [x] Task 3: Populate ticket content (AC: #1)
  - [x] 3.1: Fetches booking details from bookings, trips, profiles tables
  - [x] 3.2: Fetches experience details (name, meeting point)
  - [x] 3.3: Fetches vendor contact information (name, phone, email)
  - [x] 3.4: Includes cancellation policy text
  - [x] 3.5: Formats date/time for readability

- [x] Task 4: Implement email delivery (AC: #2)
  - [x] 4.1: Configured Resend API (RESEND_API_KEY env var)
  - [x] 4.2: Created HTML email template with booking details
  - [x] 4.3: Attaches PDF ticket as base64 attachment
  - [x] 4.4: Sends to user's registered email from profiles
  - [x] 4.5: Logs email delivery status in audit_logs

- [x] Task 5: Store ticket for later access (AC: #3)
  - [x] 5.1: Created migration adding ticket_url and ticket_generated_at to bookings
  - [x] 5.2: Created 'tickets' storage bucket with RLS policies
  - [x] 5.3: Uploads PDF to Supabase Storage
  - [x] 5.4: Stores ticket path in bookings.ticket_url
  - [x] 5.5: RLS policies allow users to access their own tickets

- [x] Task 6: Integrate with booking flow (AC: #1, #2)
  - [x] 6.1: webhook-stripe calls generate-ticket after booking confirmation
  - [x] 6.2: Uses fire-and-forget pattern (doesn't block webhook response)
  - [x] 6.3: Audit log created for ticket generation events

## Dev Notes

### Architecture Patterns & Constraints

**Edge Function Pattern:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// PDF library TBD - options below
```

**PDF Generation Options (Deno-compatible):**
1. **pdf-lib** - Pure JavaScript, no native dependencies
   ```typescript
   import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'
   ```

2. **@pdf-lib/fontkit** - For custom fonts
   ```typescript
   import fontkit from 'https://cdn.skypack.dev/@pdf-lib/fontkit'
   ```

**QR Code Generation:**
```typescript
import QRCode from 'https://esm.sh/qrcode@1.5.3'

// Generate QR code as data URL
const qrDataUrl = await QRCode.toDataURL(bookingReference, {
  width: 200,
  margin: 2,
  errorCorrectionLevel: 'H',
})
```

### Ticket Template Design

```
┌──────────────────────────────────────┐
│           PULAU TICKET               │
│                                      │
│  ┌────────────┐   Experience Name    │
│  │            │   ─────────────────  │
│  │   QR CODE  │   Date: Jan 15, 2026 │
│  │            │   Time: 10:00 AM     │
│  │            │   Guests: 2          │
│  └────────────┘                      │
│                                      │
│  Booking Reference: PL-ABC12345      │
│                                      │
│  ─────────────────────────────────── │
│  MEETING POINT                       │
│  123 Beach Road, Bali                │
│                                      │
│  VENDOR CONTACT                      │
│  Bali Adventures                     │
│  +62 812 3456 7890                   │
│                                      │
│  ─────────────────────────────────── │
│  CANCELLATION POLICY                 │
│  Free cancellation up to 24 hours    │
│  before the experience starts.       │
│                                      │
└──────────────────────────────────────┘
```

### PDF Generation Implementation

```typescript
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'
import QRCode from 'https://esm.sh/qrcode@1.5.3'

async function generateTicketPdf(booking: BookingDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([400, 600]) // A6 size approximately

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Generate QR code
  const qrDataUrl = await QRCode.toDataURL(booking.reference, { width: 150 })
  const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer())
  const qrImage = await pdfDoc.embedPng(qrImageBytes)

  // Draw QR code
  page.drawImage(qrImage, { x: 50, y: 400, width: 120, height: 120 })

  // Draw text content
  page.drawText('PULAU TICKET', { x: 150, y: 560, font: boldFont, size: 20 })
  page.drawText(booking.experienceName, { x: 190, y: 480, font: boldFont, size: 14 })
  page.drawText(`Date: ${booking.date}`, { x: 190, y: 460, font, size: 12 })
  page.drawText(`Time: ${booking.time}`, { x: 190, y: 440, font, size: 12 })
  page.drawText(`Guests: ${booking.guestCount}`, { x: 190, y: 420, font, size: 12 })

  page.drawText(`Booking Reference: ${booking.reference}`, { x: 50, y: 370, font: boldFont, size: 12 })

  // Meeting point
  page.drawText('MEETING POINT', { x: 50, y: 320, font: boldFont, size: 10 })
  page.drawText(booking.meetingPoint, { x: 50, y: 305, font, size: 10 })

  // Vendor contact
  page.drawText('VENDOR', { x: 50, y: 270, font: boldFont, size: 10 })
  page.drawText(booking.vendorName, { x: 50, y: 255, font, size: 10 })
  page.drawText(booking.vendorPhone || 'Contact via app', { x: 50, y: 240, font, size: 10 })

  // Cancellation policy
  page.drawText('CANCELLATION POLICY', { x: 50, y: 200, font: boldFont, size: 10 })
  page.drawText(booking.cancellationPolicy, { x: 50, y: 185, font, size: 9 })

  return await pdfDoc.save()
}
```

### Email Delivery Options

**Option 1: Resend (Recommended for Deno):**
```typescript
import { Resend } from 'https://esm.sh/resend@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

await resend.emails.send({
  from: 'Pulau <tickets@pulau.app>',
  to: userEmail,
  subject: `Your booking is confirmed - ${experienceName}`,
  html: emailTemplate,
  attachments: [{
    filename: `ticket-${bookingReference}.pdf`,
    content: Buffer.from(pdfBytes).toString('base64'),
  }],
})
```

**Option 2: Supabase Edge Functions + External SMTP:**
```typescript
// Use fetch to call external email API
```

### Storage Pattern

```typescript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('tickets')
  .upload(`${bookingId}/ticket.pdf`, pdfBytes, {
    contentType: 'application/pdf',
    upsert: true,
  })

// Store URL in bookings table
await supabase
  .from('bookings')
  .update({ ticket_url: `tickets/${bookingId}/ticket.pdf` })
  .eq('id', bookingId)

// Generate signed URL for download (expires in 1 hour)
const { data: { signedUrl } } = await supabase.storage
  .from('tickets')
  .createSignedUrl(`${bookingId}/ticket.pdf`, 3600)
```

### Previous Story Intelligence

**From Story 24.5 (create-booking):**
- Booking reference format: `PL-XXXXXXXX`
- Booking includes: experienceId, guestCount, date, time
- Called after payment confirmation

**From Story 24.4 (webhook-stripe):**
- Webhook triggers ticket generation after booking confirmed
- Should be async to not block webhook response

### Database Schema Update

```sql
-- Add ticket_url column to bookings if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticket_generated_at TIMESTAMPTZ;
```

### Environment Variables Required

```env
RESEND_API_KEY=re_xxxx           # Email service API key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### File Structure Requirements

```
supabase/functions/
  generate-ticket/
    index.ts              # Edge Function entry point (this story)

supabase/storage/
  tickets/                # Storage bucket for PDF tickets
```

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 24.6]
- [Source: _bmad-output/stories/24-5-create-booking-confirmation-edge-function.md - Booking data]
- [Source: pdf-lib documentation - https://pdf-lib.js.org/]
- [Source: Resend documentation - https://resend.com/docs]

### Testing Requirements

**Test Scenarios:**
1. ✅ Generate PDF with valid booking → PDF contains all required info
2. ✅ QR code scans correctly → Returns booking reference
3. ✅ Email sent successfully → Delivery logged in audit
4. ✅ PDF stored in bucket → Accessible via signed URL
5. ✅ Multiple guests → Single ticket with correct count

### Security Considerations

- Signed URLs for ticket downloads (expire after 1 hour)
- RLS policy on tickets bucket (user can only access their tickets)
- No PII in QR code (only booking reference)
- Email logs should not contain full email content

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- Used pdf-lib for pure JavaScript PDF generation (Deno-compatible)
- Used qrcode library for QR code generation
- Integrated with Resend API for email delivery

### Completion Notes List
1. Created generate-ticket Edge Function with full PDF generation
2. QR code contains booking reference (PL-XXXXXXXX format)
3. PDF includes: experience name, date/time, guests, meeting point, vendor, cancellation policy
4. HTML email template with booking confirmation details
5. PDF attached to email as base64
6. Storage in 'tickets' bucket with RLS policies
7. Async integration with webhook-stripe (fire-and-forget pattern)
8. Comprehensive audit logging for ticket generation

### Code Review Fixes (Post-Implementation)
1. **FIX**: Added multi-item trip support
   - Original: Used `.limit(1).single()` which only fetched first trip item
   - Fixed: Now fetches ALL trip items and generates one PDF page per experience
   - Added TripItemDetails interface for proper item typing
   - Added page numbers for multi-page tickets (Page 1/3 format)
   - Legacy single-item fields preserved for backwards compatibility

### File List
- `supabase/functions/generate-ticket/index.ts` - PDF generation Edge Function (FIXED in code review)
- `supabase/migrations/*_add_ticket_columns_to_bookings.sql` - Database migration
- `supabase/migrations/*_create_tickets_storage_bucket.sql` - Storage bucket creation
- `supabase/functions/webhook-stripe/index.ts` - Updated with ticket generation trigger

