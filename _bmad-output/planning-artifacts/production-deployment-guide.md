# Pulau Production Deployment Guide

**Status:** In Progress  
**Started:** January 12, 2026  
**Target Launch:** January 15-19, 2026  
**Priority:** P0 - CRITICAL PATH

---

## Overview

This guide walks through deploying Pulau to production with all integrations configured. Follow steps in order for smooth deployment.

**Estimated Total Time:** 4-6 hours  
**Prerequisites:** Access to all service dashboards, payment method for paid services

---

## Pre-Deployment Checklist

**Code Readiness:**
- [x] All Phase 1 (MVP) stories complete
- [x] All Phase 2a (Core Transactional) stories complete
- [x] All Phase 2b (Enhanced Operations) stories complete
- [x] Email system implemented (4/5 stories done, 1 blocked)
- [x] Error monitoring implemented (Sentry)
- [x] TypeScript compiles cleanly
- [x] All critical E2E tests passing

**Service Accounts Required:**
- [ ] Supabase Pro account ($25/month)
- [ ] Stripe production account (free, % fees on transactions)
- [ ] Resend account (free tier: 3k emails/month)
- [ ] Sentry account (free tier: 5k errors/month)
- [ ] Vercel account (Hobby $0 or Pro $20/month)
- [ ] Domain registrar (pulau.app - if not already owned)

---

## Task 1: Production Supabase Project ✅ STARTED

**Status:** Credentials exist in .env.production  
**Project Ref:** wzuvzcydenvuzxmoryzt  
**Region:** Not specified (verify in dashboard)

### Verify Existing Setup

```bash
# Check connection
psql "postgresql://postgres:FKyRXAzDxjF7Mc6M@db.wzuvzcydenvuzxmoryzt.supabase.co:5432/postgres"

# Test API
curl https://wzuvzcydenvuzxmoryzt.supabase.co/rest/v1/ \
  -H "apikey: sb_publishable_cyloXhz-gp54zuAINLEh9g_3w-fKcLC"
```

### Complete Setup (if needed)

1. **Get Service Role Key** ⚠️ REQUIRED
   - Go to: https://supabase.com/dashboard/project/wzuvzcydenvuzxmoryzt/settings/api
   - Copy `service_role` (secret) key
   - Update in `.env.production`:
     ```
     SUPABASE_SERVICE_ROLE_KEY=eyJhb...actual_key
     ```

2. **Enable Production Features**
   - [ ] Point-in-Time Recovery (PITR) - Settings → Database → Backups
   - [ ] Daily backups enabled
   - [ ] Connection pooling: Transaction mode
   - [ ] Auth settings reviewed (JWT expiry, email confirmations)

3. **Security Review**
   - [ ] Database password is strong (already set: FKyRXAzDxjF7Mc6M)
   - [ ] RLS policies will be applied via migrations
   - [ ] API keys stored securely

**Estimated Time:** 15 minutes  
**Cost:** $25/month (Pro plan)

---

## Task 2: Run Production Migrations

**Database:** Currently has 17 migrations (as of Jan 12, 2026)

### Migration Files
```
20260108000000_initial_schema.sql          - profiles, vendors, experiences
20260108000001_trips_schema.sql            - trips, trip_items
20260108000002_bookings_schema.sql         - bookings
20260108000005_complete_schema.sql         - destinations, images, inclusions, etc.
20260109000001_create_experience_slots.sql - time slot management
20260109000002_create_payments_table.sql   - payment tracking
20260109000003_create_audit_logs_table.sql - audit trail
20260111000001_create_booking_reminders.sql - reminder notifications
20260112000001_create_customer_notifications.sql
20260112000002_create_booking_modifications.sql
20260112000004_create_email_logs_table.sql - email delivery tracking
... (17 total)
```

### Run Migrations

```bash
# 1. Link to production project
supabase link --project-ref wzuvzcydenvuzxmoryzt

# 2. Check migration status
supabase db remote ls

# 3. Apply pending migrations
supabase db push

# 4. Verify all tables created
supabase db remote ls

# Expected tables:
# - profiles, vendors, experiences, experience_slots
# - bookings, payments, refunds
# - trips, trip_items
# - reviews, favorites
# - audit_logs, email_logs
# - customer_notifications, booking_reminders
# - booking_modifications
```

### Verify Schema

```sql
-- Connect to production database
psql "postgresql://postgres:FKyRXAzDxjF7Mc6M@db.wzuvzcydenvuzxmoryzt.supabase.co:5432/postgres"

-- List all tables
\dt public.*

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Verify indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Estimated Time:** 15 minutes  
**Validation:** All 17 migrations applied, tables created, RLS active

---

## Task 3: Configure Production Environment Variables

### A. Supabase Edge Function Secrets

```bash
# Link to production (if not already done)
supabase link --project-ref wzuvzcydenvuzxmoryzt

# Set all secrets
supabase secrets set SUPABASE_URL=https://wzuvzcydenvuzxmoryzt.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sb_publishable_cyloXhz-gp54zuAINLEh9g_3w-fKcLC
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_DASHBOARD>

# Stripe (after Task 4)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (after configured)
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM_EMAIL=bookings@pulau.app

# Application
supabase secrets set APP_URL=https://pulau.app
supabase secrets set NODE_ENV=production

# Verify secrets set (shows names only)
supabase secrets list
```

### B. Frontend Environment Variables (Vercel)

Will be set in Task 5 during Vercel configuration.

**Variables needed:**
```bash
VITE_SUPABASE_URL=https://wzuvzcydenvuzxmoryzt.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cyloXhz-gp54zuAINLEh9g_3w-fKcLC
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://pulau.app
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

**Estimated Time:** 20 minutes  
**Dependencies:** Stripe production keys, Resend API key, Sentry DSN

---

## Task 4: Setup Stripe Production Account

### A. Create Production Account

1. **Activate Production Mode**
   - Go to: https://dashboard.stripe.com/
   - Toggle from "Test mode" to "Production mode" (top right)
   - Complete business verification if required

2. **Get Production API Keys**
   - Go to: Developers → API keys
   - Copy Publishable key (pk_live_...)
   - Reveal and copy Secret key (sk_live_...)
   - Store in password manager

3. **Create Products & Prices**
   
   **Option A: Manual in Dashboard**
   - Products → Add product
   - For each experience type, create product
   - Set pricing

   **Option B: Via Stripe CLI**
   ```bash
   # Create sample experience product
   stripe products create \
     --name "Island Hopping Adventure" \
     --description "Full day island hopping tour" \
     --images https://pulau.app/images/island-hopping.jpg

   # Create price
   stripe prices create \
     --product <PRODUCT_ID> \
     --currency usd \
     --unit_amount 15000  # $150.00
   ```

### B. Configure Webhooks

1. **Create Webhook Endpoint**
   - Go to: Developers → Webhooks
   - Click "+ Add endpoint"
   - URL: `https://wzuvzcydenvuzxmoryzt.supabase.co/functions/v1/webhook-stripe`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `customer.subscription.created` (if using subscriptions)

2. **Get Webhook Secret**
   - After creating webhook, copy "Signing secret" (whsec_...)
   - Store in password manager

3. **Update Environment Variables**
   ```bash
   # Add to .env.production
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Set in Supabase secrets
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### C. Test Webhook

```bash
# Use Stripe CLI to test
stripe listen --forward-to https://wzuvzcydenvuzxmoryzt.supabase.co/functions/v1/webhook-stripe

# Trigger test event
stripe trigger checkout.session.completed
```

**Estimated Time:** 30 minutes  
**Cost:** Free (transaction fees apply: 2.9% + $0.30)  
**Validation:** Webhook receives and processes events

---

## Task 5: Configure Hosting Platform (Vercel)

### A. Install Vercel CLI

```bash
npm i -g vercel
```

### B. Link Project

```bash
# From project root
cd /Users/moe/Pulau

# Login to Vercel
vercel login

# Link project (follow prompts)
vercel link

# Options:
# - Set up and deploy: Yes
# - Scope: Your account
# - Link to existing project: No (create new)
# - Project name: pulau
# - Directory: ./ (current)
# - Override settings: No
```

### C. Configure Environment Variables

```bash
# Set production environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://wzuvzcydenvuzxmoryzt.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: sb_publishable_cyloXhz-gp54zuAINLEh9g_3w-fKcLC

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_...

vercel env add VITE_APP_URL production
# Enter: https://pulau.app

vercel env add VITE_SENTRY_DSN production
# Enter: https://xxx@xxx.ingest.sentry.io/xxx

vercel env add VITE_SENTRY_ENVIRONMENT production
# Enter: production

vercel env add VITE_APP_VERSION production
# Enter: 1.0.0

# For Sentry sourcemaps
vercel env add SENTRY_AUTH_TOKEN production
# Enter: <Sentry auth token>
```

### D. Configure Build Settings

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "NODE_VERSION": "20"
  },
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Estimated Time:** 20 minutes  
**Cost:** $0 (Hobby plan) or $20/month (Pro)

---

## Task 6: Setup Custom Domain & SSL

### A. Configure Domain in Vercel

1. **Add Domain**
   - Vercel Dashboard → Project → Settings → Domains
   - Click "Add"
   - Enter: `pulau.app`
   - Click "Add"

2. **Configure DNS**
   
   **Option A: Use Vercel Nameservers (Recommended)**
   - Vercel will provide nameservers
   - Go to your domain registrar
   - Update nameservers to Vercel's
   - Wait for propagation (5 min - 48 hours)

   **Option B: Use CNAME Record**
   ```
   Type: CNAME
   Name: @  (or www)
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL (Let's Encrypt)
   - No manual configuration needed
   - Certificate auto-renews

### B. Configure DNS for Email (Resend)

Add these records at your domain registrar:

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all

# DKIM Record (get from Resend dashboard)
Type: TXT
Name: resend._domainkey
Value: <provided by Resend>

# DMARC Record
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@pulau.app
```

### C. Verify Domain

```bash
# Check DNS propagation
dig pulau.app

# Check SSL
curl -I https://pulau.app
```

**Estimated Time:** 30 minutes + DNS propagation  
**Cost:** Domain registration ($10-15/year if not owned)  
**Validation:** Site loads on https://pulau.app with valid SSL

---

## Task 7: Deploy Production Build

### A. Build Locally (Test)

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Check build output
ls -la dist/

# Test production build locally
npm run preview
```

### B. Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Vercel will:
# 1. Upload source code
# 2. Install dependencies
# 3. Run npm run build
# 4. Upload dist/ to CDN
# 5. Provision DNS/SSL
# 6. Deploy to production URL
```

### C. Deploy Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy send-email
supabase functions deploy webhook-stripe
supabase functions deploy generate-ticket
supabase functions deploy checkout
supabase functions deploy process-refund

# Or deploy all at once
supabase functions deploy --project-ref wzuvzcydenvuzxmoryzt
```

### D. Monitor Deployment

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# Check function logs
supabase functions logs send-email --project-ref wzuvzcydenvuzxmoryzt
```

**Estimated Time:** 30 minutes  
**Validation:** Site accessible at https://pulau.app, all pages load

---

## Task 8: Verify All Integrations

### A. End-to-End User Flow Test

**Complete Booking Flow:**

1. **Browse Experiences**
   - [ ] Go to https://pulau.app
   - [ ] Browse experiences
   - [ ] View experience details
   - [ ] Check images load
   - [ ] Verify pricing displays

2. **Create Account**
   - [ ] Sign up with email
   - [ ] Verify email confirmation sent
   - [ ] Click confirmation link
   - [ ] Log in successfully

3. **Make Booking**
   - [ ] Select experience
   - [ ] Choose date and time slot
   - [ ] Add to trip
   - [ ] Proceed to checkout
   - [ ] Enter traveler details
   - [ ] Enter payment (use Stripe test card first if available)
   - [ ] Complete booking

4. **Verify Post-Booking**
   - [ ] Booking confirmation page displays
   - [ ] Booking appears in "My Bookings"
   - [ ] Email confirmation received (check email)
   - [ ] PDF ticket attached to email
   - [ ] Stripe payment recorded
   - [ ] Database booking record created

### B. Integration Checklist

**Supabase Database:**
```sql
-- Verify booking created
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;

-- Check payment recorded
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

-- Verify email log
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```

**Stripe:**
- [ ] Dashboard shows payment
- [ ] Webhook events received
- [ ] Customer created
- [ ] Payment intent succeeded

**Resend (Email):**
- [ ] Email delivered to inbox
- [ ] Email not in spam
- [ ] PDF attachment present
- [ ] Links in email work
- [ ] Unsubscribe link works

**Sentry:**
- [ ] No errors in Sentry dashboard
- [ ] Performance metrics appearing
- [ ] Source maps working (stack traces readable)

### C. Performance Tests

```bash
# Run Lighthouse audit
npx lighthouse https://pulau.app --output=html --output-path=./lighthouse-report.html

# Targets:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### D. Security Tests

```bash
# Check SSL/TLS
ssllabs.com/ssltest/analyze.html?d=pulau.app

# Check headers
curl -I https://pulau.app

# Verify HTTPS redirect
curl -I http://pulau.app
```

**Estimated Time:** 1-2 hours  
**Validation:** Complete booking flow works end-to-end

---

## Post-Deployment Monitoring (First 48 Hours)

### Hour 1 - Critical Checks

- [ ] Site loads on https://pulau.app
- [ ] No 500 errors
- [ ] No JavaScript errors in console
- [ ] All images load
- [ ] Checkout flow works
- [ ] Email delivery works

### Hour 24 - Performance Review

- [ ] Check Sentry for errors (should be < 1% error rate)
- [ ] Review Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Check email delivery rate (> 95%)
- [ ] Review Stripe transactions (all successful)
- [ ] Monitor API response times (< 500ms p95)

### Hour 48 - Full Assessment

- [ ] Total bookings made
- [ ] Revenue processed
- [ ] Error rate stable
- [ ] Performance metrics acceptable
- [ ] No security alerts
- [ ] Customer feedback positive

---

## Rollback Plan

**If critical issues occur:**

### Option 1: Vercel Instant Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Option 2: Database Rollback

```bash
# If migrations caused issues
supabase db reset --linked

# Restore from backup
# Go to Supabase Dashboard → Database → Backups
# Click "Restore" on last known good backup
```

### Option 3: Full Rollback

1. Point DNS back to staging
2. Rollback Vercel deployment
3. Restore database from backup
4. Investigate issue offline
5. Fix and redeploy

---

## Production Deployment Checklist Summary

**Pre-Deployment:**
- [x] All code complete and tested
- [x] Sentry monitoring configured
- [ ] All service accounts created
- [ ] Domain registered (pulau.app)

**Infrastructure:**
- [ ] Task 1: Supabase production project ✅ (credentials exist)
- [ ] Task 2: Run production migrations
- [ ] Task 3: Configure environment variables
- [ ] Task 4: Setup Stripe production
- [ ] Task 5: Configure Vercel hosting
- [ ] Task 6: Setup custom domain & SSL
- [ ] Task 7: Deploy production build
- [ ] Task 8: Verify all integrations

**Post-Deployment:**
- [ ] Monitor first hour (critical)
- [ ] Review first 24 hours
- [ ] Full assessment at 48 hours
- [ ] Team trained on production operations
- [ ] Runbooks documented
- [ ] On-call rotation established

---

## Estimated Timeline

| Day | Tasks | Duration |
|-----|-------|----------|
| Day 1 | Tasks 1-3 (Infrastructure) | 2 hours |
| Day 2 | Tasks 4-5 (Stripe, Vercel) | 2 hours |
| Day 3 | Task 6 (Domain, DNS wait) | 30 min + propagation |
| Day 4 | Tasks 7-8 (Deploy, verify) | 2 hours |
| Day 5 | Monitoring, fixes | Ongoing |

**Total Active Time:** 6-7 hours  
**Total Calendar Time:** 3-5 days (DNS propagation)

---

**Created:** January 12, 2026  
**Last Updated:** January 12, 2026  
**Owner:** DevOps Team  
**Status:** Ready to Execute
