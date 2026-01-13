# Test Coverage Review Report

## Executive Summary

The Pulau project has a healthy test infrastructure (Vitest + Playwright), but actual coverage is uneven. While high-level E2E flows and a few selected services are tested, the **core transactional logic** (slots, vendor onboarding) and **complex UI states** (real-time updates) have significant gaps.

**Overall Rating**: 🟡 **Moderate Risk**  
_The application is well-architected for testing, but critical business logic in `slotService` and vendor operations is currently flying blind._

---

## 🏗️ Infrastructure Status

- **Unit/Integration (Vitest)**: ✅ Configured, fast, uses `jsdom`.
- **E2E (Playwright)**: ✅ Configured, multi-browser, integrated with CI.
- **CI/CD**: ✅ Fully automated with 4 parallel shards and burn-in loops.

---

## 📊 Coverage Map

### 1. Core Services (`src/lib`)

| Service                   | Coverage Status | Complexity    | Risk            |
| :------------------------ | :-------------- | :------------ | :-------------- |
| `realtimeService.ts`      | ✅ High         | Medium        | Low             |
| `paymentService.ts`       | ✅ Medium       | Medium        | Medium          |
| `vendorStateMachine.ts`   | ✅ High         | High          | Low             |
| `slotService.ts`          | ❌ **None**     | **Very High** | 🔥 **Critical** |
| `vendorOnboardService.ts` | ❌ **None**     | High          | High            |
| `experienceService.ts`    | 🟡 Low          | High          | Medium          |
| `bookingService.ts`       | ❌ **None**     | Medium        | Medium          |

### 2. UI Components (`src/components`)

| Component              | Coverage Status | Type of Test | Notes                                           |
| :--------------------- | :-------------- | :----------- | :---------------------------------------------- |
| Auth Flow              | ✅ Good         | E2E          | Covers login/signup.                            |
| Checkout Flow          | 🟡 Moderate     | E2E + Unit   | Needs more edge case testing for pricing.       |
| `ExperienceDetail.tsx` | ❌ **None**     | -            | No unit tests for real-time subscription logic. |
| `ExploreScreen.tsx`    | 🟡 Low          | E2E          | Filter logic is complex and largely untested.   |
| Vendor Dashboard       | ❌ **None**     | -            | **Major blind spot** for vendor operations.     |
| Trip Builder           | ❌ **None**     | -            | High visual/logic complexity.                   |

---

## 🔥 Critical Gaps Identified

### 1. Atomic Inventory & Slots (`slotService.ts`)

The logic for creating, blocking, and atomically decrementing inventory is the "heart" of Phase 2a. Currently, there are no unit tests for this 700+ line service.

- **Recommendation**: Implement `slotService.test.ts` focusing on concurrency and error states.

### 2. Real-Time UI Synchronization

While `realtimeService` is tested, the actual UI response in `ExperienceDetail.tsx` (animations, state updates) is only verified manually.

- **Recommendation**: Add integration tests using `@testing-library/react` to mock real-time broadcasts.

### 3. Vendor Experience Management

The onboarding and experience creation flows for vendors are long and involve complex state transitions.

- **Recommendation**: Add unit tests for `vendorOnboardService` and integration tests for the `VendorExperienceForm`.

---

## 🚀 Recommended Roadmap

1.  **Phase 1 (Immediate)**:
    - [ ] Create `slotService.test.ts` covering all CRUD operations.
    - [ ] Add unit tests for `bookingService.ts`.
2.  **Phase 2 (UX Stability)**:
    - [ ] Add integration tests for `ExperienceDetail` verifying real-time availability UI updates.
    - [ ] Implement tests for `CheckoutReview` edge cases (coupons, guest limits).
3.  **Phase 3 (Vendor Operations)**:
    - [ ] Targeted tests for `vendorOnboardService`.
    - [ ] E2E flow for the complete vendor journey from signup to first slot creation.

---

## 💡 Proactive Improvement

To automate this in the future, I recommend installing `@vitest/coverage-v8` to get precise metrics on every PR.
