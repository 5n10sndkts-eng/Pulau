# Quality Audit - Comprehensive Test Plan

**Generated**: January 12, 2026  
**Project**: Pulau  
**Purpose**: Validation test suite for quality audit fixes

---

## 🎯 TEST STRATEGY OVERVIEW

### Testing Pyramid

```
           /\
          /E2E\         5 tests   (Critical user flows)
         /------\
        /  INT   \      12 tests  (Service integration)
       /----------\
      /    UNIT    \    32 tests  (Function-level validation)
     /--------------\
    /  PERFORMANCE  \   8 tests   (Load, stress, concurrency)
   /------------------\
```

**Total Test Count**: 57 new tests  
**Coverage Target**: 95% for modified files  
**Execution Time**: < 5 minutes (excluding E2E)

---

## 🔒 PHASE 1: CRITICAL SECURITY TESTS (P0)

### TEST-001: Password Validation Unit Tests

**File**: `src/__tests__/lib/validation.test.ts` (NEW)  
**Coverage**: `src/lib/validation.ts`  
**Effort**: 1 hour

```typescript
import { describe, it, expect } from 'vitest';
import { validatePassword, PASSWORD_MIN_LENGTH } from '@/lib/validation';

describe('Password Validation', () => {
  describe('Length Requirements', () => {
    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    });

    it('should reject password with 7 characters', () => {
      const result = validatePassword('Test123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    });

    it('should accept password with exactly 8 characters', () => {
      const result = validatePassword('Test1234!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with 20 characters', () => {
      const result = validatePassword('Test1234!ExtraSecure');
      expect(result.valid).toBe(true);
    });
  });

  describe('Complexity Requirements', () => {
    it('should reject password without uppercase letter', () => {
      const result = validatePassword('test1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST1234!');
      expect(result.valid).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePassword('TestTest!');
      expect(result.valid).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.valid).toBe(false);
    });

    it('should accept password with all complexity requirements', () => {
      const result = validatePassword('SecureP@ss123');
      expect(result.valid).toBe(true);
    });
  });

  describe('Whitespace Handling', () => {
    it('should reject password with spaces', () => {
      const result = validatePassword('Test 1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });

    it('should reject password with leading space', () => {
      const result = validatePassword(' Test1234!');
      expect(result.valid).toBe(false);
    });

    it('should reject password with trailing space', () => {
      const result = validatePassword('Test1234! ');
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const result = validatePassword(null as any);
      expect(result.valid).toBe(false);
    });

    it('should handle undefined input gracefully', () => {
      const result = validatePassword(undefined as any);
      expect(result.valid).toBe(false);
    });

    it('should reject very long password (> 128 chars)', () => {
      const longPassword = 'A1!' + 'x'.repeat(130);
      const result = validatePassword(longPassword);
      // Optional: Add max length check if needed
    });

    it('should accept common special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?'];
      specialChars.forEach((char) => {
        const result = validatePassword(`Test1234${char}`);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Multiple Errors', () => {
    it('should return all applicable errors', () => {
      const result = validatePassword('test');
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });
  });
});
```

**Assertions**: 25 test cases  
**Expected Runtime**: 50ms  
**Coverage Target**: 100%

---

### TEST-002: Auth Service Password Integration

**File**: `src/__tests__/lib/authService.test.ts` (UPDATE)  
**Coverage**: `src/lib/authService.ts`  
**Effort**: 1 hour

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/authService';
import * as validation from '@/lib/validation';

describe('Auth Service - Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Validation Integration', () => {
    it('should call validatePassword before registration', async () => {
      const validateSpy = vi.spyOn(validation, 'validatePassword');

      await expect(
        authService.register('Test User', 'test@example.com', 'weak'),
      ).rejects.toThrow();

      expect(validateSpy).toHaveBeenCalledWith('weak');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.register('Test User', 'test@example.com', 'short'),
      ).rejects.toThrow('Password must be at least 8 characters');
    });

    it('should NOT call Supabase with invalid password', async () => {
      const supabaseSpy = vi.spyOn(supabase.auth, 'signUp');

      await expect(
        authService.register('Test', 'test@example.com', 'weak'),
      ).rejects.toThrow();

      expect(supabaseSpy).not.toHaveBeenCalled();
    });

    it('should call Supabase with valid password', async () => {
      const supabaseSpy = vi
        .spyOn(supabase.auth, 'signUp')
        .mockResolvedValue({ data: { user: mockUser }, error: null });

      await authService.register('Test', 'test@example.com', 'ValidPass123!');

      expect(supabaseSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'ValidPass123!',
        }),
      );
    });

    it('should return user on successful registration with valid password', async () => {
      const result = await authService.register(
        'Test User',
        'test@example.com',
        'SecureP@ss123',
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('Story 2.1 Acceptance Criteria Validation', () => {
    it('AC1: should require minimum 8 characters', async () => {
      await expect(
        authService.register('User', 'test@example.com', '1234567'),
      ).rejects.toThrow();
    });

    it('AC2: should require complexity (upper, lower, number, special)', async () => {
      await expect(
        authService.register('User', 'test@example.com', 'alllowercase'),
      ).rejects.toThrow();
    });

    it('AC3: should display clear error message to user', async () => {
      try {
        await authService.register('User', 'test@example.com', 'weak');
      } catch (error) {
        expect(error.message).toMatch(/password/i);
        expect(error.message).toMatch(/8 characters/i);
      }
    });
  });
});
```

**Assertions**: 10 test cases  
**Expected Runtime**: 200ms  
**Coverage Target**: 100% for register function

---

### TEST-003: Atomic Slot Booking Concurrency Tests

**File**: `tests/concurrency/slot-booking-race.test.ts` (NEW)  
**Coverage**: `supabase/functions/checkout/index.ts`  
**Effort**: 3 hours

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Slot Booking Concurrency Tests', () => {
  let supabase: SupabaseClient;
  let testSlotId: string;
  let testExperienceId: string;

  beforeEach(async () => {
    // Setup: Create test experience and slot
    const { data: experience } = await supabase
      .from('experiences')
      .insert({ title: 'Test Experience', vendor_id: testVendorId })
      .select()
      .single();

    testExperienceId = experience.id;

    const { data: slot } = await supabase
      .from('experience_slots')
      .insert({
        experience_id: testExperienceId,
        slot_date: '2026-02-01',
        slot_time: '10:00',
        available_count: 2, // Critical: Only 2 spots
        total_capacity: 2,
      })
      .select()
      .single();

    testSlotId = slot.id;
  });

  afterEach(async () => {
    // Cleanup
    await supabase.from('experience_slots').delete().eq('id', testSlotId);
    await supabase.from('experiences').delete().eq('id', testExperienceId);
  });

  describe('Race Condition Prevention', () => {
    it('CRITICAL: should prevent double-booking with 2 concurrent requests', async () => {
      // Scenario: 2 spots available, 2 requests for 1 guest each
      // Expected: Both succeed
      const [result1, result2] = await Promise.allSettled([
        checkout({ slotId: testSlotId, guests: 1 }),
        checkout({ slotId: testSlotId, guests: 1 }),
      ]);

      const successes = [result1, result2].filter(
        (r) => r.status === 'fulfilled',
      );
      expect(successes).toHaveLength(2);

      // Verify final state
      const { data: finalSlot } = await supabase
        .from('experience_slots')
        .select('available_count')
        .eq('id', testSlotId)
        .single();

      expect(finalSlot.available_count).toBe(0);
    });

    it('CRITICAL: should reject third concurrent request when only 2 spots', async () => {
      // Scenario: 2 spots, 3 requests for 1 guest each
      // Expected: 2 succeed, 1 fails
      const [r1, r2, r3] = await Promise.allSettled([
        checkout({ slotId: testSlotId, guests: 1 }),
        checkout({ slotId: testSlotId, guests: 1 }),
        checkout({ slotId: testSlotId, guests: 1 }),
      ]);

      const successes = [r1, r2, r3].filter((r) => r.status === 'fulfilled');
      const failures = [r1, r2, r3].filter((r) => r.status === 'rejected');

      expect(successes).toHaveLength(2);
      expect(failures).toHaveLength(1);

      // Verify failure reason
      const failedResult = failures[0];
      expect(failedResult.reason.message).toMatch(
        /not available|insufficient inventory/i,
      );
    });

    it('CRITICAL: should handle 10 concurrent requests correctly', async () => {
      // Update slot to 5 spots
      await supabase
        .from('experience_slots')
        .update({ available_count: 5, total_capacity: 5 })
        .eq('id', testSlotId);

      // Fire 10 concurrent requests for 1 guest each
      const promises = Array.from({ length: 10 }, () =>
        checkout({ slotId: testSlotId, guests: 1 }),
      );

      const results = await Promise.allSettled(promises);
      const successes = results.filter((r) => r.status === 'fulfilled');

      expect(successes).toHaveLength(5); // Exactly 5 should succeed

      // Verify no overbooking
      const { data: finalSlot } = await supabase
        .from('experience_slots')
        .select('available_count')
        .eq('id', testSlotId)
        .single();

      expect(finalSlot.available_count).toBe(0);
      expect(finalSlot.available_count).not.toBeLessThan(0); // NEVER negative
    });

    it('should prevent negative inventory under high concurrency', async () => {
      await supabase
        .from('experience_slots')
        .update({ available_count: 1 })
        .eq('id', testSlotId);

      // 50 concurrent requests for 1 spot
      const promises = Array.from({ length: 50 }, () =>
        checkout({ slotId: testSlotId, guests: 1 }),
      );

      await Promise.allSettled(promises);

      const { data: slot } = await supabase
        .from('experience_slots')
        .select('available_count')
        .eq('id', testSlotId)
        .single();

      expect(slot.available_count).toBeGreaterThanOrEqual(0); // NEVER negative
      expect(slot.available_count).toBe(0); // Exactly 0 after 1 success
    });
  });

  describe('Multi-Guest Booking Atomicity', () => {
    it('should handle concurrent bookings with different guest counts', async () => {
      await supabase
        .from('experience_slots')
        .update({ available_count: 5 })
        .eq('id', testSlotId);

      const [r1, r2, r3] = await Promise.allSettled([
        checkout({ slotId: testSlotId, guests: 2 }), // Request 2 spots
        checkout({ slotId: testSlotId, guests: 2 }), // Request 2 spots
        checkout({ slotId: testSlotId, guests: 2 }), // Request 2 spots (should fail)
      ]);

      const successes = [r1, r2, r3].filter((r) => r.status === 'fulfilled');
      expect(successes).toHaveLength(2); // Only 2 bookings of 2 guests each

      const { data: slot } = await supabase
        .from('experience_slots')
        .select('available_count')
        .eq('id', testSlotId)
        .single();

      expect(slot.available_count).toBe(1); // 5 - 2 - 2 = 1
    });
  });

  describe('Error Handling', () => {
    it('should return 409 Conflict on race condition failure', async () => {
      await supabase
        .from('experience_slots')
        .update({ available_count: 1 })
        .eq('id', testSlotId);

      const [r1, r2] = await Promise.allSettled([
        checkout({ slotId: testSlotId, guests: 1 }),
        checkout({ slotId: testSlotId, guests: 1 }),
      ]);

      const failure = [r1, r2].find((r) => r.status === 'rejected');
      expect(failure).toBeDefined();
      expect(failure.reason.status).toBe(409); // HTTP 409 Conflict
    });

    it('should log audit event on inventory exhaustion', async () => {
      await supabase
        .from('experience_slots')
        .update({ available_count: 1 })
        .eq('id', testSlotId);

      await Promise.allSettled([
        checkout({ slotId: testSlotId, guests: 1 }),
        checkout({ slotId: testSlotId, guests: 1 }),
      ]);

      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'checkout.failed')
        .eq('metadata->>error', 'Inventory unavailable (atomic check failed)');

      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });
});
```

**Assertions**: 8 test cases (CRITICAL)  
**Expected Runtime**: 10-15 seconds  
**Coverage Target**: Race condition logic 100%

---

### TEST-004: Mock Auth Removal Verification

**File**: `tests/build/production-bundle.test.ts` (NEW)  
**Coverage**: Build output validation  
**Effort**: 1 hour

```typescript
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Production Bundle Security', () => {
  beforeAll(() => {
    // Build production bundle
    execSync('npm run build', { stdio: 'inherit' });
  });

  describe('Mock Auth Code Elimination', () => {
    it('should NOT include mock auth code in production bundle', () => {
      const distPath = path.join(process.cwd(), 'dist');
      const files = getAllJSFiles(distPath);

      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');

        // Search for mock auth patterns
        expect(content).not.toMatch(/mockLogin/i);
        expect(content).not.toMatch(/MOCK_USERS/i);
        expect(content).not.toMatch(/USE_MOCK_AUTH.*true/i);
      });
    });

    it('should NOT include development environment checks in bundle', () => {
      const distPath = path.join(process.cwd(), 'dist');
      const files = getAllJSFiles(distPath);

      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).not.toMatch(/import\.meta\.env\.VITE_USE_MOCK_AUTH/);
      });
    });

    it('should minify production bundle', () => {
      const mainBundle = path.join(process.cwd(), 'dist/assets/index-*.js');
      const content = fs.readFileSync(mainBundle, 'utf8');

      // Check for minification (no unnecessary whitespace)
      const lines = content.split('\n');
      const avgLineLength = content.length / lines.length;
      expect(avgLineLength).toBeGreaterThan(100); // Minified code has long lines
    });
  });

  describe('Environment Variable Validation', () => {
    it('should have .env.production without mock flags', () => {
      const envPath = path.join(process.cwd(), '.env.production');

      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        expect(content).not.toMatch(/VITE_USE_MOCK_AUTH=true/i);
      }
    });

    it('should have .env.development with mock flags (allowed)', () => {
      const envPath = path.join(process.cwd(), '.env.development');
      const content = fs.readFileSync(envPath, 'utf8');

      // Dev env CAN have mock auth
      expect(content).toMatch(/VITE_USE_MOCK_AUTH/);
    });
  });
});

function getAllJSFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllJSFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  });

  return files;
}
```

**Assertions**: 5 test cases  
**Expected Runtime**: 30 seconds (includes build)  
**Coverage Target**: Bundle integrity 100%

---

## ⚡ PHASE 2: DATA INTEGRITY TESTS (P1)

### TEST-005: Analytics Performance Benchmarks

**File**: `tests/performance/analytics-benchmark.test.ts` (NEW)  
**Coverage**: `src/lib/vendorAnalyticsService.ts`  
**Effort**: 2 hours

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { getVendorRevenueStats } from '@/lib/vendorAnalyticsService';

describe('Analytics Performance Benchmarks', () => {
  let testVendorId: string;

  beforeAll(async () => {
    // Create vendor with realistic data
    testVendorId = await createVendorWithBookings({
      bookingCount: 1000,
      experienceCount: 10,
      dateRange: '12m',
    });
  });

  describe('Response Time Requirements', () => {
    it('should load dashboard in under 500ms (small vendor)', async () => {
      const smallVendor = await createVendorWithBookings({ bookingCount: 50 });

      const start = Date.now();
      await getVendorRevenueStats(smallVendor, '30d');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should load dashboard in under 1000ms (medium vendor)', async () => {
      const mediumVendor = await createVendorWithBookings({
        bookingCount: 500,
      });

      const start = Date.now();
      await getVendorRevenueStats(mediumVendor, '30d');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should load dashboard in under 2000ms (large vendor)', async () => {
      const largeVendor = await createVendorWithBookings({
        bookingCount: 5000,
      });

      const start = Date.now();
      await getVendorRevenueStats(largeVendor, '12m');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Query Efficiency', () => {
    it('should use single RPC call instead of 3 queries', async () => {
      const queryCounter = vi.fn();
      vi.spyOn(supabase, 'rpc').mockImplementation((...args) => {
        queryCounter();
        return originalRpc(...args);
      });

      await getVendorRevenueStats(testVendorId, '30d');

      expect(queryCounter).toHaveBeenCalledTimes(2); // Current + previous period
    });

    it('should scan minimal rows (< 500 for 30-day period)', async () => {
      const queryPlan = await supabase.rpc('explain_query', {
        query: 'get_vendor_revenue_stats',
        params: {
          p_vendor_id: testVendorId,
          p_start_date: '...',
          p_end_date: '...',
        },
      });

      const rowsScanned = parseRowsScanned(queryPlan.data);
      expect(rowsScanned).toBeLessThan(500);
    });
  });

  describe('Result Correctness (vs Old Implementation)', () => {
    it('should return same total revenue as old implementation', async () => {
      const oldResult = await getVendorRevenueStats_Old(testVendorId, '30d');
      const newResult = await getVendorRevenueStats(testVendorId, '30d');

      expect(newResult.totalRevenue).toBe(oldResult.totalRevenue);
    });

    it('should return same booking count as old implementation', async () => {
      const oldResult = await getVendorRevenueStats_Old(testVendorId, '7d');
      const newResult = await getVendorRevenueStats(testVendorId, '7d');

      expect(newResult.bookingCount).toBe(oldResult.bookingCount);
    });

    it('should calculate same period comparison as old implementation', async () => {
      const oldResult = await getVendorRevenueStats_Old(testVendorId, '30d');
      const newResult = await getVendorRevenueStats(testVendorId, '30d');

      expect(newResult.periodComparison.percentChange).toBe(
        oldResult.periodComparison.percentChange,
      );
    });
  });

  describe('Memory Usage', () => {
    it('should not load all platform payments into memory', async () => {
      const before = process.memoryUsage().heapUsed;

      await getVendorRevenueStats(testVendorId, '12m');

      const after = process.memoryUsage().heapUsed;
      const memoryIncrease = (after - before) / 1024 / 1024; // MB

      expect(memoryIncrease).toBeLessThan(50); // Should use < 50MB
    });
  });
});
```

**Assertions**: 9 test cases  
**Expected Runtime**: 30-60 seconds  
**Coverage Target**: Performance regressions 0%

---

### TEST-006: Transaction Rollback Integration Tests

**File**: `tests/edge-functions/checkout-rollback.test.ts` (NEW)  
**Coverage**: `supabase/functions/checkout/index.ts`  
**Effort**: 2 hours

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Checkout Transaction Rollback', () => {
  let testSlotId: string
  let testTripId: string

  beforeEach(async () => {
    const { data: slot } = await supabase
      .from('experience_slots')
      .insert({ available_count: 5, total_capacity: 5, ... })
      .select()
      .single()

    testSlotId = slot.id
  })

  describe('Stripe Failure Rollback', () => {
    it('should NOT decrement inventory when Stripe session creation fails', async () => {
      // Mock Stripe to fail
      vi.spyOn(stripe.checkout.sessions, 'create')
        .mockRejectedValue(new Error('Stripe API error'))

      const initialCount = 5

      const result = await invokeCheckoutFunction({
        slotId: testSlotId,
        guests: 2
      })

      expect(result.error).toBeDefined()
      expect(result.error).toMatch(/payment processing failed/i)

      // Verify inventory NOT decremented
      const { data: slot } = await supabase
        .from('experience_slots')
        .select('available_count')
        .eq('id', testSlotId)
        .single()

      expect(slot.available_count).toBe(initialCount) // Still 5!
    })

    it('should cancel reservation on Stripe failure', async () => {
      vi.spyOn(stripe.checkout.sessions, 'create')
        .mockRejectedValue(new Error('Stripe error'))

      const result = await invokeCheckoutFunction({
        slotId: testSlotId,
        guests: 2
      })

      // Check that reservation was created but then cancelled
      const { data: reservations } = await supabase
        .from('slot_reservations')
        .select('*')
        .eq('slot_id', testSlotId)
        .order('created_at', { ascending: false })
        .limit(1)

      expect(reservations[0].status).toBe('cancelled')
    })

    it('should log audit event on rollback', async () => {
      vi.spyOn(stripe.checkout.sessions, 'create')
        .mockRejectedValue(new Error('Stripe timeout'))

      await invokeCheckoutFunction({ slotId: testSlotId, guests: 2 })

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'checkout.failed')
        .contains('metadata', { error: 'Stripe session creation failed' })

      expect(logs.length).toBeGreaterThan(0)
    })
  })

  describe('Reservation Expiration', () => {
    it('should expire reservations after 15 minutes', async () => {
      // Create reservation with past expiration
      const { data: reservation } = await supabase
        .from('slot_reservations')
        .insert({
          slot_id: testSlotId,
          guest_count: 2,
          status: 'pending',
          expires_at: new Date(Date.now() - 60000) // 1 min ago
        })
        .select()
        .single()

      // Run cleanup function
      await supabase.rpc('cleanup_expired_reservations')

      // Verify status updated
      const { data: updated } = await supabase
        .from('slot_reservations')
        .select('status')
        .eq('id', reservation.id)
        .single()

      expect(updated.status).toBe('expired')
    })

    it('should not expire reservations within 15 minutes', async () => {
      const { data: reservation } = await supabase
        .from('slot_reservations')
        .insert({
          slot_id: testSlotId,
          guest_count: 2,
          status: 'pending',
          expires_at: new Date(Date.now() + 10 * 60000) // 10 min future
        })
        .select()
        .single()

      await supabase.rpc('cleanup_expired_reservations')

      const { data: updated } = await supabase
        .from('slot_reservations')
        .select('status')
        .eq('id', reservation.id)
        .single()

      expect(updated.status).toBe('pending') // Still pending
    })

    it('should release inventory when reservation expires', async () => {
      // Create slot with reservation consuming all capacity
      await supabase
        .from('slot_reservations')
        .insert({
          slot_id: testSlotId,
          guest_count: 5,
          status: 'pending',
          expires_at: new Date(Date.now() - 1000)
        })

      const beforeCleanup = await supabase.rpc('get_available_count', {
        p_slot_id: testSlotId
      })
      expect(beforeCleanup.data).toBe(0) // All reserved

      await supabase.rpc('cleanup_expired_reservations')

      const afterCleanup = await supabase.rpc('get_available_count', {
        p_slot_id: testSlotId
      })
      expect(afterCleanup.data).toBe(5) // Available again
    })
  })

  describe('Two-Phase Commit Success Path', () => {
    it('should confirm reservation after successful Stripe session', async () => {
      const result = await invokeCheckoutFunction({
        slotId: testSlotId,
        guests: 2
      })

      expect(result.success).toBe(true)
      expect(result.sessionUrl).toBeDefined()

      // Verify reservation confirmed
      const { data: reservation } = await supabase
        .from('slot_reservations')
        .select('*')
        .eq('stripe_session_id', result.stripeSessionId)
        .single()

      expect(reservation.status).toBe('confirmed')
    })

    it('should decrement available_count only after confirmation', async () => {
      const initialCount = 5

      await invokeCheckoutFunction({ slotId: testSlotId, guests: 2 })

      const availableCount = await supabase.rpc('get_available_count', {
        p_slot_id: testSlotId
      })

      expect(availableCount.data).toBe(3) // 5 - 2 = 3
    })
  })
})
```

**Assertions**: 10 test cases  
**Expected Runtime**: 5-10 seconds  
**Coverage Target**: Rollback logic 100%

---

## 🌐 END-TO-END TESTS

### TEST-007: Authentication E2E Flow

**File**: `tests/e2e/auth-security.spec.ts` (NEW)  
**Effort**: 2 hours

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Security E2E', () => {
  test('should reject weak password during registration', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'weak'); // Only 4 chars

    await page.click('button[type="submit"]');

    // Should see error message
    await expect(page.locator('text=/password.*8 characters/i')).toBeVisible();

    // Should NOT navigate away
    await expect(page).toHaveURL(/register/);
  });

  test('should display inline validation as user types', async ({ page }) => {
    await page.goto('/auth/register');

    const passwordInput = page.locator('[name="password"]');
    await passwordInput.fill('test');

    // Should show validation hint
    await expect(page.locator('text=/minimum 8 characters/i')).toBeVisible();

    await passwordInput.fill('Test1234!');

    // Should show success state (green checkmark or similar)
    await expect(page.locator('.validation-success')).toBeVisible();
  });

  test('should successfully register with strong password', async ({
    page,
  }) => {
    await page.goto('/auth/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecureP@ss123');

    await page.click('button[type="submit"]');

    // Should redirect to home or dashboard
    await expect(page).toHaveURL(/\/(home|dashboard)/, { timeout: 5000 });
  });

  test('should not allow mock auth bypass in production build', async ({
    page,
  }) => {
    // This test only runs against production build
    if (process.env.NODE_ENV !== 'production') {
      test.skip();
    }

    await page.goto('/auth/login');

    // Try to use mock credentials
    await page.fill('[name="email"]', 'vendor@mock.com');
    await page.fill('[name="password"]', 'mock123');

    await page.click('button[type="submit"]');

    // Should fail (mock auth disabled)
    await expect(page.locator('text=/invalid credentials/i')).toBeVisible();
  });
});
```

**Assertions**: 4 E2E scenarios  
**Expected Runtime**: 2-3 minutes  
**Coverage Target**: Critical user flows

---

### TEST-008: Concurrent Booking E2E

**File**: `tests/e2e/concurrent-booking.spec.ts` (NEW)  
**Effort**: 3 hours

```typescript
import { test, expect, chromium } from '@playwright/test';

test.describe('Concurrent Booking Prevention E2E', () => {
  test('should handle last spot booking correctly with 2 users', async () => {
    // Setup: Create experience with 1 spot left
    const { slotId, experienceId } = await setupTestExperience({
      availableCount: 1,
    });

    // Launch 2 browser contexts (simulate 2 users)
    const browser = await chromium.launch();
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both users navigate to same experience
    await Promise.all([
      page1.goto(`/experiences/${experienceId}`),
      page2.goto(`/experiences/${experienceId}`),
    ]);

    // Both users see "1 spot available"
    await expect(page1.locator('text=/1.*spot.*available/i')).toBeVisible();
    await expect(page2.locator('text=/1.*spot.*available/i')).toBeVisible();

    // Both click "Add to Trip" simultaneously
    await Promise.all([
      page1.click('button:has-text("Add to Trip")'),
      page2.click('button:has-text("Add to Trip")'),
    ]);

    // Both proceed to checkout simultaneously
    await Promise.all([
      page1.click('button:has-text("Checkout")'),
      page2.click('button:has-text("Checkout")'),
    ]);

    // One should succeed, one should fail
    const results = await Promise.allSettled([
      page1.waitForURL(/checkout\/success/, { timeout: 5000 }),
      page2.waitForURL(/checkout\/success/, { timeout: 5000 }),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    expect(successes).toHaveLength(1); // Exactly 1 success
    expect(failures).toHaveLength(1); // Exactly 1 failure

    // Failed user should see error message
    const failedPage =
      successes.length > 0 && results[0].status === 'fulfilled' ? page2 : page1;
    await expect(
      failedPage.locator('text=/no longer available/i'),
    ).toBeVisible();

    await browser.close();
  });

  test('should update availability in real-time for other users', async () => {
    const { experienceId } = await setupTestExperience({ availableCount: 5 });

    const browser = await chromium.launch();
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto(`/experiences/${experienceId}`);
    await page2.goto(`/experiences/${experienceId}`);

    // Both see 5 spots
    await expect(page1.locator('[data-testid="available-count"]')).toHaveText(
      '5',
    );
    await expect(page2.locator('[data-testid="available-count"]')).toHaveText(
      '5',
    );

    // User 1 books 2 spots
    await page1.selectOption('[name="guests"]', '2');
    await page1.click('button:has-text("Add to Trip")');
    await page1.click('button:has-text("Checkout")');
    await page1.waitForURL(/stripe\.com/, { timeout: 10000 });

    // User 2 should see updated count (real-time subscription)
    await expect(page2.locator('[data-testid="available-count"]')).toHaveText(
      '3',
      {
        timeout: 3000,
      },
    );

    await browser.close();
  });
});
```

**Assertions**: 2 complex E2E scenarios  
**Expected Runtime**: 5-8 minutes  
**Coverage Target**: Race condition UX

---

## 📊 TEST EXECUTION PLAN

### Phase 1: Unit Tests (Day 1 Morning)

```bash
# Run password validation tests
npm test -- validation.test.ts
npm test -- authService.test.ts

# Expected: 35 tests pass, < 1 second runtime
```

### Phase 2: Integration Tests (Day 1 Afternoon)

```bash
# Run concurrency tests
npm test -- slot-booking-race.test.ts

# Expected: 8 tests pass, ~15 seconds runtime
```

### Phase 3: Build Tests (Day 2 Morning)

```bash
# Run production bundle tests
npm run build
npm test -- production-bundle.test.ts

# Expected: 5 tests pass, ~30 seconds runtime
```

### Phase 4: Performance Tests (Day 2 Afternoon)

```bash
# Run analytics benchmarks
npm test -- analytics-benchmark.test.ts

# Expected: 9 tests pass, ~60 seconds runtime
```

### Phase 5: E2E Tests (Day 3)

```bash
# Run all E2E tests
npm run test:e2e

# Expected: 6 tests pass, ~10 minutes runtime
```

---

## ✅ ACCEPTANCE CRITERIA VALIDATION

### Story 2.1: Password Validation (FIX-001)

- [ ] TEST-001: 25/25 unit tests pass
- [ ] TEST-002: 10/10 integration tests pass
- [ ] TEST-007: 4/4 E2E tests pass
- [ ] Manual verification: Password rejected with clear error message

### Story Integrity: Atomic Booking (FIX-002)

- [ ] TEST-003: 8/8 concurrency tests pass (ZERO double-bookings)
- [ ] TEST-008: 2/2 E2E concurrent scenarios pass
- [ ] Load test: 100 concurrent requests, 0 overbookings

### Security: Mock Auth Removal (FIX-003)

- [ ] TEST-004: 5/5 build tests pass
- [ ] Manual verification: Production bundle contains no mock code
- [ ] TEST-007: E2E mock bypass attempt fails

### Performance: Analytics Optimization (FIX-004)

- [ ] TEST-005: 9/9 performance benchmarks pass
- [ ] Dashboard loads in < 500ms (vs 3-5s before)
- [ ] Memory usage < 50MB increase

### Data Integrity: Transaction Rollback (FIX-005)

- [ ] TEST-006: 10/10 rollback tests pass
- [ ] Stripe failure preserves inventory
- [ ] Reservation expiration releases capacity

---

## 📈 COVERAGE TARGETS

| File                        | Current | Target   | Tests              |
| --------------------------- | ------- | -------- | ------------------ |
| `validation.ts`             | 0%      | **100%** | TEST-001           |
| `authService.ts`            | 67%     | **95%**  | TEST-002           |
| `checkout/index.ts`         | 72%     | **90%**  | TEST-003, TEST-006 |
| `vendorAnalyticsService.ts` | 58%     | **85%**  | TEST-005           |
| Build output                | N/A     | **100%** | TEST-004           |

**Overall Target**: 90% coverage on modified files

---

## 🚨 CRITICAL PATH TESTS (Must Pass Before Deploy)

1. **TEST-003**: Concurrency race condition (slot booking)
2. **TEST-006**: Transaction rollback (Stripe failure)
3. **TEST-004**: Production bundle security (no mock auth)
4. **TEST-001**: Password validation (Story 2.1 AC)
5. **TEST-008**: E2E concurrent booking

**Deploy Blocker Criteria**: ANY of above tests fail = NO DEPLOY

---

**Test Plan Status**: ✅ READY FOR IMPLEMENTATION

**Next Actions**:

- [a] Start implementing FIX-001 (password validation)
- [b] Review test plan and request changes
- [c] Generate CI/CD pipeline configuration
- [d] Return to main menu
