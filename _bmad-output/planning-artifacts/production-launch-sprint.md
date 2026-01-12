# Production-Ready Launch Sprint
**Sprint Duration**: January 13 - February 2, 2026 (3 weeks)  
**Sprint Goal**: Production deployment with all critical systems operational  
**Scrum Master**: Bob  
**Product Owner**: Moe

---

## Sprint Overview

This sprint delivers a **production-ready launch** with:
- ✅ Full production infrastructure (Supabase + Vercel + Domain)
- ✅ Email notifications system (booking confirmations)
- ✅ Error monitoring & alerting (Sentry)
- ✅ All P1 stub functions implemented
- ✅ Core service test coverage
- ✅ Security audit & load testing
- ✅ Staging environment for final validation

**Launch Date Target**: February 2, 2026

---

## Week 1: Infrastructure & Email System (Jan 13-19)

### **Day 1 (Mon): Production Environment Setup**

#### Morning: Supabase Production
- [ ] Create production Supabase project
- [ ] Run all 17 migrations in order
- [ ] Verify schema matches development
- [ ] Test RLS policies with production data
- [ ] Configure connection pooling
- [ ] Set up daily backups

**Deliverable**: Production database live and verified

#### Afternoon: Stripe Production
- [ ] Activate Stripe production account
- [ ] Complete business verification (if needed)
- [ ] Configure Stripe Connect platform settings
- [ ] Generate production API keys
- [ ] Set up webhook endpoints (production URLs)
- [ ] Test Connect account creation flow

**Deliverable**: Stripe ready for real payments

**Story References**: 2.1, 2.2, 2.4

---

### **Day 2 (Tue): Deployment & Configuration**

#### Morning: Vercel Deployment
- [ ] Create Vercel production project
- [ ] Configure build settings (Vite + React)
- [ ] Deploy initial production build
- [ ] Verify all routes work
- [ ] Test Edge Functions deployment
- [ ] Configure CDN caching rules

**Deliverable**: App live on Vercel (temp domain)

#### Afternoon: Domain & Environment Variables
- [ ] Purchase/configure pulau.app domain
- [ ] Set up DNS records (A, CNAME)
- [ ] Configure SSL certificate (auto via Vercel)
- [ ] Audit all required environment variables
- [ ] Set production env vars in Vercel
- [ ] Set Edge Function secrets (Supabase, Stripe, Resend)
- [ ] Test production build with real env vars

**Deliverable**: pulau.app live with HTTPS

**Story References**: 2.3, 2.5, 2.6, 2.7

---

### **Day 3 (Wed): Email Integration - Part 1**

#### Morning: Resend Setup
- [ ] Create Resend account
- [ ] Configure sending domain (noreply@pulau.app)
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Verify domain authentication
- [ ] Get production API key
- [ ] Test send via Resend dashboard

**Deliverable**: Resend configured and verified

#### Afternoon: send-email Edge Function
- [ ] Install @resend/node in Edge Function
- [ ] Replace stub with real Resend integration
- [ ] Add email template rendering
- [ ] Implement error handling & logging
- [ ] Add retry logic for failures
- [ ] Test function locally
- [ ] Deploy to production

**Deliverable**: Email sending infrastructure works

**Story References**: 30.1.1, 30.1.3

---

### **Day 4 (Thu): Email Templates & Testing**

#### Morning: Template Development
- [ ] Create booking confirmation HTML template
- [ ] Make mobile-responsive (80%+ mobile users)
- [ ] Add booking details (reference, date, items, total)
- [ ] Include QR code or booking reference
- [ ] Create cancellation email template
- [ ] Create reminder email template (24hrs before)
- [ ] Test rendering in major email clients

**Deliverable**: Professional email templates

#### Afternoon: Integration Testing
- [ ] Add email trigger after payment.succeeded
- [ ] Test confirmation email delivery
- [ ] Verify email appears in inbox (not spam)
- [ ] Test all template variables populate
- [ ] Check mobile rendering on real devices
- [ ] Verify links work (unsubscribe, view booking)

**Deliverable**: Emails sending reliably

**Story References**: 30.1.2, 30.1.4

---

### **Day 5 (Fri): Email Validation & Monitoring**

#### All Day: End-to-End Email Testing
- [ ] Complete 10 test bookings
- [ ] Verify 100% delivery rate
- [ ] Check spam scores (aim for <5)
- [ ] Test with Gmail, Outlook, Apple Mail
- [ ] Verify timing (emails arrive <30s)
- [ ] Test failure scenarios (invalid email)
- [ ] Set up email delivery monitoring
- [ ] Document email troubleshooting runbook

**Deliverable**: Email system production-ready (99%+ delivery)

**Story References**: 30.1.5, 2.8

**Week 1 Milestone**: ✅ Production infrastructure + Email notifications working

---

## Week 2: Monitoring & Stub Implementation (Jan 20-26)

### **Day 1 (Mon): Error Monitoring Setup**

#### Morning: Sentry Installation
- [ ] Create Sentry project
- [ ] Install @sentry/react + @sentry/vite-plugin
- [ ] Configure Sentry.init() in main.tsx
- [ ] Set environment tags (production/staging)
- [ ] Add user context tracking
- [ ] Test error capture locally

**Deliverable**: Sentry SDK integrated

#### Afternoon: Error Boundaries
- [ ] Create root ErrorBoundary component
- [ ] Wrap Checkout flow in boundary
- [ ] Wrap TripBuilder in boundary
- [ ] Wrap ExperienceDetail in boundary
- [ ] Add fallback UI for errors
- [ ] Test error boundary triggers
- [ ] Verify errors appear in Sentry

**Deliverable**: Graceful error handling

**Story References**: 32.1.1, 32.1.2

---

### **Day 2 (Tue): Monitoring Configuration**

#### Morning: Sourcemaps & Performance
- [ ] Configure vite-plugin-sentry for sourcemap upload
- [ ] Verify readable stack traces in Sentry
- [ ] Set up performance monitoring
- [ ] Track Web Vitals (LCP, FID, CLS)
- [ ] Add custom performance marks
- [ ] Test sourcemap resolution

**Deliverable**: Readable production errors

#### Afternoon: Alert Rules
- [ ] Configure Slack integration for Sentry
- [ ] Set up critical error alerts (email + Slack)
- [ ] Configure alert thresholds
- [ ] Set up daily error digest
- [ ] Test alert delivery
- [ ] Create on-call rotation (if applicable)

**Deliverable**: Proactive error monitoring

**Story References**: 32.1.3, 32.1.6

---

### **Day 3 (Wed): P1 Stub Functions - Part 1**

#### Morning: Refund Processing
- [ ] Install stripe SDK in process-refund function
- [ ] Replace stub with real Stripe refund call
- [ ] Update payment record status
- [ ] Update booking status to 'refunded'
- [ ] Create audit log entry
- [ ] Add idempotency key handling
- [ ] Test refund flow end-to-end

**Deliverable**: Refunds actually process

#### Afternoon: QR Code Scanner
- [ ] Install jsQR or html5-qrcode library
- [ ] Implement detectQRCode() in QRScanner.tsx
- [ ] Add camera permission handling
- [ ] Extract booking ID from QR data
- [ ] Add error handling for invalid QR codes
- [ ] Test with real QR codes (generated tickets)

**Deliverable**: Vendors can scan tickets

**Defect References**: DEF-005, DEF-006

---

### **Day 4 (Thu): Testing & Validation**

#### Morning: Unit Test Coverage
- [ ] Create src/__tests__/slotService.test.ts
- [ ] Test atomic decrement logic
- [ ] Test concurrency scenarios (race conditions)
- [ ] Test error handling
- [ ] Test availability calculations
- [ ] Run coverage report (aim for >80%)

**Deliverable**: Core transaction logic tested

#### Afternoon: Checkout Validation
- [ ] Add slot availability check before payment
- [ ] Show sold-out error if unavailable
- [ ] Prevent double-booking race condition
- [ ] Test concurrent checkout scenarios
- [ ] Add loading state during validation
- [ ] Log validation failures for monitoring

**Deliverable**: No overbookings possible

**Defect References**: DEF-008, DEF-009

---

### **Day 5 (Fri): Security & Reliability**

#### Morning: RLS Policy Audit
- [ ] Review all audit_logs RLS policies
- [ ] Add missing policies (if any)
- [ ] Test unauthorized access attempts
- [ ] Verify vendor data isolation
- [ ] Check customer PII protection
- [ ] Document RLS policy decisions

**Deliverable**: Data access secured

#### Afternoon: Webhook Reliability
- [ ] Add exponential backoff for payment webhooks
- [ ] Implement idempotency handling
- [ ] Add webhook retry queue
- [ ] Test failed webhook recovery
- [ ] Monitor webhook success rate
- [ ] Document webhook troubleshooting

**Deliverable**: Reliable payment processing

**Defect References**: DEF-010, DEF-012

**Week 2 Milestone**: ✅ Monitoring + All P1 gaps fixed

---

## Week 3: Testing & Launch (Jan 27 - Feb 2)

### **Day 1 (Mon): Staging Environment**

#### All Day: Staging Setup
- [ ] Create staging Supabase project
- [ ] Clone production migrations to staging
- [ ] Create Vercel preview deployment
- [ ] Set up staging.pulau.app subdomain
- [ ] Configure staging Stripe (test mode)
- [ ] Configure staging Resend (test domain)
- [ ] Seed realistic test data
- [ ] Document staging access

**Deliverable**: Staging environment ready

**Story Reference**: 2.8

---

### **Day 2 (Tue): End-to-End Testing**

#### All Day: Production Flow Testing
- [ ] Test complete booking flow (staging)
  - Browse experiences
  - Add to trip
  - Checkout with test card
  - Receive confirmation email
  - Verify ticket generation
- [ ] Test vendor operations flow
  - Create slot
  - Receive booking notification
  - Scan QR code (check-in)
  - View payout status
- [ ] Test error scenarios
  - Invalid payment
  - Sold-out slot
  - Network failures
  - Session expiry
- [ ] Test across browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)

**Deliverable**: All critical flows validated

---

### **Day 3 (Wed): Security & Performance Audit**

#### Morning: Security Review
- [ ] Audit all environment variables
- [ ] Check for exposed API keys in code
- [ ] Test unauthorized data access
- [ ] Review CORS configurations
- [ ] Test authentication edge cases
- [ ] Review payment security (PCI compliance)
- [ ] Document security posture

**Deliverable**: Security vulnerabilities addressed

#### Afternoon: Performance Testing
- [ ] Run Lighthouse audit (aim for >90 score)
- [ ] Test Core Web Vitals
- [ ] Load test concurrent bookings (10 simultaneous)
- [ ] Test atomic inventory under load
- [ ] Measure API response times
- [ ] Check bundle size optimization
- [ ] Test slow 3G network conditions

**Deliverable**: Performance meets standards

---

### **Day 4 (Thu): Documentation & Runbooks**

#### All Day: Knowledge Transfer
- [ ] Create deployment runbook
  - Build & deploy process
  - Rollback procedure
  - Database migration steps
- [ ] Document environment variables
- [ ] Create incident response guide
  - Payment failures
  - Email delivery issues
  - Database connection problems
- [ ] Write vendor onboarding guide
- [ ] Create customer support FAQ
- [ ] Document monitoring dashboards
- [ ] Record Loom walkthrough videos

**Deliverable**: Complete operational docs

---

### **Day 5 (Fri): LAUNCH DAY 🚀**

#### Morning: Final Checks
- [ ] Run full test suite (unit + E2E)
- [ ] Verify all env vars set in production
- [ ] Check Stripe production keys active
- [ ] Verify email DNS records
- [ ] Test Sentry error capture
- [ ] Review Lighthouse score (production)
- [ ] Backup production database

**Go/No-Go Decision Criteria**:
- ✅ Zero TypeScript errors
- ✅ 95%+ test pass rate
- ✅ Email delivery >99%
- ✅ All critical flows work end-to-end
- ✅ Sentry capturing errors
- ✅ Lighthouse score >90
- ✅ Security audit passed

#### Afternoon: Launch
- [ ] Deploy final production build
- [ ] Verify deployment successful
- [ ] Complete 3 real test bookings
- [ ] Monitor Sentry for errors (1 hour)
- [ ] Check email delivery
- [ ] Monitor payment webhooks
- [ ] Announce launch 🎉

**Deliverable**: PULAU IS LIVE! 🚀

---

## Success Metrics (Week 1 Post-Launch)

**Technical Health**:
- Error rate < 1%
- Email delivery > 99%
- Payment success rate > 95%
- API response time < 500ms (p95)
- Zero critical Sentry alerts

**Business Metrics**:
- Track first 10 real bookings
- Monitor conversion funnel
- Collect user feedback
- Measure vendor adoption

---

## Risk Mitigation

**High-Risk Areas**:
1. **Payment Processing**: Test thoroughly with Stripe test cards
2. **Email Deliverability**: Monitor spam scores, use Resend best practices
3. **Concurrent Bookings**: Load test atomic inventory extensively
4. **RLS Policies**: Triple-check vendor data isolation

**Rollback Plan**:
- Keep previous Vercel deployment ready
- Database migrations are reversible
- Feature flags for risky features
- Staging environment for testing fixes

---

## Daily Standups

**Time**: 9:00 AM daily  
**Duration**: 15 minutes

**Format**:
- What I completed yesterday
- What I'm working on today
- Any blockers

**Scrum Master (Bob) Responsibilities**:
- Update sprint-status.yaml daily
- Track todo list progress
- Unblock dependencies
- Facilitate retrospective after launch

---

## Definition of Done (Per Story)

✅ Code implemented and reviewed  
✅ Unit tests written (where applicable)  
✅ E2E test passing (for user-facing features)  
✅ TypeScript errors: zero  
✅ Deployed to staging and validated  
✅ Documentation updated  
✅ Security considerations addressed  

---

## Launch Checklist (Print & Post)

**Infrastructure**:
- [ ] Production Supabase live
- [ ] Production Stripe configured
- [ ] Vercel deployment working
- [ ] pulau.app domain active with SSL
- [ ] All env vars set

**Email System**:
- [ ] Resend DNS verified
- [ ] Email templates tested
- [ ] Confirmation emails sending
- [ ] Delivery rate >99%

**Monitoring**:
- [ ] Sentry capturing errors
- [ ] Alerts configured
- [ ] Performance monitoring active
- [ ] Sourcemaps uploading

**Critical Fixes**:
- [ ] Refund processing works
- [ ] QR scanner works
- [ ] Slot validation prevents overbooking
- [ ] RLS policies secure

**Testing**:
- [ ] Full E2E test passed
- [ ] Security audit complete
- [ ] Load testing passed
- [ ] Mobile testing done

**Documentation**:
- [ ] Deployment runbook ready
- [ ] Incident response guide written
- [ ] Vendor onboarding guide created

---

**Next**: Start Day 1 tasks → Production Supabase Setup! 🚀
