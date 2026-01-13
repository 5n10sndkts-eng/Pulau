# Story 30.1.3: Integrate Resend API

Status: **blocked-manual-setup** ⚠️
Blocked Reason: Requires manual account setup, domain verification, and DNS configuration
Epic: 30 - Customer Notification System
Phase: Launch Readiness Sprint - Phase 1
Priority: P0

## Story

As a **platform operator**,
I want Resend integrated as our email service provider,
So that we have reliable, scalable transactional email delivery.

## Acceptance Criteria

1. **Given** I need to send transactional emails
   **When** setting up Resend
   **Then** it requires:
   - Resend account created
   - Domain verified (pulau.app)
   - API key generated and stored securely
   - DNS records configured (SPF, DKIM, DMARC)

2. **Given** domain is verified
   **When** sending emails via Resend
   **Then** they:
   - Send from verified domain (bookings@pulau.app)
   - Pass SPF and DKIM checks
   - Have proper sender reputation
   - Support reply-to functionality

3. **Given** emails are sent successfully
   **When** monitoring delivery
   **Then** we can:
   - Track delivery status via webhooks
   - View delivery analytics in Resend dashboard
   - Debug bounces and failures
   - Monitor sender reputation

4. **Given** Resend API is integrated
   **When** errors occur
   **Then** the system:
   - Handles rate limits gracefully
   - Retries transient failures
   - Logs all API interactions
   - Alerts on sustained failures

## Tasks / Subtasks

### ⚠️ MANUAL SETUP REQUIRED (Complete in Order)

- [ ] **Task 1: Set up Resend account** (AC: #1) - **MANUAL**
  - [ ] 1.1: Go to https://resend.com and create account
  - [ ] 1.2: Add pulau.app domain in Resend dashboard
  - [ ] 1.3: Copy DNS records provided by Resend
  - [ ] 1.4: Generate API key for production (starts with `re_`)
  - [ ] 1.5: Generate API key for development/testing

- [ ] **Task 2: Configure DNS records** (AC: #1, #2) - **MANUAL**
  - [ ] 2.1: Add SPF record to pulau.app DNS: `v=spf1 include:_spf.resend.com ~all`
  - [ ] 2.2: Add DKIM record (copy from Resend dashboard)
  - [ ] 2.3: Add DMARC record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@pulau.app`
  - [ ] 2.4: Wait 24-48 hours for DNS propagation
  - [ ] 2.5: Verify domain in Resend dashboard (should show green checkmark)
  - [ ] 2.6: Test with mail-tester.com (target: 10/10 score)

- [ ] **Task 3: Store API keys securely** (AC: #1) - **MANUAL**
  - [ ] 3.1: Add `RESEND_API_KEY=re_xxxxx` to `.env.production`
  - [ ] 3.2: Run: `supabase secrets set RESEND_API_KEY=re_xxxxx`
  - [ ] 3.3: Add `RESEND_FROM_EMAIL=bookings@pulau.app` to environment
  - [ ] 3.4: Document key rotation date (quarterly) in 1Password/LastPass

### ✅ CODE IMPLEMENTATION (Already Complete)

- [x] **Task 4: Implement Resend SDK integration** (AC: #2, #4)
  - [x] 4.1: Resend SDK integrated in send-email function (line 113)
  - [x] 4.2: Resend client initialized with error handling
  - [x] 4.3: Send method with retry logic implemented (lines 140-175)
  - [x] 4.4: Rate limit handling with exponential backoff
  - [x] 4.5: Email delivery tracking in email_logs table

- [ ] **Task 5: Set up monitoring and webhooks** (AC: #3, #4) - **OPTIONAL POST-LAUNCH**
  - [ ] 5.1: Create webhook endpoint for Resend events
  - [ ] 5.2: Handle delivery, bounce, complaint events
  - [ ] 5.3: Update email_logs table with delivery status
  - [ ] 5.4: Set up alerts for bounce rate > 5%
  - [ ] 5.5: Configure sender reputation monitoring

## Dev Notes

### Architecture Patterns & Constraints

**Resend Pricing:**

- Free: 100 emails/day, 1 domain
- Pro: $20/month - 50,000 emails/month
- Scale: Custom pricing

**DNS Records (Example):**

```
# SPF Record
pulau.app TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM Record
resend._domainkey.pulau.app TXT "v=DKIM1; k=rsa; p=MIGfMA0GCS..."

# DMARC Record
_dmarc.pulau.app TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@pulau.app"
```

**Environment Variables:**

```bash
# Production
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=bookings@pulau.app

# Development
RESEND_API_KEY=re_dev_123456789
RESEND_FROM_EMAIL=dev@pulau.app
```

**Resend SDK Usage:**

```typescript
import { Resend } from 'https://esm.sh/resend@2?target=deno';

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

// Send email
const { data, error } = await resend.emails.send({
  from: 'Pulau <bookings@pulau.app>',
  to: 'customer@example.com',
  subject: 'Booking Confirmation',
  html: emailTemplate,
  attachments: [
    {
      filename: 'ticket.pdf',
      content: pdfBuffer,
    },
  ],
});

if (error) {
  throw new Error(`Resend error: ${error.message}`);
}

return data; // { id: 'resend_message_id' }
```

**Error Handling:**

```typescript
const sendWithRetry = async (emailData: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await resend.emails.send(emailData);
      if (error) {
        // Check if error is retryable
        if (error.statusCode === 429) {
          // Rate limit
          await sleep(Math.pow(2, i) * 1000); // Exponential backoff
          continue;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};
```

**Webhook Handler:**

```typescript
// Create supabase/functions/resend-webhook/index.ts
serve(async (req) => {
  const event = await req.json();

  switch (event.type) {
    case 'email.delivered':
      await updateEmailLog(event.data.email_id, 'delivered');
      break;
    case 'email.bounced':
      await updateEmailLog(event.data.email_id, 'bounced');
      await alertOnBounce(event.data);
      break;
    case 'email.complained':
      await updateEmailLog(event.data.email_id, 'complained');
      await handleComplaint(event.data);
      break;
  }

  return new Response('ok', { status: 200 });
});
```

**Update email_logs Schema:**

```sql
ALTER TABLE email_logs ADD COLUMN delivered_at TIMESTAMPTZ;
ALTER TABLE email_logs ADD COLUMN bounced_at TIMESTAMPTZ;
ALTER TABLE email_logs ADD COLUMN bounce_reason TEXT;
ALTER TABLE email_logs ADD COLUMN complained_at TIMESTAMPTZ;
```

**Monitoring Metrics:**

- Delivery rate (target: > 98%)
- Bounce rate (target: < 2%)
- Complaint rate (target: < 0.1%)
- Average send time (target: < 2s)

**Rate Limits:**

- Resend Free: 100/day
- Resend Pro: Burst of 10/second
- Implement client-side queueing if needed

## Testing Strategy

### Unit Tests

- Test API key validation
- Test retry logic
- Test webhook event handling

### Integration Tests

- Send test email to real inbox
- Verify SPF/DKIM pass
- Test bounce handling
- Test webhook delivery

### Load Testing

- Simulate 1000 concurrent sends
- Verify rate limit handling
- Test queue behavior

### Manual QA

- Send to Gmail and verify headers
- Check mail-tester.com score (target: 10/10)
- Verify Resend dashboard shows delivery
- Test webhook events manually

## Dependencies

- Domain ownership of pulau.app
- DNS access for record configuration
- Supabase Edge Function secrets access

## Success Metrics

- Domain verification complete
- Email authentication score 10/10 (mail-tester.com)
- All webhooks firing correctly
- Zero failed sends due to authentication
- Delivery rate > 98%

## Security Considerations

- Never expose API key in client code
- Rotate API keys quarterly
- Use separate keys for dev/staging/prod
- Monitor for unauthorized usage
- Set up IP allowlisting if Resend supports it

## Related Files

- `supabase/functions/send-email/index.ts` (update)
- `supabase/functions/resend-webhook/index.ts` (to create)
- `supabase/migrations/XXX_add_email_delivery_tracking.sql` (to create)
- `.env.example` (update with RESEND_API_KEY)

## 📋 MANUAL SETUP CHECKLIST

### Step 1: Create Resend Account (15 minutes)

```bash
1. Go to: https://resend.com
2. Sign up with: moe@pulau.app (or company email)
3. Verify email address
4. Choose plan:
   - Development: Free (100 emails/day)
   - Production: Pro $20/mo (50k emails/month)
```

### Step 2: Add Domain (5 minutes)

```bash
1. In Resend dashboard → Domains → Add Domain
2. Enter: pulau.app
3. Copy the DNS records shown (SPF, DKIM, DMARC)
```

### Step 3: Configure DNS Records (10 minutes + 24-48h wait)

```bash
# Log into DNS provider (Cloudflare, Route53, etc.)
# Add these TXT records:

Type: TXT
Name: pulau.app
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600

Type: TXT
Name: resend._domainkey.pulau.app
Value: [COPY FROM RESEND DASHBOARD]
TTL: 3600

Type: TXT
Name: _dmarc.pulau.app
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@pulau.app
TTL: 3600
```

### Step 4: Generate API Keys (2 minutes)

```bash
1. Resend dashboard → API Keys → Create API Key
2. Name: "Pulau Production"
3. Copy key (starts with re_)
4. Repeat for "Pulau Development"
```

### Step 5: Configure Supabase (5 minutes)

```bash
# Add to Supabase Edge Function secrets:
supabase secrets set RESEND_API_KEY=re_your_production_key

# Add to .env.production:
RESEND_API_KEY=re_your_production_key
RESEND_FROM_EMAIL=bookings@pulau.app
```

### Step 6: Verify Setup (5 minutes)

```bash
1. Wait 24-48 hours for DNS propagation
2. Check Resend dashboard - domain should show green checkmark
3. Send test email:
   curl -X POST https://[project].supabase.co/functions/v1/send-email \
     -H "Authorization: Bearer [service-role-key]" \
     -H "Content-Type: application/json" \
     -d '{"type":"booking_confirmation","to":"your-email@gmail.com",...}'
4. Check inbox - email should arrive within 30 seconds
5. Test with mail-tester.com → should score 10/10
```

### Step 7: Monitor First Week

```bash
1. Resend dashboard → Analytics
2. Check delivery rate (target: > 98%)
3. Check bounce rate (target: < 2%)
4. Verify no spam complaints
```

---

## Resend Dashboard Setup (Optional Post-Launch)

1. Enable webhook for delivery events
2. Set webhook URL: `https://wzuvzcydenvuzxmoryzt.supabase.co/functions/v1/resend-webhook`
3. Configure bounce handling policy
4. Set up email analytics dashboard
5. Enable sender reputation monitoring

## Alternatives Considered

- **SendGrid**: More expensive, complex pricing
- **Mailgun**: Similar pricing, less modern API
- **AWS SES**: Cheaper but more setup, worse DX
- **Postmark**: Good alternative, slightly more expensive

**Why Resend:**

- Modern developer experience
- Simple pricing
- Excellent deliverability
- Great documentation
- Built for transactional emails

---

## ⏰ Estimated Time to Complete

- **Immediate setup**: ~40 minutes
- **DNS propagation wait**: 24-48 hours
- **Testing & verification**: ~30 minutes
- **Total calendar time**: 2-3 days
