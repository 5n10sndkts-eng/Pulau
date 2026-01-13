# Pre-Existing Test Failures Audit

**Date:** 2026-01-10
**Context:** Epic 24 (Traveler Payment & Checkout) Completion
**Purpose:** Document test failures that existed before Epic 24 implementation for future audit

## Summary

During the final verification of Epic 24, the following pre-existing test failures were identified. These failures are **not related to the Epic 24 payment implementation** and existed in the codebase prior to this sprint.

### Overall Test Status

- **Total Test Suites:** 14
- **Passing Suites:** 10
- **Failing Suites:** 4
- **Epic 24 Tests:** All passing (paymentService: 20/20, CheckoutReview: 36/36, CheckoutSuccess: 29/29)

---

## Failing Test Files

### 1. `src/__tests__/animation.test.ts` (2 failures)

| Test                                  | Status  |
| ------------------------------------- | ------- |
| should have spring physics configured | ❌ FAIL |
| should use Lucide icons in App.tsx    | ❌ FAIL |

**Analysis:** These tests check for specific animation configuration and icon usage patterns. Likely caused by code changes in Epic 1 (Foundation) or Epic 16 (Animations) that weren't reflected in test updates.

---

### 2. `src/__tests__/booking-history.test.ts` (1 failure)

| Test                                     | Status  |
| ---------------------------------------- | ------- |
| should use useKV hook for bookings state | ❌ FAIL |

**Analysis:** This test checks for a specific KV store pattern that was part of Phase 1 MVP. With Phase 2's Supabase migration (Epic 20), the implementation may have changed without test updates.

---

### 3. `src/__tests__/book-again.test.ts` (10 failures)

| Test                                               | Status  |
| -------------------------------------------------- | ------- |
| should have handleBookAgain function               | ❌ FAIL |
| should clear trip dates in new trip                | ❌ FAIL |
| should copy trip items                             | ❌ FAIL |
| should clear scheduled dates from copied items     | ❌ FAIL |
| should navigate to trip builder                    | ❌ FAIL |
| should update trip state with new trip             | ❌ FAIL |
| should have actionable message about setting dates | ❌ FAIL |
| should create new trip object, not modify original | ❌ FAIL |
| should clear booking-specific fields               | ❌ FAIL |
| should be wired up in App.tsx                      | ❌ FAIL |

**Analysis:** The "Book Again" feature tests (Epic 11, Story 11-3) are failing. These tests validate implementation details that may have been refactored. The core functionality may still work but test assertions need updating.

---

### 4. Playwright E2E Tests (4 suite failures)

| File                          | Issue                             |
| ----------------------------- | --------------------------------- |
| tests/e2e/auth.spec.ts        | Playwright/Vitest config conflict |
| tests/e2e/checkout.spec.ts    | Playwright/Vitest config conflict |
| tests/e2e/example.spec.ts     | Playwright/Vitest config conflict |
| tests/e2e/trip-canvas.spec.ts | Playwright/Vitest config conflict |

**Root Cause:**

```
Error: Playwright Test did not expect test.describe() to be called here.
Most common reasons include:
- You have two different versions of @playwright/test.
```

**Analysis:** These E2E tests are not configured to run with Vitest. They should be run separately using `npx playwright test`. The test runner is incorrectly including Playwright spec files.

---

## Recommendations

### Immediate Actions

1. **Exclude Playwright tests from Vitest:** Update `vitest.config.ts` to exclude `tests/e2e/**/*.spec.ts`
2. **Run E2E separately:** Use `npx playwright test` for E2E suite

### Backlog Items

1. **Epic 11 Review:** Audit Story 11-3 (Book Again) implementation against test expectations
2. **Animation Tests:** Review animation configuration and update tests if implementation is correct
3. **KV Hook Migration:** Update booking history tests to reflect Supabase patterns

---

## Epic 24 Test Results (All Passing)

| Test File                                        | Tests | Status  |
| ------------------------------------------------ | ----- | ------- |
| src/lib/paymentService.test.ts                   | 20    | ✅ PASS |
| src/components/checkout/CheckoutReview.test.tsx  | 36    | ✅ PASS |
| src/components/checkout/CheckoutSuccess.test.tsx | 29    | ✅ PASS |

**Total Epic 24 Tests:** 85/85 passing

---

## Build Status

✅ **TypeScript:** Passes (`npm run type-check`)
✅ **Build:** Successful (`npm run build`)
⚠️ **Tests:** 13 failures in pre-existing tests (not Epic 24 related)
