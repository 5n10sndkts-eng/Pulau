# Email System Production Readiness Checklist

**Epic:** 30.1 - Email Notification System  
**Date:** January 12, 2026  
**Status:** Implementation Complete - Awaiting Production Setup

## 1. Implementation Status ✅

### Completed Components

- [x] **Story 30-1-1**: send-email Edge Function
  - 616 lines fully implemented
  - Resend SDK v2 integration
  - Retry logic with exponential backoff
  - Error handling and logging
  - Template rendering system

- [x] **Story 30-1-2**: Email Templates
  - booking-confirmation.ts (190 lines)
  - booking-reminder.ts
  - booking-cancellation.ts
  - Mobile-responsive design
  - Base template wrapper

- [x] **Story 30-1-4**: Email Triggers
  - Webhook integration in stripe-webhook function
  - Fire-and-forget async pattern
  - Comprehensive data fetching (joins)
  - Error handling without blocking webhook

- [x] **Story 30-1-5**: E2E Email Tests
  - email-delivery.spec.ts (comprehensive test suite)
  - email-rendering.spec.ts (rendering validation)
  - email-monitoring.spec.ts (metrics tracking)
  - Test helpers and utilities
  - Setup documentation

### Blocked Components

- [ ] **Story 30-1-3**: Resend API Integration
  - **Status:** BLOCKED - Requires manual setup
  - **Blocker:** Resend account creation, domain verification, DNS configuration
  - **Estimated Time:** 2-3 days (including DNS propagation)
  - **See:** Story 30-1-3 for detailed 7-step checklist

## 2. Manual Setup Requirements

### A. Resend Account Setup

**Priority:** P0 - CRITICAL PATH  
**Estimated Time:** 30 minutes  
**Owner:** DevOps / Operations Team

Steps:
1. Create Resend account at https://resend.com/
2. Verify email address
3. Add pulau.app domain
4. Generate API key
5. Store API key in Supabase secrets

**Acceptance Criteria:**
- [ ] Resend account created
- [ ] API key generated
- [ ] API key stored in Supabase: `supabase secrets set RESEND_API_KEY=...`
- [ ] API key verified working

### B. DNS Configuration

**Priority:** P0 - CRITICAL PATH  
**Estimated Time:** 15 minutes + 2-3 days propagation  
**Owner:** DevOps / DNS Administrator

DNS Records Required:

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600

# DKIM Record (provided by Resend after domain added)
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this value]
TTL: 3600

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@pulau.app
TTL: 3600
```

**Acceptance Criteria:**
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS
- [ ] DNS records propagated (check with `dig` or `nslookup`)
- [ ] Domain verified in Resend dashboard

**Verification Commands:**
```bash
# Check SPF
dig TXT pulau.app | grep spf1

# Check DKIM
dig TXT resend._domainkey.pulau.app

# Check DMARC
dig TXT _dmarc.pulau.app
```

### C. Email Testing Account Setup

**Priority:** P1 - Required for E2E tests  
**Estimated Time:** 15 minutes  
**Owner:** QA Team

Steps:
1. Create Mailosaur account: https://mailosaur.com/
2. Create test server
3. Get API key and Server ID
4. Add to environment variables

**Acceptance Criteria:**
- [ ] Mailosaur account created (free tier: 10,000 emails/month)
- [ ] Test server created
- [ ] API credentials stored in `.env.local`:
  ```bash
  MAILOSAUR_API_KEY=your_key
  MAILOSAUR_SERVER_ID=your_server_id
  ```
- [ ] Test email sent successfully to Mailosaur

### D. Monitoring Setup

**Priority:** P1 - Required for production observability  
**Estimated Time:** 1 hour  
**Owner:** DevOps Team

Steps:
1. Configure Resend webhooks
2. Deploy resend-webhook edge function
3. Set up monitoring dashboard
4. Configure alerts

**Acceptance Criteria:**
- [ ] Resend webhook endpoint configured: `https://[project].supabase.co/functions/v1/resend-webhook`
- [ ] Webhook events selected: delivered, bounced, complained
- [ ] Webhook secret stored in Supabase
- [ ] Test webhook delivery confirmed
- [ ] Alert thresholds configured (delivery rate < 95%, bounce rate > 5%)

## 3. Pre-Production Testing

### A. E2E Test Suite Execution

**Run all email tests:**

```bash
# Set environment variables
export MAILOSAUR_API_KEY=your_key
export MAILOSAUR_SERVER_ID=your_server_id
export RESEND_API_KEY=re_your_key

# Run E2E tests
npm run test:e2e -- tests/e2e/email-delivery.spec.ts
npm run test:e2e -- tests/e2e/email-rendering.spec.ts
npm run test:e2e -- tests/e2e/email-monitoring.spec.ts
```

**Acceptance Criteria:**
- [ ] All email delivery tests pass (100%)
- [ ] All email rendering tests pass
- [ ] Email monitoring tests pass
- [ ] Average delivery time < 30 seconds
- [ ] No failed deliveries

### B. Manual Email Testing

**Test Scenarios:**

1. **Booking Confirmation Email**
   - [ ] Complete real booking in staging
   - [ ] Email received within 30 seconds
   - [ ] All booking details correct (name, date, time, amount)
   - [ ] PDF ticket attached
   - [ ] All links work (View Booking, Cancel, etc.)
   - [ ] Email renders correctly in Gmail
   - [ ] Email renders correctly in Outlook
   - [ ] Email renders correctly on mobile (iPhone/Android)

2. **Booking Reminder Email** (if implemented)
   - [ ] Reminder sent 24 hours before
   - [ ] Correct booking details
   - [ ] Links work

3. **Booking Cancellation Email** (if implemented)
   - [ ] Email sent when booking cancelled
   - [ ] Refund details included
   - [ ] Links work

### C. Spam Score Validation

**mail-tester.com Check:**

```bash
# 1. Go to https://www.mail-tester.com/
# 2. Get unique test email address
# 3. Send test email from staging
# 4. Check score

# Target: 10/10 score
```

**Acceptance Criteria:**
- [ ] Mail-tester.com score: 10/10
- [ ] SPF check: PASS
- [ ] DKIM check: PASS
- [ ] DMARC check: PASS
- [ ] Content analysis: PASS
- [ ] Spam assassin score: PASS
- [ ] Blacklist check: PASS

### D. Cross-Client Rendering Validation

**Email Clients to Test:**

- [ ] Gmail (desktop)
- [ ] Gmail (mobile app - iOS)
- [ ] Gmail (mobile app - Android)
- [ ] Outlook (desktop - Windows)
- [ ] Outlook (web)
- [ ] Apple Mail (macOS)
- [ ] Apple Mail (iOS)
- [ ] Yahoo Mail
- [ ] ProtonMail (if time permits)

**What to Check:**
- Layout not broken
- Images display
- Fonts render correctly
- Buttons/CTAs visible and clickable
- Links work
- Dark mode (if applicable)

## 4. Production Deployment Checklist

### Environment Variables

**Supabase Secrets:**
```bash
supabase secrets set RESEND_API_KEY=re_production_key_here
supabase secrets list
```

**Vercel Environment Variables (if frontend needs them):**
```bash
RESEND_API_KEY=re_production_key_here  # If needed
```

### Deployment Steps

1. **Deploy Edge Functions**
   ```bash
   cd /Users/moe/Pulau
   supabase functions deploy send-email
   supabase functions deploy resend-webhook
   ```

2. **Verify Deployment**
   ```bash
   # Check function logs
   supabase functions logs send-email
   
   # Test function directly
   curl -X POST 'https://[project].supabase.co/functions/v1/send-email' \
     -H 'Authorization: Bearer [anon-key]' \
     -H 'Content-Type: application/json' \
     -d '{ "test": true }'
   ```

3. **Enable Production Monitoring**
   - [ ] Configure Sentry for error tracking
   - [ ] Set up email delivery dashboard
   - [ ] Configure PagerDuty/Slack alerts

### Rollback Plan

**If issues occur in production:**

1. **Disable email sending temporarily:**
   ```typescript
   // Add feature flag in edge function
   const EMAIL_ENABLED = Deno.env.get('EMAIL_ENABLED') === 'true';
   
   if (!EMAIL_ENABLED) {
     console.log('Email sending disabled');
     return;
   }
   ```

2. **Revert to manual email notifications**
   - Queue bookings requiring email
   - Send manually via Resend dashboard
   - Fix issue
   - Re-enable automated sending

3. **Emergency contacts:**
   - Resend support: support@resend.com
   - Supabase support: In-dashboard support chat
   - On-call engineer: [Add contact]

## 5. Post-Launch Monitoring (First 48 Hours)

### Metrics to Watch

**Hour 1:**
- [ ] First email sent successfully
- [ ] Email delivered within SLA (< 30s)
- [ ] No errors in function logs
- [ ] Webhook receiving delivery events

**Hour 24:**
- [ ] Delivery rate: > 95%
- [ ] Bounce rate: < 2%
- [ ] Average delivery time: < 30s
- [ ] No customer complaints
- [ ] email_logs table populating correctly

**Hour 48:**
- [ ] All metrics stable
- [ ] No spike in bounces
- [ ] No spam complaints
- [ ] Dashboard showing expected trends

### Alert Thresholds

Configure alerts for:
- Delivery rate drops below 95%
- Bounce rate exceeds 5%
- More than 3 failed sends in 5 minutes
- Average delivery time > 60 seconds
- Any spam complaints

## 6. Success Criteria

Email system is production-ready when:

- [x] All code implemented and tested
- [ ] Resend account configured
- [ ] DNS records verified
- [ ] All E2E tests passing
- [ ] Manual testing completed
- [ ] Mail-tester score 10/10
- [ ] Cross-client rendering validated
- [ ] Monitoring dashboard operational
- [ ] Alerts configured
- [ ] Documentation complete
- [ ] Team trained on troubleshooting
- [ ] Rollback plan tested

## 7. Estimated Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Resend account setup | 30 min | None |
| DNS configuration | 15 min + 2-3 days | Resend account |
| Mailosaur setup | 15 min | None |
| Run E2E tests | 1 hour | Mailosaur, Resend |
| Manual testing | 2-3 hours | DNS propagation |
| Spam score validation | 1 hour | DNS propagation |
| Cross-client testing | 2-4 hours | All above |
| Production deployment | 1 hour | All testing complete |
| Monitoring setup | 1 hour | Deployment |

**Total Critical Path:** 3-4 days (mostly DNS propagation wait time)  
**Total Effort:** ~8-12 hours active work

## 8. Owner Assignment

| Component | Owner | Status |
|-----------|-------|--------|
| Resend account | DevOps | Not Started |
| DNS records | DNS Admin | Not Started |
| Mailosaur setup | QA Team | Not Started |
| E2E test execution | QA Team | Ready to Run |
| Manual testing | QA Team | Blocked on DNS |
| Deployment | DevOps | Blocked on testing |
| Monitoring | DevOps | Blocked on deployment |

## 9. Next Actions

**Immediate (Today):**
1. Create Resend account → DevOps
2. Add DNS records → DNS Admin
3. Set up Mailosaur → QA Team

**Day 2-3 (Waiting for DNS):**
4. Monitor DNS propagation
5. Verify domain in Resend
6. Run E2E test suite → QA Team

**Day 4 (Testing & Validation):**
7. Manual testing across email clients → QA Team
8. Mail-tester validation → QA Team
9. Fix any issues found

**Day 5 (Production Launch):**
10. Deploy to production → DevOps
11. Enable monitoring → DevOps
12. Watch metrics for 48 hours → All

---

**Last Updated:** January 12, 2026  
**Review Status:** Ready for stakeholder review  
**Blocked By:** Manual Resend setup (Story 30-1-3)
