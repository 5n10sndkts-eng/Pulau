# Audit Log Retention Policy

**Document Version:** 1.0
**Effective Date:** 2026-01-10
**Last Reviewed:** 2026-01-10
**Owner:** Pulau Platform Team

---

## 1. Purpose

This document establishes the retention policy for audit logs within the Pulau travel experience platform. The policy ensures compliance with regulatory requirements and supports business operations while maintaining data integrity.

## 2. Scope

This policy applies to all audit log entries stored in the `audit_logs` table within the Pulau database, including:

- Booking events (creation, modification, cancellation)
- Payment transactions (charges, refunds)
- Check-in operations (vendor actions)
- Administrative actions (user management, refund processing)
- System events (authentication, authorization failures)

## 3. Retention Period

### 3.1 Standard Retention

All audit log entries shall be retained for a minimum of **7 years** from the date of creation.

### 3.2 Rationale

The 7-year retention period is based on:

- **PCI-DSS Requirement 10.7**: Retain audit trail history for at least one year, with a minimum of three months immediately available for analysis
- **SOX Compliance**: Financial records retention requirement of 7 years
- **Tax regulations**: Business records retention of 7 years in most jurisdictions
- **Legal discovery**: Standard statute of limitations for contract disputes

## 4. Data Protection

### 4.1 Immutability

Audit logs are **immutable** once created:

- No UPDATE operations are permitted on the `audit_logs` table
- No DELETE operations are permitted on the `audit_logs` table
- Row-Level Security (RLS) policies enforce these restrictions at the database level

### 4.2 Database Enforcement

```sql
-- RLS policy preventing updates
CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE USING (false);

-- RLS policy preventing deletes
CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE USING (false);
```

### 4.3 Access Control

- Read access is restricted to authorized administrators only
- All access to audit logs is itself logged
- No programmatic write access except through the `logAuditEvent` service function

## 5. Data Structure

Each audit log entry contains:

| Field | Description | Example |
|-------|-------------|---------|
| id | Unique identifier (UUID) | `550e8400-e29b-41d4-a716-446655440000` |
| event_type | Category of event | `booking.created`, `refund.processed` |
| actor_id | User/system performing action | `user-uuid-here` |
| actor_type | Type of actor | `user`, `admin`, `system` |
| resource_type | Type of resource affected | `booking`, `payment` |
| resource_id | ID of affected resource | `booking-uuid-here` |
| metadata | Structured event data (JSONB) | `{"amount": 10000, "reason": "..."}` |
| ip_address | Client IP address | `192.168.1.1` |
| created_at | Timestamp (UTC) | `2026-01-10T14:30:00Z` |

## 6. Archival Strategy

### 6.1 Active Storage

- Logs less than 90 days old remain in primary database
- Full query capabilities maintained
- Real-time access for operations

### 6.2 Archive Storage

After 90 days:
- Logs may be moved to cold storage (e.g., S3 Glacier)
- Compressed and encrypted at rest
- Retrievable within 24 hours upon request

### 6.3 Deletion

After 7 years:
- Logs may be permanently deleted
- Deletion must be documented and approved
- Bulk deletion only (no selective deletion)

## 7. Compliance Verification

### 7.1 Regular Audits

- Quarterly review of retention policy compliance
- Annual external audit of data protection measures
- Automated monitoring for policy violations

### 7.2 Reporting

- Monthly retention status reports
- Incident reports for any policy violations
- Annual compliance certification

## 8. Exception Handling

### 8.1 Legal Hold

When litigation is reasonably anticipated:
- Affected logs must be preserved indefinitely
- Legal hold overrides standard retention
- Removal requires explicit legal clearance

### 8.2 Data Subject Requests

Under GDPR/CCPA:
- Audit logs are exempt from deletion requests (legitimate interest)
- Access requests may be fulfilled with appropriate safeguards
- Redaction of personal data may be applied after retention period

## 9. Responsibilities

| Role | Responsibility |
|------|----------------|
| Platform Team | Implement and maintain technical controls |
| Data Protection Officer | Oversee compliance and handle exceptions |
| System Administrators | Monitor storage and access patterns |
| Legal Team | Approve legal holds and exceptions |

## 10. Review Schedule

This policy shall be reviewed:
- Annually as part of compliance certification
- When regulatory requirements change
- Following any significant data incident

---

## Appendix A: Event Types

| Event Type | Description |
|------------|-------------|
| `booking.created` | New booking confirmed |
| `booking.cancelled` | Booking cancelled by user or admin |
| `booking.no_show` | Traveler marked as no-show |
| `check_in.completed` | Vendor checked in traveler |
| `refund.processed` | Refund issued for booking |
| `payment.captured` | Payment successfully charged |
| `payment.failed` | Payment attempt failed |
| `auth.login` | User authentication |
| `auth.logout` | User session ended |
| `admin.action` | Administrative operation |

---

## Appendix B: Regulatory References

- **PCI-DSS v4.0**: Requirement 10 - Track and Monitor All Access
- **SOX (Sarbanes-Oxley)**: Section 802 - Document Retention
- **GDPR**: Article 17 (Right to Erasure exemptions)
- **CCPA**: Business records retention requirements

---

*This document is maintained as part of the Pulau platform compliance documentation.*
