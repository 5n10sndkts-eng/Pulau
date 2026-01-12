# Email Testing Setup Guide

This guide covers the setup required to run E2E email delivery tests.

## Prerequisites

- Mailosaur account (for E2E email testing)
- Supabase project with email_logs table
- Resend account (for production email sending)
- Local development environment

## 1. Mailosaur Setup

Mailosaur is an email testing service that provides unique email addresses for automated testing.

### Create Account

1. Go to https://mailosaur.com/
2. Sign up for a free account (provides 10,000 test emails/month)
3. Create a new server in the Mailosaur dashboard
4. Note your API key and Server ID

### Environment Variables

Add to your `.env.local` file:

```bash
# Mailosaur for E2E email testing
MAILOSAUR_API_KEY=your_api_key_here
MAILOSAUR_SERVER_ID=your_server_id_here
```

### Test Email Addresses

Mailosaur provides unlimited email addresses in the format:

```
{anything}@{server-id}.mailosaur.net
```

For example, if your server ID is `abc123`, you can use:
- `test@abc123.mailosaur.net`
- `john.doe@abc123.mailosaur.net`
- `test-12345@abc123.mailosaur.net`

All emails sent to these addresses will be captured by Mailosaur and accessible via API.

## 2. Resend Setup (Production)

Resend is used for actual email delivery in staging/production.

### Domain Configuration

1. **Add Domain** in Resend dashboard
   - Go to https://resend.com/domains
   - Add `pulau.app` domain
   
2. **DNS Records** - Add these to your DNS provider:
   
   **SPF Record:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   ```
   
   **DKIM Record:**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [provided by Resend]
   ```
   
   **DMARC Record:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@pulau.app
   ```

3. **Verify Domain**
   - Wait for DNS propagation (5-30 minutes)
   - Click "Verify" in Resend dashboard

4. **API Key**
   - Generate API key in Resend dashboard
   - Store in environment variables

### Environment Variables

```bash
# Resend for production email delivery
RESEND_API_KEY=re_your_api_key_here
```

## 3. Supabase Edge Function Environment

Your send-email edge function needs access to Resend API key.

### Set Supabase Secrets

```bash
# Set Resend API key in Supabase
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Verify secret is set
supabase secrets list
```

### Function Environment Variables

The edge function automatically picks up secrets as environment variables:

```typescript
const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
```

## 4. Development vs Staging vs Production

### Development (Local)

Use Mailosaur for all emails:

```bash
NODE_ENV=development
MAILOSAUR_API_KEY=your_key
MAILOSAUR_SERVER_ID=your_server_id
```

All emails sent locally will go to Mailosaur, not real inboxes.

### Staging

Mix of Mailosaur (for tests) and real emails (for manual testing):

```bash
NODE_ENV=staging
RESEND_API_KEY=re_staging_key
MAILOSAUR_API_KEY=your_key
MAILOSAUR_SERVER_ID=your_server_id
```

### Production

Use Resend for all real emails:

```bash
NODE_ENV=production
RESEND_API_KEY=re_production_key
```

## 5. Running Email Tests

### E2E Email Delivery Tests

```bash
# Run all email tests
npm run test:e2e -- email-delivery.spec.ts

# Run specific test
npm run test:e2e -- email-delivery.spec.ts -g "sends booking confirmation"

# Run with UI
npm run test:e2e:ui -- email-delivery.spec.ts
```

### Email Rendering Tests

```bash
npm run test:e2e -- email-rendering.spec.ts
```

### Email Monitoring Tests

```bash
# Requires Supabase service role key
SUPABASE_SERVICE_ROLE_KEY=your_key npm run test:e2e -- email-monitoring.spec.ts
```

## 6. Email Rendering Tools (Optional)

For comprehensive cross-client rendering tests:

### Email on Acid

1. Sign up at https://www.emailonacid.com/
2. Get API key
3. Set environment variable:

```bash
EMAIL_ON_ACID_API_KEY=your_key
```

### Litmus

Alternative to Email on Acid:

1. Sign up at https://www.litmus.com/
2. Get API credentials
3. Configure in tests

## 7. Mail-Tester.com Validation

Test spam score before production launch:

1. Go to https://www.mail-tester.com/
2. Get unique test email address
3. Send email from your system
4. Check score (target: 10/10)

Example flow:

```typescript
// Send test email to mail-tester
const testEmail = 'test-abc123@mail-tester.com'; // Get from site

// Trigger email send
await sendBookingConfirmation(testEmail, bookingData);

// Go to mail-tester.com and check score
// Fix any issues (SPF, DKIM, content, etc.)
```

## 8. Monitoring Dashboard (Production)

Track email metrics in production:

### Metrics to Monitor

- **Delivery Rate**: % of emails successfully delivered (target: > 95%)
- **Bounce Rate**: % of emails bounced (target: < 2%)
- **Complaint Rate**: % of emails marked as spam (target: < 0.1%)
- **Average Delivery Time**: Time from send to delivery (target: < 30s)

### Setup Resend Webhooks

1. In Resend dashboard, go to Webhooks
2. Add webhook endpoint: `https://your-project.supabase.co/functions/v1/resend-webhook`
3. Select events:
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.opened` (optional)
   - `email.clicked` (optional)

### Webhook Handler (Edge Function)

Create `supabase/functions/resend-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const event = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Update email_logs based on event type
  switch (event.type) {
    case 'email.delivered':
      await supabase
        .from('email_logs')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('resend_message_id', event.data.message_id);
      break;
      
    case 'email.bounced':
      await supabase
        .from('email_logs')
        .update({
          bounced_at: new Date().toISOString(),
          error_message: event.data.reason,
        })
        .eq('resend_message_id', event.data.message_id);
      break;
      
    // Handle other event types...
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 9. Troubleshooting

### Emails Not Arriving in Mailosaur

1. Check API key and server ID are correct
2. Verify email address format: `{anything}@{server-id}.mailosaur.net`
3. Check Mailosaur dashboard for delivery
4. Increase timeout in tests (up to 60s)

### Emails Going to Spam

1. Verify SPF, DKIM, DMARC records
2. Test with mail-tester.com
3. Check email content for spam triggers
4. Ensure proper text-to-image ratio
5. Use authenticated sender domain

### Slow Email Delivery

1. Check Resend API status
2. Review email_logs for retry attempts
3. Monitor average delivery time
4. Consider dedicated IP (for high volume)

### High Bounce Rate

1. Validate email addresses before sending
2. Remove bounced emails from list
3. Check for typos in email addresses
4. Verify DNS records are correct

## 10. Production Checklist

Before launching email system to production:

- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Domain verified in Resend
- [ ] Mail-tester.com score 10/10
- [ ] All E2E tests passing
- [ ] Email rendering validated across clients
- [ ] Resend webhooks configured
- [ ] Monitoring dashboard set up
- [ ] Alert thresholds configured
- [ ] Support email monitored (support@pulau.app)
- [ ] Unsubscribe mechanism implemented (if needed)
- [ ] Physical address in footer (CAN-SPAM)
- [ ] Backup email provider configured (failover)
- [ ] Email rate limits configured
- [ ] Retry logic tested
- [ ] Error handling validated

## 11. Environment Variables Summary

Complete list of environment variables needed:

```bash
# Development
NODE_ENV=development
MAILOSAUR_API_KEY=your_mailosaur_api_key
MAILOSAUR_SERVER_ID=your_mailosaur_server_id

# Staging/Production
RESEND_API_KEY=re_your_resend_api_key

# Supabase (for tests)
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Email rendering services
EMAIL_ON_ACID_API_KEY=your_email_on_acid_key
```

Add these to:
- `.env.local` (local development)
- Supabase secrets (edge functions)
- CI/CD pipeline secrets (GitHub Actions)
- Vercel environment variables (frontend deployment)
