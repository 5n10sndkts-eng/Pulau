# TypeScript Type Safety - Known Issues

This document tracks pre-existing type safety issues surfaced by enabling strict TypeScript settings in Story 1.5.

## Priority: Medium (Future Stories)
These issues existed before Story 1.5 and should be addressed in subsequent refactoring stories:

### Null Safety Issues (10 errors)
- `src/components/checkout/ReviewStep.tsx` - Object possibly undefined (3 occurrences)
- `src/components/checkout/TravelerDetailsStep.tsx` - Type incompatibility with undefined
- `src/components/Onboarding.tsx` - Argument type incompatibility  
- `src/components/TripBuilder.tsx` - Object possibly undefined (2 occurrences)
- `src/components/TripsDashboard.tsx` - Unexpected function arguments (2 occurrences)

### Missing Type Imports (2 errors)
- `src/components/ExperienceDetail.tsx` - ChevronRight not imported
- `src/components/HomeScreen.tsx` - LucideIcon type not imported

### Chart Component Type Issues (7 errors)
- `src/components/ui/chart.tsx` - Recharts type incompatibilities
  - Missing payload/label properties
  - Implicit any types
  - Type constraint violations

### Calendar Icon Type Issues (2 errors)
- `src/components/ui/calendar.tsx` - SVGProps type mismatch with button props

### Error Boundary Types (2 errors)
- `src/ErrorFallback.tsx` - Missing type annotations for error boundary props

## Story 1.5 Deliverables ✅
Story 1.5 successfully delivered:
1. ✅ Strict TypeScript configuration (`strict`, `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`)
2. ✅ Type declaration file for lucide-react ESM imports
3. ✅ Null safety utility library (`src/lib/null-safety.ts`)
4. ✅ Enhanced discriminated union types (`src/lib/types.ts`)
5. ✅ Comprehensive type safety tests (17 tests passing)
6. ✅ Type checking npm script

## Recommendation
Create a follow-up story "Fix TypeScript Strict Mode Errors" in Epic 2 or 3 to systematically address these 23 pre-existing type errors using the patterns established in Story 1.5.

## Build Status
- ✅ Tests: 63/63 passing
- ✅ ESLint: 0 errors, 10 warnings (pre-existing, non-blocking)
- ⚠️  Type Check: 23 errors (pre-existing code, not Story 1.5 deliverables)
- ✅ Production Build: Passes (type-check is not blocking)
