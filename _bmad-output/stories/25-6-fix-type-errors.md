# Story 25-6: Fix Phase 2a Type Errors

**Epic**: 25 - Real-Time Inventory & Availability  
**Priority**: P0 - Build Breaking  
**Status**: done  
**Effort**: 4-6 hours  
**Created**: 2026-01-12

## Context

TypeScript compilation currently fails across multiple files in Epic 25 implementation, blocking production builds. Issues stem from incorrect property names, improper destructuring, and missing RPC functions.

## User Story

As a **developer**, I need **all TypeScript compilation errors resolved** so that **the application builds successfully and can be deployed to production**.

## Acceptance Criteria

- [x] All TypeScript files compile without errors
- [x] `npm run type-check` passes with zero errors
- [x] `npm run build` completes successfully
- [x] All existing tests continue to pass
- [x] No runtime regressions introduced

## Tasks

- [x] **DEF-001**: Fix `src/lib/auditService.ts:44`
  - Change `user_id` → `actor_id`
  - Add required `actor_type` field (derive from context or default to 'user')
  - Verify auditService types align with `audit_logs` table schema
- [x] **DEF-002**: Fix `src/components/RealtimeSlotDisplay.tsx:108-113`
  - Properly destructure `{ data, error }` from useQuery result
  - Handle loading state correctly
  - Verify component renders without type errors
- [x] **DEF-003**: Create `decrement_slot_inventory` RPC function
  - Write database migration in `supabase/migrations/`
  - Implement atomic inventory decrement logic
  - Add RPC function signature to TypeScript types
  - Run migration on local database
  - Regenerate Supabase types: `npm run db:types`
- [x] **DEF-004**: Fix `src/lib/realtimeService.test.ts:44`
  - Update mock to return valid status: `'ok' | 'error' | 'timed out'`
  - Verify test compiles and runs
- [x] Run full type check: `npm run type-check`
- [x] Run build verification: `npm run build`
- [x] Run test suite: `npm run test`

## Technical Notes

### RPC Function Schema

```sql
CREATE OR REPLACE FUNCTION decrement_slot_inventory(
  slot_id_param UUID,
  quantity_param INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE experience_slots
  SET current_capacity = current_capacity - quantity_param
  WHERE id = slot_id_param
    AND current_capacity >= quantity_param
  RETURNING jsonb_build_object(
    'success', true,
    'new_capacity', current_capacity
  ) INTO result;

  IF result IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient capacity');
  END IF;

  RETURN result;
END;
$$;
```

### Audit Service Fix

```typescript
// Change from:
user_id: input.userId || session?.session?.user?.id,

// To:
actor_id: input.userId || session?.session?.user?.id,
actor_type: 'user', // or derive from context
```

## Quality Gates

**Complete ALL items BEFORE marking story as 'done'**

### Implementation Checklist

- [x] All task checkboxes marked with [x]
- [x] Code compiles without TypeScript errors
- [x] All tests passing (unit + integration + E2E where applicable)
- [x] No P0/P1 defects identified in code review
- [x] Code follows project conventions and style guide

### Documentation Checklist

- [x] Dev Agent Record completed with:
  - Agent model used
  - Debug log references
  - Completion notes with summary
  - Complete file list
- [x] All Acceptance Criteria verified and documented as met
- [x] Known issues or limitations documented in story notes

### Verification Checklist

- [x] Feature tested in development environment
- [x] Edge cases handled appropriately
- [x] Error states implemented and tested
- [x] Performance acceptable (no obvious regressions)

### Definition of Done

Story can ONLY move to 'done' status when:

1. ✅ All quality gate checkboxes completed
2. ✅ Peer review completed (or pair programming session logged)
3. ✅ Stakeholder acceptance obtained (if user-facing feature)
4. ✅ Deployment successful (if applicable to current sprint)

## Dev Agent Record

**Agent Model Used**: Claude (Anthropic) / GitHub Copilot  
**Debug Log References**: Build output from `npm run type-check`  
**Completion Notes**: Fixed 4 P0 build-breaking type errors in Phase 2a codebase:
- DEF-001: auditService.ts - Changed `user_id` to `actor_id`, added `actor_type`
- DEF-002: RealtimeSlotDisplay.tsx - Fixed useQuery destructuring pattern
- DEF-003: slotService.ts - Created `decrement_slot_inventory` RPC migration
- DEF-004: realtimeService.test.ts - Fixed mock return type to valid status

**Files Modified**:
- `src/lib/auditService.ts` - Schema alignment fix
- `src/components/RealtimeSlotDisplay.tsx` - Query result destructuring
- `src/lib/slotService.ts` - RPC function call alignment
- `src/lib/realtimeService.test.ts` - Test mock fix
- `supabase/migrations/20260112100001_create_decrement_slot_rpc.sql` - New RPC function

---

**Related Defects**: DEF-001, DEF-002, DEF-003, DEF-004  
**Blocked By**: None  
**Blocks**: Epic 25 completion, production deployment  
**Change Proposal**: [sprint-change-proposal-2026-01-12.md](/_bmad-output/planning-artifacts/sprint-change-proposal-2026-01-12.md)
