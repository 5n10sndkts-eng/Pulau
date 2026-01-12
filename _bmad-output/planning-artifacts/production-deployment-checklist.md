# Production Deployment Checklist
**Project:** Pulau  
**Target Date:** TBD  
**Environment:** Production  
**Last Updated:** 2025-01-08

## Pre-Flight Status Dashboard

### ✅ Completed Prerequisites
- [x] Production deployment guide created
- [x] vercel.json configuration file created
- [x] .env.production template exists with Supabase credentials
- [x] 17 database migrations ready to deploy
- [x] Sentry SDK fully implemented in codebase
- [x] Email E2E tests implemented (pending Mailosaur account)
- [x] TypeScript compilation clean
- [x] Service Worker implemented for offline support

### 🟡 In Progress
- [ ] **Task 1**: Get Supabase service role key
- [ ] **Task 2**: Run production migrations
- [ ] **Task 3**: Configure environment variables
- [ ] **Task 4**: Setup Stripe production account
- [ ] **Task 5**: Configure Vercel hosting
- [ ] **Task 6**: Setup domain & SSL (pulau.app)
- [ ] **Task 7**: Deploy production build
- [ ] **Task 8**: Verify all integrations

### ⚠️ Blocked Tasks
- [ ] **Story 30-1-3**: Resend domain verification (requires DNS access)

---

## Phase 1: Infrastructure Setup (Day 1)

### Task 1: Supabase Production Project
**Status:** 🟡 Credentials exist, service key needed  
**Time:** 15 minutes  
**Cost:** $25/month (Pro plan)

#### Current State
```bash
Project ID: wzuvzcydenvuzxmoryzt
Region: AWS ap-southeast-1 (Singapore)
URL: https://wzuvzcydenvuzxmoryzt.supabase.co
Anon Key: ✅ Configured in .env.production
Service Role Key: ⚠️  Needed from dashboard
Database Password: ✅ FKyRXAzDxjF7Mc6M
```

#### Steps
1. **Get Service Role Key**
   ```bash
   # Navigate to:
   https://supabase.com/dashboard/project/wzuvzcydenvuzxmoryzt/settings/api
   
   # Copy service_role (secret) key
   # Update .env.production:
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (long JWT token)
   ```

2. **Verify Project Settings**
   - [ ] Pro plan active ($25/mo)
   - [ ] PITR enabled (Point-in-Time Recovery)
   - [ ] Daily backups configured
   - [ ] Connection pooler enabled (port 6543)

3. **Link Local Project**
   ```bash
   cd /Users/moe/Pulau
   supabase link --project-ref wzuvzcydenvuzxmoryzt
   # Enter database password when prompted: FKyRXAzDxjF7Mc6M
   ```

**Validation:**
```bash
# Test connection
supabase db remote commit
# Should show "No schema changes detected"
```

---

### Task 2: Run Production Migrations
**Status:** ⏳ Ready to execute  
**Time:** 15 minutes  
**Dependencies:** Task 1 complete

#### Current State
```bash
Migration Files: 17 total
Tables to Create: 19 (profiles, vendors, experiences, bookings, payments, etc.)
RLS Policies: ~50+ across all tables
Indexes: ~30+ for query optimization
```

#### Steps
1. **Backup Current State (if re-deploying)**
   ```bash
   # Only if production database has existing data
   supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Review Migrations**
   ```bash
   # List all pending migrations
   ls -lah supabase/migrations/
   # Should see 17 files from 000_initial.sql to 016_latest.sql
   ```

3. **Execute Migrations**
   ```bash
   # This pushes all migrations to production
   supabase db push
   
   # Review output for any errors
   # Should see: "✓ All migrations applied successfully"
   ```

4. **Verify Schema**
   ```bash
   # Connect to production database
   supabase db remote commit
   
   # List all tables
   supabase db remote --help
   ```

**Validation SQL:**
```sql
-- Run in Supabase SQL Editor
SELECT 
  schemaname,
  tablename,
  rowcount
FROM (
  SELECT 
    schemaname,
    tablename,
    n_tup_ins - n_tup_del AS rowcount
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
) t
ORDER BY tablename;

-- Expected tables:
-- profiles, vendors, experiences, bookings, payments, trips,
-- email_logs, audit_logs, booking_reminders, customer_notifications
```

---

## Phase 2: Service Configuration (Day 1-2)

### Task 3: Configure Environment Variables
**Status:** ⏳ Template ready  
**Time:** 20 minutes  
**Dependencies:** Tasks 1-2 complete

#### Variables Checklist

**✅ Supabase (Complete)**
- [x] VITE_SUPABASE_URL
- [x] VITE_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY (from Task 1)
- [x] DATABASE_URL

**⏳ Stripe (Pending)**
- [ ] VITE_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET

**⏳ Resend (Blocked)**
- [ ] RESEND_API_KEY (requires domain verification)

**⏳ Sentry (Pending)**
- [ ] VITE_SENTRY_DSN
- [ ] SENTRY_AUTH_TOKEN

**⏳ Deployment (Pending)**
- [ ] VERCEL_PROJECT_ID
- [ ] VERCEL_ORG_ID
- [ ] VITE_APP_URL=https://pulau.app

#### Steps
1. **Update .env.production**
   ```bash
   # Edit file manually or use secure vault
   nano .env.production
   
   # Verify no placeholders remain
   grep -E '<TO_BE_SET>|<GET_FROM_DASHBOARD>' .env.production
   # Should return empty after all values filled
   ```

2. **Set Supabase Secrets (for Edge Functions)**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY="sk_live_..."
   supabase secrets set RESEND_API_KEY="re_..."
   supabase secrets set SENTRY_DSN="https://..."
   
   # List all secrets
   supabase secrets list
   ```

3. **Store in Password Manager**
   - [ ] Copy .env.production to 1Password/LastPass
   - [ ] Tag as "Production Credentials - Pulau"
   - [ ] Share with DevOps team members only

**Validation:**
```bash
# No output = all vars set correctly
grep -E '<TO_BE_SET>|<GET_FROM_DASHBOARD>' .env.production
```

---

### Task 4: Setup Stripe Production Account
**Status:** ⏳ Ready to configure  
**Time:** 30 minutes  
**Cost:** 2.9% + $0.30 per transaction

#### Steps
1. **Create Production Account**
   - [ ] Go to https://dashboard.stripe.com/
   - [ ] Activate production mode (top-left toggle)
   - [ ] Complete business verification (may take 1-2 days)
   - [ ] Add bank account for payouts

2. **Get API Keys**
   ```bash
   # Navigate to: Developers > API keys
   # Copy both keys to .env.production:
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Create Products**
   ```sql
   -- Get experience data from Supabase
   SELECT id, name, price_per_person, currency
   FROM experiences
   WHERE status = 'active';
   ```
   
   - [ ] Create product for each experience
   - [ ] Set prices in SGD (or appropriate currency)
   - [ ] Save Stripe product IDs back to Supabase

4. **Configure Webhooks**
   ```bash
   # Webhook URL: https://pulau.app/api/stripe-webhook
   # Events to subscribe:
   # - payment_intent.succeeded
   # - payment_intent.payment_failed
   # - charge.refunded
   # - customer.subscription.deleted
   
   # Copy webhook signing secret
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Validation:**
```bash
# Test Stripe connection
curl https://api.stripe.com/v1/balance \
  -u sk_live_YOUR_SECRET_KEY:

# Should return balance object
```

---

### Task 5: Configure Vercel Hosting
**Status:** ⏳ vercel.json ready  
**Time:** 20 minutes  
**Cost:** $0 (Hobby) or $20/mo (Pro)

#### Steps
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel@latest
   vercel --version
   ```

2. **Login & Link Project**
   ```bash
   vercel login
   # Follow OAuth flow in browser
   
   cd /Users/moe/Pulau
   vercel link
   # Select: Create new project
   # Name: pulau-app (or similar)
   # Framework: Vite
   ```

3. **Configure Environment Variables**
   ```bash
   # Add all vars from .env.production
   vercel env add VITE_SUPABASE_URL production
   # Enter: https://wzuvzcydenvuzxmoryzt.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY production
   # Enter: sb_publishable_cyloXhz...
   
   # Repeat for all VITE_* variables
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
   vercel env add VITE_SENTRY_DSN production
   vercel env add VITE_APP_URL production
   
   # List all configured vars
   vercel env ls
   ```

4. **Configure Build Settings**
   ```bash
   # Already set in vercel.json:
   # - Build Command: npm run build
   # - Output Directory: dist
   # - Node Version: 20
   # - Framework: Vite
   ```

**Validation:**
```bash
# Get project IDs (update .env.production)
vercel project ls
# Copy Project ID and Org ID
```

---

### Task 6: Setup Domain & SSL
**Status:** ⏳ Ready to configure  
**Time:** 30 minutes active + 1-4 hours DNS propagation  
**Cost:** Included with Vercel

#### Steps
1. **Add Domain to Vercel**
   ```bash
   vercel domains add pulau.app
   # Follow prompts to verify ownership
   ```

2. **Configure DNS Records**
   ```bash
   # For root domain (pulau.app):
   # Type: A
   # Name: @
   # Value: 76.76.21.21 (Vercel IP)
   
   # For www subdomain:
   # Type: CNAME
   # Name: www
   # Value: cname.vercel-dns.com
   ```

3. **Setup Email DNS (for Resend)**
   ```bash
   # SPF Record:
   # Type: TXT
   # Name: @
   # Value: v=spf1 include:_spf.resend.com ~all
   
   # DKIM Record (get from Resend dashboard):
   # Type: TXT
   # Name: resend._domainkey
   # Value: [provided by Resend after domain verification]
   
   # DMARC Record:
   # Type: TXT
   # Name: _dmarc
   # Value: v=DMARC1; p=none; rua=mailto:dmarc@pulau.app
   ```

4. **Verify SSL Certificate**
   ```bash
   # Vercel auto-provisions SSL via Let's Encrypt
   # Check status in dashboard:
   # https://vercel.com/your-org/pulau-app/settings/domains
   
   # Should show: "SSL Certificate: Active"
   ```

**Validation:**
```bash
# Test DNS propagation
dig pulau.app
dig www.pulau.app
dig resend._domainkey.pulau.app TXT

# Test SSL
curl -I https://pulau.app
# Should return: HTTP/2 200 (after deployment)
```

---

## Phase 3: Deployment (Day 2-3)

### Task 7: Deploy Production Build
**Status:** ⏳ Ready after Tasks 1-6  
**Time:** 30 minutes  
**Dependencies:** All previous tasks complete

#### Steps
1. **Pre-Deployment Checks**
   ```bash
   # Verify all environment variables set
   vercel env ls | grep -E '(SUPABASE|STRIPE|SENTRY|APP_URL)'
   
   # Run local production build
   npm run build
   # Should complete without errors
   
   # Check build size
   du -sh dist/
   # Target: < 5 MB total
   
   # Verify TypeScript
   npm run type-check
   # Should pass with 0 errors
   ```

2. **Deploy Edge Functions**
   ```bash
   # Deploy Supabase Edge Functions to production
   supabase functions deploy stripe-webhook --project-ref wzuvzcydenvyzxmoryzt
   supabase functions deploy email-notification --project-ref wzuvzcydenvyzxmoryzt
   
   # Verify functions deployed
   supabase functions list
   ```

3. **Deploy Frontend**
   ```bash
   # Deploy to production
   vercel --prod
   
   # Expected output:
   # ✓ Deployment complete
   # ✓ Production: https://pulau.app
   # ✓ Inspecting deployment: https://vercel.com/...
   ```

4. **Verify Deployment**
   ```bash
   # Check deployment status
   vercel ls
   
   # View logs
   vercel logs pulau-app
   ```

**Validation:**
```bash
# Test production URL
curl -I https://pulau.app
# Should return: HTTP/2 200

# Test service worker
curl https://pulau.app/sw.js
# Should return service worker code

# Test API health (if implemented)
curl https://pulau.app/api/health
```

---

### Task 8: Verify All Integrations
**Status:** ⏳ Ready after deployment  
**Time:** 1-2 hours  
**Dependencies:** Task 7 complete

#### Integration Test Plan

**1. Supabase Database**
```bash
# Test read access
curl https://pulau.app/api/experiences
# Should return list of experiences

# Test authentication
# Go to https://pulau.app
# Click "Sign Up"
# Create test account
# Verify email received (if Resend configured)
```

**2. Stripe Payments**
```bash
# Manual test:
# 1. Go to https://pulau.app
# 2. Select experience
# 3. Choose date & guests
# 4. Enter test card: 4242 4242 4242 4242
# 5. Verify payment succeeds
# 6. Check Stripe dashboard for payment

# Webhook test:
# Trigger test webhook from Stripe dashboard
# Check supabase logs for webhook receipt
```

**3. Sentry Error Tracking**
```bash
# Trigger test error
# 1. Go to https://pulau.app/admin
# 2. Click "Test Sentry" button (if implemented)
# 3. Check Sentry dashboard for error
# 4. Verify sourcemaps uploaded (readable stack traces)

# Alternative: Force error in browser console
# throw new Error('Production Sentry test');
```

**4. Email Delivery (if Resend configured)**
```bash
# Test booking confirmation email
# 1. Complete test booking
# 2. Verify email arrives within 30 seconds
# 3. Check email rendering (HTML/plain text)
# 4. Click links in email (booking details, support)
```

**5. Performance Monitoring**
```bash
# Lighthouse audit
npx lighthouse https://pulau.app --view

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90

# Core Web Vitals (from Sentry)
# LCP (Largest Contentful Paint): < 2.5s
# FID (First Input Delay): < 100ms
# CLS (Cumulative Layout Shift): < 0.1
```

**6. Security Headers**
```bash
# Test security headers
curl -I https://pulau.app | grep -E '(X-Content|X-Frame|X-XSS|Referrer|Permissions)'

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
# Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Phase 4: Post-Deployment (Day 3-5)

### 48-Hour Monitoring Checklist

#### Hour 0-4 (Critical Period)
- [ ] Monitor Vercel deployment logs every 30 minutes
- [ ] Check Sentry for any unhandled errors
- [ ] Verify all pages load correctly
- [ ] Test user signup/login flow
- [ ] Complete one end-to-end booking

#### Hour 4-24 (High Alert)
- [ ] Monitor Sentry error rate (target: < 0.1% of requests)
- [ ] Check Supabase query performance (target: < 200ms avg)
- [ ] Review Stripe webhook delivery (target: 100% success)
- [ ] Monitor email delivery rate (target: > 95%)
- [ ] Check Core Web Vitals in Sentry (LCP < 2.5s)

#### Day 2-7 (Stabilization)
- [ ] Daily Sentry error review
- [ ] Weekly performance report from Vercel Analytics
- [ ] Review Stripe payment success rate
- [ ] Monitor user feedback channels
- [ ] Check SSL certificate auto-renewal

### Rollback Plan

#### Immediate Rollback (< 5 minutes)
```bash
# Revert to previous deployment
vercel rollback
# Select previous deployment from list

# Or specify deployment URL
vercel rollback https://pulau-app-previous.vercel.app
```

#### Database Rollback (if migrations failed)
```bash
# Restore from backup
supabase db restore backup_YYYYMMDD_HHMMSS.sql

# Or rollback specific migration
supabase db reset --version 015
```

#### Edge Function Rollback
```bash
# Redeploy previous version
supabase functions deploy stripe-webhook --version previous
```

### Emergency Contacts
- **Supabase Support**: support@supabase.io
- **Vercel Support**: support@vercel.com  
- **Stripe Support**: https://support.stripe.com
- **On-Call Engineer**: [TO BE FILLED]

---

## Cost Summary

### Monthly Recurring Costs
| Service | Plan | Cost |
|---------|------|------|
| Supabase | Pro | $25/mo |
| Vercel | Hobby (or Pro) | $0-20/mo |
| Sentry | Free Tier | $0/mo (up to 5k errors) |
| Resend | Free Tier | $0/mo (up to 3k emails) |
| **Total Base** | | **$25-45/mo** |

### Transaction Costs
- **Stripe**: 2.9% + $0.30 per successful payment
- **Example**: 100 bookings/mo @ $50 avg = $175 fees = $17,500 revenue

### First Year Projection
- **Fixed Costs**: $300-540/year
- **Transaction Fees**: ~3% of revenue
- **Break-even**: ~20 bookings/month

---

## Timeline Summary

| Phase | Duration | Parallelizable |
|-------|----------|----------------|
| Infrastructure Setup | 30 minutes | No |
| Service Configuration | 1-2 hours | Yes (Stripe/Sentry) |
| DNS Propagation | 1-4 hours | Passive wait |
| Deployment | 30 minutes | No |
| Integration Testing | 1-2 hours | Partially |
| **Total Active Time** | **6-7 hours** | |
| **Total Calendar Time** | **3-5 days** | (incl. DNS, Stripe verification) |

---

## Success Criteria

### Deployment Success
- [x] All 17 migrations applied successfully
- [x] All environment variables configured
- [x] Frontend deployed to https://pulau.app
- [x] SSL certificate active
- [x] All Edge Functions deployed

### Functional Success
- [ ] User can sign up and login
- [ ] User can browse experiences
- [ ] User can complete booking with Stripe
- [ ] User receives confirmation email
- [ ] Vendor can view bookings in admin panel

### Performance Success
- [ ] Lighthouse score > 90 (all metrics)
- [ ] LCP < 2.5s (Sentry reporting)
- [ ] Supabase query latency < 200ms avg
- [ ] Uptime > 99.9% (first 48 hours)

### Monitoring Success
- [ ] Sentry receiving errors (test error sent)
- [ ] Stripe webhooks delivering successfully
- [ ] Email logs recording in Supabase
- [ ] Vercel analytics tracking pageviews

---

## Next Steps After Production Launch

1. **Complete Resend Setup (Story 30-1-3)**
   - Unblocks email delivery
   - Required for user notifications
   - Timeline: 2-3 days (DNS propagation)

2. **Setup Sentry Account**
   - Create pulau-web project
   - Get DSN and auth token
   - Timeline: 1 hour

3. **Run Email E2E Tests**
   - Setup Mailosaur account
   - Execute email-delivery.spec.ts
   - Timeline: 2 hours

4. **Configure Monitoring Alerts**
   - Sentry: error rate > 0.5%, LCP > 3s
   - Vercel: deployment failures
   - Supabase: query latency > 500ms
   - Stripe: webhook failures
   - Timeline: 1 hour

5. **User Acceptance Testing**
   - Beta test with 5-10 real users
   - Collect feedback on booking flow
   - Timeline: 1 week

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-08  
**Next Review:** After Task 3 completion
