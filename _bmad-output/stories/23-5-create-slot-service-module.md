# Story 23.5: Create Slot Service Module

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want a `slotService.ts` module,
So that slot CRUD operations are centralized and type-safe.

## Acceptance Criteria

1. **Given** the slotService module exists
   **When** used throughout the application
   **Then** it provides functions for:
     - `createSlot(experienceId, slotData)` - Create new slot
     - `updateSlot(slotId, updates)` - Update slot details
     - `blockSlot(slotId, reason?)` - Mark slot as blocked
     - `unblockSlot(slotId)` - Remove block
     - `getAvailableSlots(experienceId, dateRange)` - Query available slots
     - `decrementAvailability(slotId, count)` - Atomic decrement with locking

2. **Given** any slot mutation is performed
   **When** the operation completes successfully
   **Then** appropriate audit log entries are created

3. **Given** TypeScript is used
   **When** the module is imported
   **Then** all types match the database schema (experience_slots table)

## Tasks / Subtasks

- [x] Task 1: Create slotService.ts module structure (AC: #1, #3)
  - [x] 1.1: Define ExperienceSlot types matching database schema
  - [x] 1.2: Define SlotCreateInput and SlotUpdateInput types
  - [x] 1.3: Create service module skeleton

- [x] Task 2: Implement slot CRUD functions (AC: #1)
  - [x] 2.1: Implement createSlot function
  - [x] 2.2: Implement updateSlot function
  - [x] 2.3: Implement blockSlot and unblockSlot functions
  - [x] 2.4: Implement getAvailableSlots with date range filtering

- [x] Task 3: Implement atomic availability operations (AC: #1)
  - [x] 3.1: Implement decrementAvailability with optimistic locking
  - [x] 3.2: Handle race conditions with retry logic

- [x] Task 4: Add audit logging (AC: #2)
  - [x] 4.1: Create audit log entries for slot operations
  - [x] 4.2: Include relevant metadata in logs

## Dev Notes

### Architecture Patterns & Constraints

**Database Schema (experience_slots):**
```sql
create table public.experience_slots (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id),
  slot_date date not null,
  slot_time time not null,
  total_capacity integer not null,
  available_count integer not null,
  price_override_amount integer, -- NULL = use experience base price, in cents
  is_blocked boolean default false,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Atomic Decrement Pattern:**
Use `update ... set available_count = available_count - $count where available_count >= $count` for atomic operations without explicit locking.

**RLS Policies:**
- SELECT: Public (anyone can view slots)
- INSERT/UPDATE/DELETE: Vendor owner only

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Story 23.5]
- [Source: supabase/migrations/20260109000001_create_experience_slots.sql]
- Epic 21: Created experience_slots table schema
- Story 23.1-23.4 depend on this service

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

- `src/lib/slotService.ts` (CREATED) - Complete slot service module with CRUD, blocking, and availability operations

### Completion Notes

All 3 acceptance criteria implemented:
- AC1: All required functions implemented: createSlot, updateSlot, blockSlot, unblockSlot, getAvailableSlots, decrementAvailability (plus bonus: createBulkSlots, getAllSlots, getSlotById, incrementAvailability, deleteSlot)
- AC2: All mutations create audit log entries with relevant metadata (slot.created, slot.updated, slot.blocked, slot.unblocked, slot.availability_decremented, slot.availability_incremented, slot.deleted)
- AC3: All types derived from Database['public']['Tables']['experience_slots'] via database.types.ts

**Key Implementation Details:**
- Optimistic locking pattern for atomic decrementAvailability (prevents overbooking)
- Bulk slot creation for recurring patterns
- Slot deletion protection (cannot delete slots with existing bookings)
- incrementAvailability capped at total_capacity

### Senior Developer Review

**Reviewed**: 2026-01-09
**Issues Found**: 1 (1 CRITICAL)
**Issues Fixed**: 1

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| CR-1 | CRITICAL | Tasks not marked complete | Fixed - all tasks marked [x] |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-09 | Created story file | Sprint planning |
| 2026-01-09 | Created slotService.ts | Implement slot CRUD operations |
| 2026-01-09 | Code review fixes | CR-1 |
| 2026-01-09 | Marked done | All ACs met |
