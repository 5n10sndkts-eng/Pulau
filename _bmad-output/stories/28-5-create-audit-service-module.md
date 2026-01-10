# Story 28.5: Create Audit Service Module

Status: ready-for-dev

## Story

As a **developer**,
I want an `auditService.ts` module,
So that audit log operations are centralized.

## Acceptance Criteria

1. **Given** the auditService module exists
   **When** used throughout the application
   **Then** it provides functions for:
   - `createAuditEntry(eventType, entityType, entityId, actorId, metadata)` - Log event
   - `getAuditLog(entityType, entityId)` - Retrieve log for entity
   - `getAuditLogByDateRange(startDate, endDate)` - Time-based query
   **And** entries are insert-only (no updates or deletes)
   **And** TypeScript types for event types are exhaustive
   **And** sensitive data is redacted from metadata

## Tasks / Subtasks

- [ ] Create auditService.ts module (AC: 1)
  - [ ] Create file at `src/lib/auditService.ts`
  - [ ] Import Supabase client
  - [ ] Define TypeScript interfaces for audit entries
  - [ ] Export all service functions
- [ ] Implement createAuditEntry function (AC: 1)
  - [ ] Accept parameters: eventType, entityType, entityId, actorId, metadata
  - [ ] Insert row into audit_logs table
  - [ ] Generate timestamp automatically (database default)
  - [ ] Return inserted entry or error
  - [ ] Validate eventType against allowed types
- [ ] Implement getAuditLog function (AC: 1)
  - [ ] Accept entityType and entityId
  - [ ] Query audit_logs table filtered by entity
  - [ ] Join with users table to get actor name
  - [ ] Sort by created_at descending (newest first)
  - [ ] Return array of audit entries
- [ ] Implement getAuditLogByDateRange function (AC: 1)
  - [ ] Accept startDate and endDate parameters
  - [ ] Query audit_logs with date range filter
  - [ ] Support optional entityType filter
  - [ ] Return paginated results (default 100 per page)
- [ ] Add TypeScript types and data redaction (AC: 1)
  - [ ] Define exhaustive AuditEventType union type
  - [ ] Define AuditLogEntry interface
  - [ ] Redact sensitive fields from metadata (e.g., payment_method_id)
  - [ ] Validate metadata doesn't contain PII

## Dev Notes

### Architecture Patterns

**Service Layer Pattern:**
- Follows existing service pattern: `src/lib/*Service.ts`
- Centralizes all audit log database operations
- Used by: check-in, refunds, bookings, payments
- Implements ARCH-SVC-04 requirement

**Audit Log Principles:**
- Immutable: Insert-only, no updates or deletes
- Comprehensive: Log all critical events
- Timestamped: Automatic created_at via database
- Attributed: Always record actor (user/vendor/admin/system)
- Metadata: Flexible JSONB for event-specific data

**Event Types (Exhaustive):**
```typescript
export type AuditEventType =
  // Booking events
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_checked_in'
  | 'booking_refunded'
  | 'booking_partially_refunded'
  | 'booking_no_show'
  // Payment events
  | 'payment_initiated'
  | 'payment_received'
  | 'payment_failed'
  | 'payment_refunded'
  // Vendor events
  | 'vendor_onboarded'
  | 'vendor_payout_scheduled'
  | 'vendor_payout_completed'
  // Admin events
  | 'admin_refund_processed'
  | 'admin_booking_modified'
  // System events
  | 'system_reminder_sent'
  | 'system_sync_completed'
```

### Code Quality Requirements

**TypeScript Patterns:**
- Use ApiResponse pattern for all functions
- Define strict interfaces for parameters
- Exhaustive union types for event types
- Handle null/undefined gracefully

**Data Redaction:**
```typescript
function redactSensitiveData(metadata: Record<string, any>): Record<string, any> {
  const redacted = { ...metadata }
  const sensitiveKeys = ['payment_method_id', 'card_number', 'cvv', 'password']
  
  for (const key of sensitiveKeys) {
    if (redacted[key]) {
      redacted[key] = '[REDACTED]'
    }
  }
  
  return redacted
}
```

**Error Handling:**
- Return errors in ApiResponse pattern (don't throw)
- Log errors to console for debugging
- Handle Supabase RLS policy violations
- Validate eventType before insert

### File Structure

**Files to Create:**
- `src/lib/auditService.ts` - New service module

**Files to Reference:**
- `src/lib/supabaseClient.ts` - Supabase client
- `src/lib/types.ts` - Type definitions
- Other service files for pattern reference

**Service Implementation:**
```typescript
import { supabase } from './supabaseClient'

export type AuditEventType = /* ... */

export interface AuditLogEntry {
  id: string
  eventType: AuditEventType
  entityType: string
  entityId: string
  actorId: string | null  // null for system events
  metadata: Record<string, any>
  createdAt: string
}

export async function createAuditEntry(
  eventType: AuditEventType,
  entityType: string,
  entityId: string,
  actorId: string | null,
  metadata: Record<string, any> = {}
): Promise<ApiResponse<AuditLogEntry>> {
  // Redact sensitive data
  const redactedMetadata = redactSensitiveData(metadata)

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      actor_id: actorId,
      metadata: redactedMetadata
    })
    .select()
    .single()

  if (error) {
    console.error('Audit log error:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getAuditLog(
  entityType: string,
  entityId: string
): Promise<ApiResponse<AuditLogEntry[]>> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:users(name)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getAuditLogByDateRange(
  startDate: string,
  endDate: string,
  entityType?: string,
  page: number = 0
): Promise<ApiResponse<AuditLogEntry[]>> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .range(page * 100, (page + 1) * 100 - 1)

  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

function redactSensitiveData(metadata: Record<string, any>): Record<string, any> {
  const redacted = { ...metadata }
  const sensitiveKeys = ['payment_method_id', 'card_number', 'cvv', 'password', 'token']
  
  for (const key of sensitiveKeys) {
    if (redacted[key]) {
      redacted[key] = '[REDACTED]'
    }
  }
  
  return redacted
}
```

### Testing Requirements

**Manual Testing:**
- Call createAuditEntry from console
- Verify entry created in database
- Call getAuditLog for test entity
- Verify entries returned in correct order
- Test getAuditLogByDateRange with various ranges
- Verify sensitive data redacted in metadata

**Integration Testing:**
- Test createAuditEntry called from:
  - Booking creation (Epic 24)
  - Check-in (Story 27.3)
  - Refund (Story 28.3)
- Verify all events logged correctly
- Check actor attribution is accurate

**Edge Cases:**
- Missing actorId (system event) → allow null
- Invalid eventType → validation error
- Large metadata object → truncate or handle
- Concurrent audit entries → no conflicts

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 28: Admin Refunds & Audit Trail
- Implements ARCH-SVC-04: auditService module
- Implements NFR-SEC-02: 7-year audit retention
- Used by multiple stories across epics

**Integration Points:**
- Called by Story 27.3 (check-in) to log check-ins
- Called by Story 28.3 (refund) to log refunds
- Called by Epic 24 (checkout) to log payments
- Displayed by Story 28.4 (audit log UI)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-28-Story-28.5]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#ARCH-SVC-04]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-SEC-02]
- [Source: project-context.md#Service-Layer-Pattern]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
