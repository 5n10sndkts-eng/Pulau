# Story 25-7: Fix StickyTripBar Test Regressions

**Epic**: 25 - Real-Time Inventory & Availability
**Priority**: P2 (High)
**Status**: Ready for Dev
**Estimate**: 2 Points

## 📝 Context

Validation of Phase 2a identified a regression in the test suite with 15 failures in the `StickyTripBar` component. This component is essential for conversion, providing the persistent booking call-to-action. The failures indicate a drift between the component implementation and its test expectations, likely due to recent refactors in the booking flow or pricing display.

## ✅ Acceptance Criteria

### AC-25.7-1: Test Suite Green (P0)

- **Given** the project test suite
- **When** `npm run test` is executed
- **Then** `StickyTripBar` tests pass without errors
- **And** overall suite pass rate returns to 100% (500/500)

### AC-25.7-2: Component Functionality (P1)

- **Given** a user viewing an experience
- **When** they scroll down the page
- **Then** the StickyTripBar renders the correct price and availability status
- **And** the "Check Availability" / "Book" button functions correctly

## 🛠️ Technical Tasks

- [x] **Diagnose Failures**: Run `npx vitest src/components/experiences/__tests__/StickyTripBar.test.tsx` to capture error output.
- [ ] **Fix Props/Types**: Address any TypeScript errors or prop mismatches causing render failures.
- [ ] **Update Logic**: Align test expectations with recent changes to `useRealtimeSlots` or pricing logic if applicable.
- [ ] **Snapshot Update**: If UI changes are valid, update test snapshots.
- [ ] **Verify CI**: Ensure `npm run build` and `npm run test` pass locally.

## 🔗 References

- Validation Report: `_bmad-output/planning-artifacts/story-validation-framework-2026-01-12.md`

## Dev Agent Record

**Agent Model Used**: Gemini Code Assist
**Completion Notes**: Ran the test suite for `StickyTripBar` and captured the error output. The failures are primarily due to a `TypeError` related to the `price` prop and a `TestingLibraryElementError` where the "Sold Out" text is not found. This confirms a drift between the component's implementation and its tests, likely from recent refactors.
**Files Modified**:

- `/Users/moe/Pulau/25-7-fix-stickytripbar-regressions.md`
