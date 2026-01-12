# ATDD Checklist - Epic 33, Story 1: Sticky Trip Bar Implementation

**Date:** 2026-01-12
**Author:** Moe
**Primary Test Level:** E2E / Component

---

## Story Summary

As a **Traveler**, I want to **see a persistent summary of my trip items and total cost at the bottom of the screen**, So that **I can track my budget in real-time and access checkout instantly without navigating away from the discovery feed.**

---

## Acceptance Criteria

1. **Conditional Visibility**: Hidden when 0 items, visible when >0 items.
2. **Appearance Animation**: Slides up/fades in on first item add. Displays item count and price.
3. **Real-Time Updates**: Instant updates for count/price. Pulse animation on change.
4. **Layout & Positioning**: Fixed at bottom. Respects safe-area insets. Does not obscure content.
5. **Interaction & Expansion**: Tap expands to "Trip Canvas" (Bottom Sheet). "Checkout" button leads to checkout flow.

---

## Failing Tests Created (RED Phase)

### E2E Tests (5 tests)

**File:** `tests/e2e/sticky-trip-bar.spec.ts` (144 lines)

- ✅ **Test:** should show sticky trip bar when items are added to trip
  - **Status:** RED - Element not visible
  - **Verifies:** Basic visibility on item add
- ✅ **Test:** should be accessible via keyboard
  - **Status:** RED - Element not found
  - **Verifies:** Accessibility and navigation
- ✅ **Test:** should show correct trip count
  - **Status:** RED - Incorrect text content
  - **Verifies:** Data accuracy
- ✅ **Test:** should persist trip state across navigation
  - **Status:** RED - Element disappears on nav
  - **Verifies:** Persistence
- ✅ **Test:** should handle mobile safe area on iOS devices
  - **Status:** RED - Overlap or wrong position
  - **Verifies:** Layout constraints

### Component Tests (7 tests)

**File:** `src/components/__tests__/StickyTripBar.test.tsx` (562 lines)

- ✅ **Test:** AC #1: Conditional Visibility
  - **Status:** RED - Component renders when empty
  - **Verifies:** Hidden/Visible logic
- ✅ **Test:** AC #2: Appearance Animation
  - **Status:** RED - Missing animation classes
  - **Verifies:** Entry animations
- ✅ **Test:** AC #3: Real-Time Updates
  - **Status:** RED - Value doesn't update or animate
  - **Verifies:** Reactivity to context
- ✅ **Test:** AC #4: Layout & Positioning
  - **Status:** RED - CSS classes missing (fixed, bottom-0)
  - **Verifies:** CSS layout compliance
- ✅ **Test:** AC #5: Interaction & Expansion
  - **Status:** RED - Click does nothing
  - **Verifies:** Event handling and Drawer logic
- ✅ **Test:** should navigate to checkout
  - **Status:** RED - Navigation not triggered
  - **Verifies:** Routing integration
- ✅ **Test:** Currency Formatting
  - **Status:** RED - Raw number displayed
  - **Verifies:** Helper function integration

---

## Data Factories Created

Factories used via `localStorage` mocks in component tests and interaction flows in E2E.

- **Manual Mocking:** `mockTrip` object structure defined in `StickyTripBar.test.tsx`.
- **E2E Helper:** `auth.fixture` provides authentication state.

---

## Fixtures Created

### Auth Fixtures

**File:** `tests/support/fixtures/auth.fixture.ts`

**Fixtures:**

- `auth` - Authenticated state helper
  - **Provides:** `loginAs()` method for guest/user scenarios

---

## Mock Requirements

### Local Storage / Context Mock
- **Requirements:** Must support `pulau_guest_trip` key format matching `Trip` type.
- **Provider:** `TripProvider` must be wrapped in tests.

### Third-Party Mocks
- `react-router-dom`: `useNavigate` mock for verifying redirection.
- `sonner`: Toast notifications (mocked to prevent UI interfering).

---

## Required data-testid Attributes

### StickyTripBar

- `view-trip-summary` (or implicit role button) - Main bar container
- `checkout-button` (or implicit role button) - Specific checkout action

---

## Implementation Checklist

### Test: StickyTripBar Component Tests

**File:** `src/components/__tests__/StickyTripBar.test.tsx`

**Tasks to make this test pass:**

- [x] Create `src/components/StickyTripBar.tsx`
- [x] Implement conditional rendering based on `tripItems.length`
- [x] Add framer-motion `AnimatePresence` and `motion.div`
- [x] Connect to `useTrip` context
- [x] Style with tailwind `fixed bottom-0 pb-safe`
- [x] Add click handlers for expansion and checkout
- [x] Run test: `npm test src/components/__tests__/StickyTripBar.test.tsx`
- [x] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: E2E Verification

**File:** `tests/e2e/sticky-trip-bar.spec.ts`

**Tasks to make this test pass:**

- [x] Ensure `StickyTripBar` is mounted in `App.tsx` layout
- [x] Verify z-index stacking context
- [x] Test mobile viewport behavior
- [x] Run test: `npx playwright test tests/e2e/sticky-trip-bar.spec.ts`
- [x] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm test src/components/__tests__/StickyTripBar.test.tsx && npx playwright test tests/e2e/sticky-trip-bar.spec.ts

# Run specific test file
npm test src/components/__tests__/StickyTripBar.test.tsx

# Run tests in headed mode (see browser)
npx playwright test tests/e2e/sticky-trip-bar.spec.ts --headed
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**
- ✅ All tests written and failing
- ✅ Fixtures and factories created
- ✅ Mock requirements documented
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

---

### GREEN Phase (Complete) ✅

**DEV Agent Responsibilities:**
- ✅ Implementation complete
- ✅ All tests passing

---

### REFACTOR Phase (Complete) ✅

**DEV Agent Responsibilities:**
- ✅ Code reviewed for quality
- ✅ Optimizations applied (re-render checks)
- ✅ Code duplication extracted

---

## Next Steps

1. **Share this checklist** reference for future regressions.
2. **Mark Story 33-1** as verified with this ATDD record.

---

**Generated by Antigravity** - 2026-01-12
