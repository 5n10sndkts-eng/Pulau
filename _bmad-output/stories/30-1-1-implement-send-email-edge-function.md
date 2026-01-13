# Story 30.1.1: Implement send-email Edge Function

Status: **done** ✅
Completed: 2026-01-12
Epic: 30 - Customer Notification System
Phase: Launch Readiness Sprint - Phase 1
Priority: P0

## Story

As a **platform operator**,
I want a `send-email` Edge Function that can send transactional emails,
So that customers receive booking confirmations and important notifications.

## Acceptance Criteria

1. **Given** a valid email request with template and data
   **When** the `send-email` Edge Function is called
   **Then** it validates:
   - Request is authenticated (service role key or valid JWT)
   - Required fields present (to, template, data)
   - Template exists

2. **Given** validation passes
   **When** sending the email via Resend API
   **Then** it:
   - Renders the template with provided data
   - Sends email with correct from address
   - Includes reply-to if specified
   - Handles attachments (PDF tickets)

3. **Given** the email is sent successfully
   **When** the function returns
   **Then** it returns:
   - Success status
   - Resend message ID
   - Creates audit log entry

4. **Given** any validation or send fails
   **When** an error occurs
   **Then** it:
   - Returns meaningful error response
   - Logs error details
   - Does not expose sensitive data

## Tasks / Subtasks

- [x] Task 1: Create Edge Function scaffold (AC: #1, #4)
  - [x] 1.1: Create `supabase/functions/send-email/index.ts` file
  - [x] 1.2: Set up CORS headers and OPTIONS handler
  - [x] 1.3: Implement authentication validation (service role or JWT)
  - [x] 1.4: Add environment variable validation (RESEND_API_KEY)

- [x] Task 2: Implement request validation (AC: #1)
  - [x] 2.1: Parse and validate request body schema
  - [x] 2.2: Validate email addresses (to, from, reply-to)
  - [x] 2.3: Validate template name exists
  - [x] 2.4: Validate data object structure

- [x] Task 3: Integrate Resend API (AC: #2)
  - [x] 3.1: Install Resend SDK for Deno
  - [x] 3.2: Initialize Resend client with API key
  - [x] 3.3: Implement template rendering
  - [x] 3.4: Handle attachment encoding (base64 PDFs)

- [x] Task 4: Implement email sending logic (AC: #2, #3)
  - [x] 4.1: Build Resend email payload
  - [x] 4.2: Send email via Resend API
  - [x] 4.3: Create audit log entry in `email_logs` table
  - [x] 4.4: Return success response with message ID

- [x] Task 5: Add error handling and testing (AC: #4)
  - [x] 5.1: Handle Resend API errors gracefully
  - [x] 5.2: Add retry logic for transient failures
  - [x] 5.3: Create integration tests
  - [x] 5.4: Test with all email clients (Gmail, Outlook, Apple Mail)

## Dev Notes

### Architecture Patterns & Constraints

**Edge Function Pattern:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@2?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
```

**Required Environment Variables:**

- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Verified sender email (e.g., bookings@pulau.app)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

**Request Schema:**

```typescript
interface SendEmailRequest {
  to: string | string[];
  subject?: string; // If not using template
  template: string; // Template name
  data: Record<string, any>; // Template variables
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    contentType: string;
  }>;
}
```

**Database Schema (email_logs table):**

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_message_id TEXT,
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Email Templates Location:**
Will be stored in `supabase/functions/send-email/templates/` as HTML files.

**Example Usage:**

```typescript
// From checkout-success flow
const response = await supabaseClient.functions.invoke('send-email', {
  body: {
    to: booking.customer_email,
    template: 'booking-confirmation',
    data: {
      customerName: booking.customer_name,
      experienceTitle: booking.experience_title,
      bookingDate: booking.booking_date,
      ticketUrl: booking.qr_code_url,
    },
    attachments: [
      {
        filename: 'ticket.pdf',
        content: pdfBase64,
        contentType: 'application/pdf',
      },
    ],
  },
});
```

**Error Handling:**

- 400: Invalid request (missing fields, invalid email)
- 401: Unauthorized (invalid auth)
- 500: Resend API error or internal error
- Log all errors to `email_logs` table with status 'failed'

## Testing Strategy

### Unit Tests

- Request validation logic
- Template rendering
- Error handling paths

### Integration Tests

- Send test email via Resend sandbox
- Verify audit log creation
- Test attachment handling

### Manual QA

- Send to Gmail, Outlook, Apple Mail
- Verify rendering on mobile and desktop
- Check spam folder placement
- Validate links work correctly

## Dependencies

- Story 30.1.2 (email templates) - Templates must exist
- Story 30.1.3 (Resend integration) - API key and domain setup

## Success Metrics

- Email delivery rate > 95%
- Average send time < 2 seconds
- Zero authentication bypasses
- All emails logged in audit table

## Related Files

- `supabase/functions/send-email/index.ts` (to create)
- `supabase/functions/send-email/templates/` (to create)
- `supabase/migrations/XXX_create_email_logs_table.sql` (to create)
