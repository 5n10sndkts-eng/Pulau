# TypeScript Type Safety - Known Issues

This document tracks pre-existing type safety issues surfaced by enabling strict TypeScript settings in Story 1.5.

## Priority: Medium (Future Stories)

These issues existed before Story 1.5 and should be addressed in subsequent refactoring stories:

## Summary: 82 Pre-existing Type Errors

### Error Breakdown by Component

#### ErrorHandling.tsx - 24 errors

**Missing UI Component Imports:**

- 14 errors: Cannot find name 'Button' (used but not imported)
- 6 errors: Cannot find name 'Card' / 'CardContent' (used but not imported)
- 4 errors: Cannot find name 'toast' (Sonner toast not imported)

**Fix:** Import Button, Card, CardContent from '@/components/ui/' and toast from 'sonner'

---

#### EditProfileScreen.tsx - 16 errors

**Missing Form Component Imports:**

- 8 errors: Cannot find name 'Label' (used but not imported)
- 6 errors: Cannot find name 'Input' (used but not imported)
- 2 errors: Parameter 'e' implicitly has 'any' type (missing event type annotations)

**Fix:** Import Label and Input from '@/components/ui/', add type annotations for event handlers

---

#### Chart Component (chart.tsx) - 7 errors

**Recharts Type Incompatibilities:**

- 2 errors: Property 'payload' / 'label' does not exist on tooltip props type
- 2 errors: Parameter 'item' / 'index' implicitly has 'any' type
- 1 error: Type constraint violation for 'payload' in legend props
- 2 errors: Property 'length' / 'map' does not exist on empty object type

**Fix:** Add proper Recharts type imports and type annotations for chart callbacks

---

#### ProfileScreen.tsx - 4 errors

**Property Access Issues:**

- 4 errors: Property 'highlight' does not exist on menu item union type

**Fix:** Add 'highlight' as optional property to menu item type, or use type guard

---

#### Checkout Components - 5 errors

**Null Safety Issues:**

- ReviewStep.tsx: 3 errors - Object is possibly 'undefined' (lines 24, 65, 69)
- TravelerDetailsStep.tsx: 1 error - Type incompatibility with undefined in traveler info
- AvailabilityCalendar.tsx: 1 error - Argument type 'string | undefined' not assignable

**Fix:** Add null checks using optional chaining and nullish coalescing patterns

---

#### Vendor Components - 4 errors

**Type Mismatches:**

- App.tsx: 1 error - VendorSession prop 'session' does not exist on VendorBookingsProps
- VendorAvailabilityCalendar.tsx: 3 errors - undefined type issues (lines 97, 142, 187)

**Fix:** Add 'session' prop to VendorBookingsProps interface, add undefined checks

---

#### Calendar Component (calendar.tsx) - 2 errors

**SVG Props Type Mismatch:**

- 2 errors: Button props incompatible with SVGProps<SVGSVGElement> (ChevronLeft/Right icons)

**Fix:** Cast icon components or use proper button wrapper

---

#### Error Boundary - 2 errors

**Missing Type Annotations:**

- ErrorFallback.tsx: 2 errors - Binding elements 'error' and 'resetErrorBoundary' implicitly have 'any' type

**Fix:** Add ErrorBoundaryProps interface with proper types

---

#### Other Components - 18 errors

**Various Issues:**

- HomeScreen.tsx: 1 error - Cannot find name 'LucideIcon' (type not exported)
- Onboarding.tsx: 1 error - Argument type incompatibility for date range
- PaymentMethodsScreen.tsx: 1 error - Argument 'string | undefined' not assignable
- ShareTripModal.tsx: 1 error - Function check always returns true
- TripBuilder.tsx: 2 errors - Object possibly undefined
- TripsDashboard.tsx: 2 errors - Expected 0 arguments, but got 1
- conflictDetection.ts: 2 errors - 'hours' / 'minutes' possibly undefined
- AvailabilityCalendar.tsx: 2 additional errors - undefined type issues

**Fix:** Add proper type imports, null checks, and type guards as needed

---

## Story 1.5 Deliverables ✅

Story 1.5 successfully delivered:

1. ✅ Strict TypeScript configuration (`strict`, `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`)
2. ✅ Type declaration file for lucide-react ESM imports
3. ✅ Null safety utility library (`src/lib/null-safety.ts`)
4. ✅ Enhanced discriminated union types (`src/lib/types.ts`)
5. ✅ Comprehensive type safety tests (17 tests passing)
6. ✅ Type checking npm script

**Note:** Story 1.5 deliverables (null-safety.ts, types.ts enhancements) contain NO type errors.
All 82 errors are in pre-existing application code written before strict mode was enabled.

---

## Recommendation

Create a follow-up story "Fix TypeScript Strict Mode Errors" in Epic 2 or 3 to systematically address these 82 pre-existing type errors using the null safety patterns established in Story 1.5.

### Suggested Fix Priority:

1. **Phase 1 (Quick Wins)** - Missing imports: 40 errors (ErrorHandling, EditProfileScreen, HomeScreen)
2. **Phase 2 (Null Safety)** - Add null checks: 25 errors (Checkout, Vendor, TripBuilder components)
3. **Phase 3 (Complex Types)** - Chart/Calendar types: 9 errors (Recharts, SVG props)
4. **Phase 4 (Misc)** - Error boundary, type guards: 8 errors

---

## Build Status

- ✅ Tests: 130/130 passing
- ✅ ESLint: 0 errors, 4 warnings (pre-existing React Hooks warnings)
- ⚠️ Type Check: 82 errors (pre-existing code, not Story 1.5 deliverables)
- ✅ Production Build: Passes (type-check is not blocking)
