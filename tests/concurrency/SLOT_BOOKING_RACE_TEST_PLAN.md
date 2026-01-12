# Concurrency Test Plan for Atomic Slot Booking

**Test File**: `tests/concurrency/slot-booking-race.test.ts`  
**Target**: Atomic slot reservation in `supabase/functions/checkout/index.ts`  
**Status**: Manual testing required (Edge Functions deployment needed)

## Test Scenarios

### TEST-1: Two Concurrent Requests for Last Spot
**Setup**:
- Create slot with `available_count = 1`
- Fire 2 concurrent checkout requests for 1 guest each

**Expected**:
- Exactly 1 request succeeds (gets Stripe session URL)
- Exactly 1 request fails with 409 Conflict
- Failed request gets message: "no longer available for 1 guest"
- Final `available_count = 0` (not negative)

**Verification**:
```sql
SELECT available_count FROM experience_slots WHERE id = '<slot_id>';
-- Should be 0, never -1
```

### TEST-2: Three Concurrent Requests for Two Spots
**Setup**:
- Create slot with `available_count = 2`
- Fire 3 concurrent checkout requests for 1 guest each

**Expected**:
- Exactly 2 requests succeed
- Exactly 1 request fails with 409 Conflict
- Final `available_count = 0`

### TEST-3: High Concurrency (10 Requests for 5 Spots)
**Setup**:
- Create slot with `available_count = 5`
- Fire 10 concurrent checkout requests for 1 guest each

**Expected**:
- Exactly 5 requests succeed
- Exactly 5 requests fail with 409 Conflict
- Final `available_count = 0`
- No negative inventory at any point

### TEST-4: Multi-Guest Concurrent Bookings
**Setup**:
- Create slot with `available_count = 5`
- Fire 3 concurrent requests:
  - Request A: 2 guests
  - Request B: 2 guests
  - Request C: 2 guests (should fail)

**Expected**:
- Requests A and B succeed (order doesn't matter)
- Request C fails with 409 Conflict
- Final `available_count = 1` (5 - 2 - 2 = 1)

### TEST-5: Stripe Failure Rollback
**Setup**:
- Create slot with `available_count = 3`
- Mock Stripe to fail after slot reservation

**Expected**:
- Checkout fails with Stripe error
- Rollback function called
- Final `available_count = 3` (restored)
- Audit log shows "slots_rolled_back: 1"

### TEST-6: No Negative Inventory Under Load
**Setup**:
- Create slot with `available_count = 1`
- Fire 50 concurrent checkout requests

**Expected**:
- Exactly 1 request succeeds
- 49 requests fail with 409 Conflict
- Final `available_count = 0` (NEVER negative)
- Query to verify: `SELECT MIN(available_count) FROM experience_slots` → should be >= 0

### TEST-7: Webhook Skips Decrement (No Double-Decrement)
**Setup**:
- Create slot with `available_count = 5`
- Successful checkout (atomic reservation happens)
- Webhook receives `checkout.session.completed`

**Expected**:
- Checkout decrements: `5 → 3` (reserved 2 spots)
- Webhook detects `slots_reserved = 'true'` in metadata
- Webhook logs: "Slots already atomically reserved in checkout, skipping decrement"
- Final `available_count = 3` (decremented once, not twice)

### TEST-8: Legacy Path (Old Bookings Without Atomic Reservation)
**Setup**:
- Simulate old checkout session without `slots_reserved` metadata
- Webhook receives `checkout.session.completed`

**Expected**:
- Webhook logs: "Decrementing slots in webhook (legacy path)"
- Webhook decrements slots as before
- Backward compatibility maintained

## Manual Testing Steps

### 1. Deploy Edge Functions
```bash
supabase functions deploy checkout
supabase functions deploy webhook-stripe
```

### 2. Test Concurrent Requests (using Artillery or k6)

**artillery.yml**:
```yaml
config:
  target: 'https://<project-ref>.supabase.co'
  phases:
    - duration: 5
      arrivalRate: 10  # 10 concurrent requests per second
      
scenarios:
  - name: "Checkout Concurrent Booking"
    flow:
      - post:
          url: "/functions/v1/checkout"
          headers:
            Authorization: "Bearer <anon-key>"
            Content-Type: "application/json"
          json:
            tripId: "<test-trip-id>"
```

Run:
```bash
artillery run artillery.yml
```

### 3. Verify Results

**Check for negative inventory**:
```sql
SELECT id, experience_id, slot_date, slot_time, available_count
FROM experience_slots
WHERE available_count < 0;
-- Should return 0 rows
```

**Check audit logs**:
```sql
SELECT event_type, metadata
FROM audit_logs
WHERE event_type IN ('checkout.failed', 'checkout.stripe_error')
ORDER BY created_at DESC
LIMIT 20;
```

**Check Stripe sessions created**:
```sql
SELECT COUNT(DISTINCT stripe_checkout_session_id) as unique_sessions
FROM payments
WHERE created_at > NOW() - INTERVAL '10 minutes';
```

## Success Criteria

✅ No negative `available_count` values  
✅ Exactly N checkouts succeed for N available spots  
✅ Failed requests return 409 Conflict (not 500 error)  
✅ Rollback works if Stripe fails  
✅ Webhook skips decrement when `slots_reserved = 'true'`  
✅ Audit logs show correct error types  
✅ Load test (50 concurrent) shows 0 double-bookings

## Regression Tests

After deployment, run:
1. **Functional test**: Book 1 experience successfully
2. **Inventory test**: Check slot count decremented by 1
3. **Payment test**: Check payment record created
4. **Email test**: Check confirmation email sent (if applicable)

---

**Note**: Full automated tests require:
- Supabase local development setup
- Edge Function test harness
- Mock Stripe sessions
- Transaction isolation testing

For now, use manual testing with real deployments and monitoring.
