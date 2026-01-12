### Story 28.5: Create Audit Service Module

As a **developer**,
I want an `auditService.ts` module,
So that audit log operations are centralized.

**Acceptance Criteria:**

**Given** the auditService module exists
**When** used throughout the application
**Then** it provides functions for:
  - `createAuditEntry(eventType, entityType, entityId, actorId, metadata)` - Log event
  - `getAuditLog(entityType, entityId)` - Retrieve log for entity
  - `getAuditLogByDateRange(startDate, endDate)` - Time-based query
**And** entries are insert-only (no updates or deletes)
**And** TypeScript types for event types are exhaustive
**And** sensitive data is redacted from metadata

---
