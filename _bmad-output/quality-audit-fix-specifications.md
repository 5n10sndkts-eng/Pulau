# Quality Audit - Fix Specifications

**Generated**: January 12, 2026  
**Project**: Pulau  
**Audit Phase**: Post-Story Completion Quality Review

---

## 🚨 PHASE 1: CRITICAL SECURITY FIXES (BLOCKING)

### **FIX-001: Add Password Validation**

**Priority**: P0 - CRITICAL  
**Effort**: 2 hours  
**Risk**: Account compromise via weak passwords

#### **Current State**

**File**: `src/lib/authService.ts` line 131

```typescript
register: async (
  name: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<User> => {
  // ... no validation before this point
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.signUp({
    email,
    password, // ⚠️ Accepts ANY password
  });
};
```

#### **Root Cause**

- No client-side validation before Supabase call
- Story 2.1 AC requires "Password must be at least 8 characters"
- Supabase has server-side validation, but no user-friendly client error

#### **Proposed Solution**

**Step 1**: Create validation utility

```typescript
// src/lib/validation.ts (NEW FILE)
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (password.length > 0 && !PASSWORD_REGEX.test(password)) {
    errors.push(
      'Password must contain uppercase, lowercase, number, and special character',
    );
  }

  if (password.includes(' ')) {
    errors.push('Password cannot contain spaces');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Step 2**: Update authService

```typescript
// src/lib/authService.ts
import { validatePassword } from './validation'

register: async (name: string, email: string, password: string, ...): Promise<User> => {
  // Add validation BEFORE mock check
  const validation = validatePassword(password)
  if (!validation.valid) {
    throw new Error(validation.errors[0]) // Throw first error
  }

  if (USE_MOCK_AUTH) {
    // ... existing mock code
  }

  // Real Supabase Register
  const { data: { user: authUser }, error } = await supabase.auth.signUp({
    email,
    password,
    // ...
  });
}
```

**Step 3**: Update UI components

```typescript
// src/components/auth/RegisterScreen.tsx (if exists, or similar)
import { validatePassword } from '@/lib/validation';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Client-side validation for immediate feedback
  const validation = validatePassword(password);
  if (!validation.valid) {
    toast.error(validation.errors.join('\n'));
    return;
  }

  // Proceed with registration
  try {
    await authService.register(name, email, password);
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### **Testing Requirements**

1. Unit test for validatePassword with edge cases:
   - Empty string
   - 7 characters (too short)
   - 8 characters (minimum)
   - No uppercase
   - No numbers
   - No special chars
   - Spaces in password
   - Valid password

2. Integration test for register flow:
   - Attempt registration with weak password
   - Verify error message displayed
   - Verify no Supabase call made

#### **Acceptance Criteria**

- [ ] Password validation rejects passwords < 8 chars
- [ ] Password validation requires complexity (upper, lower, digit, special)
- [ ] Validation errors display to user immediately
- [ ] No Supabase call made if validation fails
- [ ] Unit tests pass with 100% coverage
- [ ] Story 2.1 AC compliance verified

#### **Migration Notes**

- **Breaking Change**: Existing users with weak passwords unaffected (already in DB)
- **Backward Compat**: Only affects new registrations
- **Rollout**: Can deploy immediately, no data migration needed

---

### **FIX-002: Fix Atomic Slot Booking Race Condition**

**Priority**: P0 - CRITICAL  
**Effort**: 4 hours  
**Risk**: Double-booking, revenue loss, customer disputes

#### **Current State**

**File**: `supabase/functions/checkout/index.ts` lines 304-346

```typescript
// Step 5: Validate Inventory
const { data: slot, error: slotError } = await supabase
  .from('experience_slots')
  .select('id, available_count, is_blocked')
  .eq('experience_id', item.experience_id)
  .eq('slot_date', item.date)
  .eq('slot_time', item.time)
  .single();

// ⚠️ GAP: Another request can read same value here

if (slot) {
  const guestCount = item.guests || 1;
  if (slot.available_count < guestCount) {
    return errorResponse(
      'Not enough availability',
      'INSUFFICIENT_INVENTORY',
      400,
    );
  }
}

// ⚠️ PROBLEM: Later code decrements inventory WITHOUT checking again
```

#### **Root Cause**

Classic **read-check-write race condition**:

1. Request A reads `available_count = 2`
2. Request B reads `available_count = 2` (same value)
3. Both check `2 >= 2` (passes)
4. Both decrement by 2
5. Result: `available_count = -2` (overbooking!)

#### **Proposed Solution**

**Option A: Atomic UPDATE with RETURNING (Recommended)**

```typescript
// supabase/functions/checkout/index.ts

// Replace non-atomic check with atomic decrement
const guestCount = item.guests || 1;

const { data: updatedSlot, error: decrementError } = await supabase
  .from('experience_slots')
  .update({
    available_count: supabase.raw(`available_count - ${guestCount}`),
  })
  .eq('id', slot.id)
  .eq('experience_id', item.experience_id)
  .eq('slot_date', item.date)
  .eq('slot_time', item.time)
  .gte('available_count', guestCount) // ⭐ CRITICAL: Only update if enough capacity
  .select('id, available_count')
  .single();

if (decrementError || !updatedSlot) {
  // Atomic decrement failed - either not enough inventory or concurrent update
  await createAuditLog(supabase, {
    eventType: 'checkout.failed',
    entityType: 'trip',
    entityId: tripId,
    actorId: user.id,
    actorType: 'user',
    metadata: {
      error: 'Inventory unavailable (atomic check failed)',
      experience_id: item.experience_id,
      requested: guestCount,
      slot_id: slot?.id,
    },
  });

  return errorResponse(
    `"${experience.title}" is no longer available for ${guestCount} guests. Please try a different time.`,
    'INVENTORY_EXHAUSTED',
    409, // 409 Conflict
  );
}

// ✅ At this point, inventory is GUARANTEED reserved
console.log(
  `Reserved ${guestCount} spots, new available_count: ${updatedSlot.available_count}`,
);
```

**Option B: Postgres RPC with Explicit Locking (Alternative)**

```sql
-- supabase/migrations/YYYYMMDD_create_atomic_reserve_slot.sql
CREATE OR REPLACE FUNCTION reserve_slot_inventory(
  p_slot_id UUID,
  p_guest_count INTEGER
) RETURNS TABLE(success BOOLEAN, new_available_count INTEGER) AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Lock row for update (prevents concurrent modifications)
  SELECT available_count INTO v_current_count
  FROM experience_slots
  WHERE id = p_slot_id
  FOR UPDATE; -- ⭐ Exclusive lock

  IF v_current_count IS NULL THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  IF v_current_count < p_guest_count THEN
    RETURN QUERY SELECT FALSE, v_current_count;
    RETURN;
  END IF;

  -- Decrement and return new value
  UPDATE experience_slots
  SET available_count = available_count - p_guest_count
  WHERE id = p_slot_id;

  RETURN QUERY SELECT TRUE, (v_current_count - p_guest_count);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Use RPC in checkout function
const { data: reservation, error: rpcError } = await supabase
  .rpc('reserve_slot_inventory', {
    p_slot_id: slot.id,
    p_guest_count: guestCount,
  })
  .single();

if (rpcError || !reservation || !reservation.success) {
  return errorResponse('Inventory unavailable', 'INVENTORY_EXHAUSTED', 409);
}
```

#### **Testing Requirements**

**Concurrency Test (Critical)**:

```typescript
// tests/concurrency/slot-booking-race.test.ts
import { describe, it, expect } from 'vitest';

describe('Slot Booking Concurrency', () => {
  it('should prevent double-booking under concurrent requests', async () => {
    // Setup: Create slot with available_count = 1
    const slotId = await createTestSlot({ available_count: 1 });

    // Execute: Fire 2 concurrent checkout requests for 1 guest each
    const [result1, result2] = await Promise.allSettled([
      checkout({ slotId, guests: 1 }),
      checkout({ slotId, guests: 1 }),
    ]);

    // Assert: Exactly ONE should succeed, ONE should fail
    const successes = [result1, result2].filter(
      (r) => r.status === 'fulfilled',
    ).length;
    const failures = [result1, result2].filter(
      (r) => r.status === 'rejected',
    ).length;

    expect(successes).toBe(1);
    expect(failures).toBe(1);

    // Verify final state: available_count = 0
    const finalSlot = await getSlot(slotId);
    expect(finalSlot.available_count).toBe(0);
  });
});
```

**Load Test**:

```bash
# Use k6 or Artillery for load testing
artillery quick --count 50 --num 2 https://your-checkout-endpoint
# Should show 0 double-bookings in metrics
```

#### **Acceptance Criteria**

- [ ] Atomic UPDATE with WHERE clause implemented
- [ ] Concurrency test passes (0 double-bookings in 100 trials)
- [ ] Error handling returns 409 Conflict on race condition
- [ ] Audit log records inventory exhaustion events
- [ ] Load test shows no overbookings under 50 concurrent requests
- [ ] Rollback plan documented (revert to previous code + manual slot reconciliation)

#### **Rollback Plan**

If atomic update causes issues:

1. Revert checkout function to previous version
2. Run inventory reconciliation script:
   ```sql
   -- Find and fix negative inventory
   UPDATE experience_slots
   SET available_count = 0
   WHERE available_count < 0;
   ```
3. Enable monitoring alert for negative inventory
4. Schedule fix retry in next sprint

---

### **FIX-003: Remove/Guard Mock Auth in Production**

**Priority**: P0 - CRITICAL  
**Effort**: 1 hour  
**Risk**: Complete authentication bypass

#### **Current State**

**File**: `src/lib/authService.ts` line 15

```typescript
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (USE_MOCK_AUTH) {
      // ⚠️ Production risk if env var set
      // ... mock login that bypasses all security
    }
    // Real auth
  },
};
```

**Environment File** (`.env.example`):

```bash
VITE_USE_MOCK_AUTH=true  # ⚠️ Dangerous default
```

#### **Root Cause**

- Runtime environment variable can enable mock mode in production
- No build-time guard prevents mock code from reaching production bundle
- `.env` files might leak to production if deployed incorrectly

#### **Proposed Solution**

**Option A: Build-Time Dead Code Elimination (Recommended)**

```typescript
// src/lib/authService.ts
const IS_DEV = import.meta.env.DEV; // ⭐ Vite build-time constant
const USE_MOCK_AUTH = IS_DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // ⭐ In production builds, this entire block is removed by tree-shaking
    if (import.meta.env.DEV && USE_MOCK_AUTH) {
      console.warn('⚠️ DEVELOPMENT MODE: Using mock authentication');
      return mockLogin(email, password);
    }

    // Production auth always executes
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // ...
  },
};
```

**Option B: Separate Mock Module**

```typescript
// src/lib/authService.mock.ts (only imported in dev)
export const mockAuthService = {
  login: async (email: string, password: string) => {
    // All mock logic here
  },
};

// src/lib/authService.ts (production)
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Only real auth, no conditionals
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // ...
  },
};

// src/lib/auth.ts (facade)
import { authService as prodAuth } from './authService';
import { mockAuthService } from './authService.mock';

export const authService =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true'
    ? mockAuthService
    : prodAuth;
```

**Option C: Runtime Assert (Fallback)**

```typescript
// src/lib/authService.ts
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

if (USE_MOCK_AUTH && import.meta.env.PROD) {
  throw new Error(
    'FATAL: Mock auth enabled in production. Check environment variables.',
  );
}
```

#### **Environment Variable Cleanup**

```bash
# .env.example
# VITE_USE_MOCK_AUTH=true  # ❌ Remove dangerous default

# .env.development (new file)
VITE_USE_MOCK_AUTH=true  # ✅ Only in dev file

# .env.production (new file)
# VITE_USE_MOCK_AUTH not set  # ✅ Never set in production
```

#### **CI/CD Guard**

```yaml
# .github/workflows/deploy.yml
- name: Verify no mock auth in production
  run: |
    if grep -r "USE_MOCK_AUTH.*true" dist/; then
      echo "ERROR: Mock auth found in production bundle"
      exit 1
    fi
```

#### **Testing Requirements**

1. **Build test**: Verify mock code removed from production bundle

   ```bash
   npm run build
   # Search bundle for mock code
   grep -r "mockLogin\|MOCK_USERS" dist/ && exit 1 || echo "✅ No mock code"
   ```

2. **Runtime test**: Verify production throws error if mock enabled

   ```typescript
   // Mock production environment
   import.meta.env.PROD = true;
   import.meta.env.VITE_USE_MOCK_AUTH = 'true';

   expect(() => import('./authService')).toThrow(
     'Mock auth enabled in production',
   );
   ```

#### **Acceptance Criteria**

- [ ] Mock code removed from production builds (verify with bundle analysis)
- [ ] Development still works with mock auth via `.env.development`
- [ ] CI/CD pipeline fails if mock code detected in production bundle
- [ ] Documentation updated with dev setup instructions
- [ ] `.env.production` created without mock flags
- [ ] Team trained on proper environment setup

#### **Migration Notes**

- **Deploy Strategy**: Deploy during low-traffic window
- **Monitoring**: Watch for auth failures in first 24 hours
- **Rollback**: Simple git revert if production auth breaks

---

## ⚡ PHASE 2: HIGH-PRIORITY DATA INTEGRITY FIXES

### **FIX-004: Optimize Analytics N+1 Query Pattern**

**Priority**: P1 - HIGH  
**Effort**: 8 hours  
**Risk**: Dashboard performance degradation, database load

#### **Current State**

**File**: `src/lib/vendorAnalyticsService.ts` lines 244-320

**Query Sequence** (inefficient):

```typescript
// Query 1: Fetch ALL payments (unbounded!)
const { data: allPayments } = await supabase
  .from('payments')
  .select('amount, created_at, booking_id, bookings!inner(id, trip_id)')
  .eq('status', 'succeeded');

// Query 2: Fetch vendor experiences
const { data: vendorExperiences } = await supabase
  .from('experiences')
  .select('id')
  .eq('vendor_id', vendorId);

// Query 3: Fetch trip items for ALL vendor experiences
const { data: tripItems } = await supabase
  .from('trip_items')
  .select('trip_id, experience_id')
  .in('experience_id', Array.from(targetExpIds));

// JavaScript filtering (O(n²))
const vendorPayments = allPayments.filter((p) =>
  vendorTripIds.has(p.bookings.trip_id),
);
```

**Performance Impact**:

- Platform with 10,000 bookings: Fetches all 10,000 rows, filters in JS
- Vendor with 100 experiences: 3 sequential queries + nested loops
- Dashboard load time: 3-5 seconds (unacceptable)

#### **Proposed Solution**

**Option A: Postgres RPC with JOIN (Best Performance)**

```sql
-- supabase/migrations/YYYYMMDD_create_vendor_revenue_stats.sql
CREATE OR REPLACE FUNCTION get_vendor_revenue_stats(
  p_vendor_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_experience_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_revenue BIGINT,
  booking_count INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(p.amount), 0)::BIGINT AS total_revenue,
    COUNT(DISTINCT b.id)::INTEGER AS booking_count,
    p_start_date AS period_start,
    p_end_date AS period_end
  FROM payments p
  INNER JOIN bookings b ON p.booking_id = b.id
  INNER JOIN trip_items ti ON b.trip_id = ti.trip_id
  INNER JOIN experiences e ON ti.experience_id = e.id
  WHERE
    e.vendor_id = p_vendor_id
    AND p.status = 'succeeded'
    AND p.created_at >= p_start_date
    AND p.created_at <= p_end_date
    AND (p_experience_id IS NULL OR e.id = p_experience_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_created
ON payments(booking_id, created_at) WHERE status = 'succeeded';
```

```typescript
// src/lib/vendorAnalyticsService.ts
export async function getVendorRevenueStats(
  vendorId: string,
  period: TimePeriod,
  experienceId?: string,
): Promise<VendorRevenueStats> {
  const { startDate, endDate } = getDateRangeForPeriod(period);
  const { startDate: prevStart, endDate: prevEnd } =
    getPreviousPeriodRange(period);

  // Single RPC call replaces 3 queries + JS filtering
  const [currentStats, previousStats] = await Promise.all([
    supabase
      .rpc('get_vendor_revenue_stats', {
        p_vendor_id: vendorId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_experience_id: experienceId || null,
      })
      .single(),

    supabase
      .rpc('get_vendor_revenue_stats', {
        p_vendor_id: vendorId,
        p_start_date: prevStart.toISOString(),
        p_end_date: prevEnd.toISOString(),
        p_experience_id: experienceId || null,
      })
      .single(),
  ]);

  const percentChange =
    previousStats.data?.total_revenue > 0
      ? Math.round(
          ((currentStats.data.total_revenue -
            previousStats.data.total_revenue) /
            previousStats.data.total_revenue) *
            100,
        )
      : 0;

  return {
    totalRevenue: currentStats.data.total_revenue,
    revenueThisMonth: currentStats.data.total_revenue,
    periodComparison: {
      previousPeriod: previousStats.data.total_revenue,
      percentChange,
    },
    // ... fetch payout data separately
  };
}
```

**Option B: Materialized View (Best for Aggregates)**

```sql
-- supabase/migrations/YYYYMMDD_create_vendor_revenue_view.sql
CREATE MATERIALIZED VIEW vendor_revenue_daily AS
SELECT
  e.vendor_id,
  e.id AS experience_id,
  DATE(p.created_at) AS revenue_date,
  SUM(p.amount) AS daily_revenue,
  COUNT(DISTINCT b.id) AS booking_count
FROM payments p
INNER JOIN bookings b ON p.booking_id = b.id
INNER JOIN trip_items ti ON b.trip_id = ti.trip_id
INNER JOIN experiences e ON ti.experience_id = e.id
WHERE p.status = 'succeeded'
GROUP BY e.vendor_id, e.id, DATE(p.created_at);

-- Refresh strategy (run via cron or trigger)
CREATE INDEX ON vendor_revenue_daily (vendor_id, revenue_date);
REFRESH MATERIALIZED VIEW CONCURRENTLY vendor_revenue_daily;
```

```typescript
// Query materialized view (instant results)
const { data } = await supabase
  .from('vendor_revenue_daily')
  .select('daily_revenue, booking_count')
  .eq('vendor_id', vendorId)
  .gte('revenue_date', startDate)
  .lte('revenue_date', endDate);

const totalRevenue = data.reduce((sum, row) => sum + row.daily_revenue, 0);
```

#### **Performance Comparison**

| Approach              | Query Count | DB Rows Scanned | Response Time | Complexity |
| --------------------- | ----------- | --------------- | ------------- | ---------- |
| **Current (N+1)**     | 3           | 10,000+         | 3-5s          | High       |
| **RPC JOIN**          | 1           | 100-500         | 50-200ms      | Low        |
| **Materialized View** | 1           | 10-50           | 10-50ms       | Medium     |

#### **Testing Requirements**

**Performance Benchmark**:

```typescript
// tests/performance/analytics-benchmark.test.ts
describe('Analytics Performance', () => {
  it('should load dashboard in under 500ms', async () => {
    const start = Date.now();
    await getVendorRevenueStats('vendor-123', '30d');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('should handle large vendors (1000+ bookings) efficiently', async () => {
    const vendor = await createVendorWithBookings(1000);

    const start = Date.now();
    await getVendorRevenueStats(vendor.id, '12m');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // 1 second max
  });
});
```

**Correctness Test**:

```typescript
it('should return same results as old implementation', async () => {
  const oldResults = await getVendorRevenueStats_Old(vendorId, '30d');
  const newResults = await getVendorRevenueStats(vendorId, '30d');

  expect(newResults.totalRevenue).toBe(oldResults.totalRevenue);
  expect(newResults.revenueThisMonth).toBe(oldResults.revenueThisMonth);
});
```

#### **Acceptance Criteria**

- [ ] Dashboard loads in < 500ms (vs 3-5s current)
- [ ] Query count reduced from 3 to 1
- [ ] Database scans < 500 rows (vs 10,000+)
- [ ] Results match old implementation (correctness verified)
- [ ] Performance benchmark tests pass
- [ ] Index created for optimal query plan
- [ ] Documentation updated with query optimization notes

#### **Migration Strategy**

1. **Week 1**: Deploy RPC in parallel (both old and new code run)
2. **Week 2**: Monitor performance metrics, compare results
3. **Week 3**: Switch production traffic to new RPC
4. **Week 4**: Remove old code after validation period

---

### **FIX-005: Implement Checkout Transaction Rollback**

**Priority**: P1 - HIGH  
**Effort**: 6 hours  
**Risk**: Lost inventory on payment failures

#### **Current State**

**File**: `supabase/functions/checkout/index.ts`

**Flow** (non-transactional):

```
1. Decrement slot inventory ✅
2. Create Stripe session ❌ (might fail)
3. Return session URL to client

If step 2 fails → inventory already decremented = lost capacity!
```

#### **Proposed Solution**

**Option A: Two-Phase Commit Pattern**

```typescript
// supabase/functions/checkout/index.ts

// Phase 1: Create pending reservation (soft lock)
const reservationId = crypto.randomUUID();
const { data: reservation, error: reserveError } = await supabase
  .from('slot_reservations')
  .insert({
    id: reservationId,
    slot_id: slot.id,
    guest_count: guestCount,
    status: 'pending',
    expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
  })
  .select()
  .single();

if (reserveError) {
  return errorResponse(
    'Failed to reserve inventory',
    'RESERVATION_FAILED',
    500,
  );
}

try {
  // Phase 2: Create Stripe session
  const stripeSession = await stripe.checkout.sessions.create({
    // ... stripe config
    metadata: {
      reservation_id: reservationId,
    },
  });

  // Phase 3: Confirm reservation (hard commit)
  await supabase
    .from('slot_reservations')
    .update({ status: 'confirmed', stripe_session_id: stripeSession.id })
    .eq('id', reservationId);

  return { success: true, sessionUrl: stripeSession.url };
} catch (stripeError) {
  // Rollback: Cancel reservation
  await supabase
    .from('slot_reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId);

  await createAuditLog(supabase, {
    eventType: 'checkout.failed',
    metadata: {
      error: 'Stripe session creation failed',
      reservation_id: reservationId,
    },
  });

  return errorResponse('Payment processing failed', 'STRIPE_ERROR', 500);
}
```

**Database Schema**:

```sql
-- supabase/migrations/YYYYMMDD_create_slot_reservations.sql
CREATE TABLE slot_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES experience_slots(id),
  guest_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  stripe_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_slot_reservations_expires ON slot_reservations(expires_at)
WHERE status = 'pending';

-- Cleanup expired reservations (cron job every 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE slot_reservations
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW()
  RETURNING COUNT(*) INTO affected_count;

  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;
```

**Availability Calculation** (updated):

```sql
-- Get available slots considering reservations
CREATE OR REPLACE FUNCTION get_available_count(p_slot_id UUID)
RETURNS INTEGER AS $$
  SELECT
    es.total_capacity -
    COALESCE(SUM(CASE
      WHEN sr.status IN ('pending', 'confirmed') THEN sr.guest_count
      ELSE 0
    END), 0) AS available
  FROM experience_slots es
  LEFT JOIN slot_reservations sr ON es.id = sr.slot_id
  WHERE es.id = p_slot_id
  GROUP BY es.id, es.total_capacity;
$$ LANGUAGE sql STABLE;
```

#### **Testing Requirements**

**Rollback Test**:

```typescript
it('should rollback inventory when Stripe fails', async () => {
  const slotId = await createTestSlot({ available_count: 5 });

  // Mock Stripe to fail
  mockStripeCreateSession.mockRejectedValue(new Error('Stripe error'));

  const result = await checkout({ slotId, guests: 2 });

  expect(result.error).toBe('Payment processing failed');

  // Verify inventory not decremented
  const slot = await getSlot(slotId);
  expect(slot.available_count).toBe(5); // Still 5!

  // Verify reservation cancelled
  const reservation = await getReservation(result.reservationId);
  expect(reservation.status).toBe('cancelled');
});
```

**Expiration Test**:

```typescript
it('should expire reservations after 15 minutes', async () => {
  const reservation = await createReservation({
    expires_at: Date.now() - 1000,
  });

  await cleanupExpiredReservations();

  const updated = await getReservation(reservation.id);
  expect(updated.status).toBe('expired');
});
```

#### **Acceptance Criteria**

- [ ] Inventory NOT decremented until Stripe success
- [ ] Failed Stripe calls release reservations
- [ ] Expired reservations (15 min) auto-cancelled
- [ ] Available count accounts for pending reservations
- [ ] Rollback test passes (inventory preserved on failure)
- [ ] Cron job cleans up expired reservations every 5 min
- [ ] Audit logs capture all reservation state changes

---

## 📊 **SUMMARY**

| Fix                          | Priority | Effort | Files Changed | Tests Required      |
| ---------------------------- | -------- | ------ | ------------- | ------------------- |
| FIX-001 Password Validation  | P0       | 2h     | 3             | 8 unit tests        |
| FIX-002 Atomic Slot Booking  | P0       | 4h     | 2             | 2 concurrency tests |
| FIX-003 Mock Auth Removal    | P0       | 1h     | 4             | 2 build tests       |
| FIX-004 Analytics N+1        | P1       | 8h     | 3             | 3 perf benchmarks   |
| FIX-005 Transaction Rollback | P1       | 6h     | 5             | 4 integration tests |

**Total Effort**: 21 hours (~3 days)  
**Total Tests**: 19 new tests required

---

## 🚀 **IMPLEMENTATION SEQUENCE**

### Day 1 (7 hours)

- Morning: FIX-001 Password Validation (2h) + tests
- Afternoon: FIX-002 Atomic Slot Booking (4h) + concurrency tests
- Evening: Code review, deploy to staging

### Day 2 (7 hours)

- Morning: FIX-003 Mock Auth Removal (1h) + CI/CD guards
- Afternoon: FIX-005 Transaction Rollback (6h) + integration tests
- Evening: Staging validation, production deploy plan

### Day 3 (7 hours)

- Morning: FIX-004 Analytics Optimization (8h) - start implementation
- Afternoon: Performance benchmarks, parallel deployment
- Evening: Documentation, team training

---

**Next Actions**:

- [a] Start Phase 1 implementation (FIX-001)
- [b] Review and approve specifications
- [c] Assign to development team
- [d] Return to main menu
