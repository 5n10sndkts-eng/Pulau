# Task 2.8: Verify All Integrations in Production

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Quality Assurance

## Task Description

Comprehensive end-to-end validation of all third-party integrations and critical user flows in the production environment.

## Acceptance Criteria

- [ ] Supabase integration verified (auth, database, edge functions)
- [ ] Stripe payment flow tested end-to-end
- [ ] Email delivery confirmed (Resend)
- [ ] QR code generation working
- [ ] PWA functionality validated
- [ ] All vendor workflows tested
- [ ] Performance benchmarks met
- [ ] No errors in production logs

## Integration Tests

### 1. Supabase Integration

**Authentication:**
```bash
# Test signup
curl -X POST https://pulau.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login
# Test password reset
# Test social login (if implemented)
```

**Database Queries:**
```typescript
// Test from browser console
const { data, error } = await supabase
  .from('experiences')
  .select('*')
  .limit(10)

console.log('Experiences:', data)
// Should return data without RLS violations
```

**Edge Functions:**
```bash
# Test each function
curl https://[project-ref].supabase.co/functions/v1/checkout \
  -H "Authorization: Bearer [ANON-KEY]" \
  -H "Content-Type: application/json" \
  -d '{"tripId":"test"}'

# Expected functions to test:
# - checkout
# - stripe-webhook
# - send-email
# - vendor-onboard
# - generate-qr
# - create-booking
# - handle-refund
# - get-analytics
# - health-check
```

**Realtime:**
```typescript
// Test realtime subscriptions
const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, payload => {
    console.log('Change:', payload)
  })
  .subscribe()

// Create a booking and verify update received
```

### 2. Stripe Integration

**Test Checkout Flow:**
1. Add experience to trip
2. Navigate to checkout
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete payment
5. Verify:
   - Payment succeeded
   - Booking created
   - Platform fee deducted
   - Vendor account credited
   - Webhook received

**Test Cases:**
```typescript
// Test cards for different scenarios
const testCards = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  insufficientFunds: '4000 0000 0000 9995',
  expired: '4000 0000 0000 0069',
  requiresAuth: '4000 0025 0000 3155',
}

// Test each scenario
```

**Verify in Stripe Dashboard:**
- [ ] Payment visible in Payments
- [ ] Platform fee calculated correctly (15%)
- [ ] Connected account received payout
- [ ] Webhook events logged

**Test Refunds:**
```bash
# Trigger refund
curl -X POST https://pulau.app/api/bookings/[ID]/refund \
  -H "Authorization: Bearer [TOKEN]"

# Verify:
# - Refund processed in Stripe
# - Booking status updated
# - Customer refund email sent
```

### 3. Email Delivery (Resend)

**Test Booking Confirmation:**
1. Complete a test booking
2. Check email inbox within 30 seconds
3. Verify:
   - Email received
   - Subject correct
   - Template rendered properly
   - QR code attached
   - Links work
   - PDF ticket attached

**Test Email Rendering:**
- Gmail (desktop)
- Gmail (mobile)
- Outlook (desktop)
- Apple Mail (iOS)
- Dark mode

**Check Resend Dashboard:**
- [ ] Email marked as delivered
- [ ] No bounces
- [ ] Delivery time < 30 seconds

**Test Email Failure Handling:**
1. Use invalid email address
2. Verify:
   - Booking still created
   - Error logged
   - Manual resend button available

### 4. Vendor Workflows

**Vendor Onboarding:**
1. Create vendor account
2. Complete Stripe Connect onboarding
3. Verify:
   - Stripe account linked
   - Onboarding complete
   - Can create experiences

**Experience Management:**
1. Create new experience
2. Set availability
3. Publish experience
4. Verify visible in search

**Vendor Dashboard:**
1. View upcoming bookings
2. Check revenue analytics
3. View payout schedule
4. Verify real-time updates

**Vendor Payouts:**
- [ ] Payout schedule configured (daily)
- [ ] First payout pending (after 2-day hold)
- [ ] Payout history visible

### 5. Customer Workflows

**Search & Discovery:**
1. Search for experiences
2. Filter by date, price, category
3. View experience details
4. Read reviews
5. Check availability

**Trip Planning:**
1. Add experiences to trip
2. Build multi-day itinerary
3. See sticky trip bar
4. View trip total
5. Remove items

**Booking Process:**
1. Initiate checkout
2. Enter customer details
3. Complete payment
4. Receive confirmation
5. Download PDF ticket

**Account Management:**
1. View booking history
2. Manage profile
3. Update payment methods
4. Cancel booking (if within policy)
5. Request refund

### 6. QR Code System

**QR Generation:**
```bash
# Test QR code generation
curl https://[project-ref].supabase.co/functions/v1/generate-qr \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
  -d '{"bookingId":"test-123"}'

# Verify QR code image returned
```

**QR Scanning:**
1. Open vendor app/scanner
2. Scan QR code from booking email
3. Verify:
   - Booking details displayed
   - Check-in recorded
   - Customer notified

**Security:**
- [ ] QR codes are unique per booking
- [ ] Expired bookings rejected
- [ ] Already used QR codes flagged
- [ ] Tampering detection works

### 7. PWA Functionality

**Installation:**
1. Visit site on mobile
2. See "Add to Home Screen" prompt
3. Install PWA
4. Launch from home screen
5. Verify full-screen mode

**Offline Support:**
1. Open PWA
2. Enable airplane mode
3. Navigate app
4. Verify cached content loads
5. See offline indicator

**Service Worker:**
```typescript
// Check registration
navigator.serviceWorker.getRegistrations()
  .then(registrations => {
    console.log('Service Workers:', registrations)
  })

// Verify caching
caches.keys().then(keys => {
  console.log('Cache keys:', keys)
})
```

**Push Notifications (if implemented):**
- [ ] Permission prompt appears
- [ ] Test notification received
- [ ] Click notification opens app

### 8. Analytics & Monitoring

**Sentry Error Tracking:**
```typescript
// Trigger test error
Sentry.captureException(new Error('Production test error'))

// Verify in Sentry dashboard:
// - Error captured
// - Source maps working
// - User context attached
// - Environment = production
```

**Vercel Analytics:**
- [ ] Pageviews tracked
- [ ] Web Vitals captured
- [ ] Bounce rate reasonable

**Supabase Logs:**
```bash
# Check for errors
supabase functions logs --tail 100

# Look for:
# - No 500 errors
# - Fast response times (< 500ms)
# - No authentication failures
```

## Performance Benchmarks

### Load Time Targets
- **Initial page load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Database Performance
```sql
-- Run in production
EXPLAIN ANALYZE
SELECT * FROM experiences 
WHERE published = true 
ORDER BY created_at DESC 
LIMIT 20;

-- Should execute in < 50ms
```

### API Response Times
- Edge Functions: < 500ms
- Database queries: < 100ms
- Stripe API calls: < 1000ms
- Email sending: < 2000ms

## Security Validation

### RLS Policies
```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM bookings; -- Should return 0 rows

-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM bookings WHERE user_id = auth.uid(); -- Should return own bookings only
```

### HTTPS & Headers
```bash
# Verify security headers
curl -I https://pulau.app | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options)"

# Test CSP
# Should not see CSP violations in browser console
```

### Authentication
- [ ] Password requirements enforced
- [ ] JWT tokens expire correctly
- [ ] Session timeout works
- [ ] No auth bypass possible

## Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run scripts/load-test.js

# Test scenarios:
# - 10 concurrent users browsing
# - 5 concurrent checkouts
# - 100 requests/minute sustained
# - Spike to 500 requests/minute
```

Example `scripts/load-test.js`:
```javascript
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up
    { duration: '5m', target: 10 },  // Sustained
    { duration: '2m', target: 50 },  // Spike
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% < 500ms
    'http_req_failed': ['rate<0.01'],   // < 1% errors
  },
}

export default function() {
  const res = http.get('https://pulau.app/experiences')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

## Validation Checklist

### Critical Flows ✅
- [ ] User signup and login
- [ ] Browse and search experiences
- [ ] Add to trip and checkout
- [ ] Payment processing
- [ ] Booking confirmation email
- [ ] Vendor dashboard access
- [ ] QR code generation
- [ ] PWA installation

### Integrations ✅
- [ ] Supabase auth working
- [ ] Database queries fast
- [ ] Edge Functions responding
- [ ] Stripe payments processing
- [ ] Resend emails delivering
- [ ] Sentry errors tracking
- [ ] Analytics capturing data

### Performance ✅
- [ ] Lighthouse score > 90
- [ ] Load time < 2 seconds
- [ ] Database queries < 100ms
- [ ] API responses < 500ms
- [ ] No memory leaks
- [ ] Service worker caching

### Security ✅
- [ ] HTTPS enforced
- [ ] RLS policies active
- [ ] No auth bypasses
- [ ] Secrets not exposed
- [ ] CSP configured
- [ ] Rate limiting works

## Related Files

- `scripts/load-test.js` (create)
- `tests/integration/production.spec.ts` (create)
- `docs/integration-validation.md` (create)

## Estimated Time

2-3 hours

## Dependencies

- Task 2.7 (Production deployed)
- All integrations configured
- Test accounts ready

## Success Validation

- [ ] All critical flows work end-to-end
- [ ] All integrations responding correctly
- [ ] Performance benchmarks met
- [ ] Load test passes
- [ ] Zero critical errors in logs
- [ ] Security validation passes

## Issues Found

Document any issues discovered:
```markdown
## Issue Log

### Issue 1: [Title]
- Severity: P0/P1/P2
- Description: ...
- Steps to reproduce: ...
- Fix: ...
- Status: Fixed/In Progress/Deferred

...
```

## Sign-off

- [ ] Engineering lead approval
- [ ] Product owner approval
- [ ] QA sign-off
- [ ] Security review complete

---

**Once all items checked, production is verified and ready for launch! 🚀**
