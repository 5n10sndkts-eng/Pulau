### Story 28.6: Enforce Audit Log Retention Policy

As a **platform operator**,
I want audit logs retained for 7 years,
So that we meet compliance requirements.

**Acceptance Criteria:**

**Given** audit log entries are created
**When** data retention is evaluated
**Then** entries are never automatically deleted (manual archival only)
**And** entries older than 7 years can be archived to cold storage
**And** archived entries remain queryable via admin tools
**And** retention policy is documented in compliance documentation

---
