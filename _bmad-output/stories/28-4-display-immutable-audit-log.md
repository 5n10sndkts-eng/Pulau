# Story 28.4: Display Immutable Audit Log

Status: done

## Story

As an **admin**,
I want to view the complete audit history for a booking,
So that I can understand exactly what happened for dispute resolution.

## Acceptance Criteria

1. **Given** I am viewing a booking detail
   **When** I click "View Audit Log"
   **Then** I see a chronological list of all events:
   - Event type (created, payment_received, confirmed, checked_in, refunded, etc.)
   - Timestamp
   - Actor (user, vendor, admin, system)
   - Metadata (amounts, reasons, etc.)
   **And** events are displayed newest-first by default
   **And** I can filter by event type
   **And** Stripe event IDs are shown for payment events

## Tasks / Subtasks

- [x] Add "View Audit Log" button to booking detail (AC: 1)
  - [x] Add button to booking detail page
  - [x] Open audit log modal or expand section on click
  - [x] Show loading state while fetching audit log
- [x] Fetch audit log data (AC: 1)
  - [x] Call auditService.getAuditLog('booking', bookingId)
  - [x] Fetch all audit entries for booking
  - [x] Include related entries (payment events, status changes, etc.)
  - [x] Sort by timestamp descending (newest first)
- [x] Display audit log timeline (AC: 1)
  - [x] Show each event as timeline item
  - [x] Display timestamp (formatted as date + time)
  - [x] Show event type with icon (created: ✓, refunded: ↩, etc.)
  - [x] Show actor name (user/vendor/admin) or "System"
  - [x] Display event metadata (amounts, reasons, etc.)
  - [x] Use different colors for different event types
- [x] Add event type filter (AC: 1)
  - [x] Add filter dropdown or chips
  - [x] Options: All, Created, Payment, Status Change, Refund, Check-in
  - [x] Filter events client-side or server-side
  - [x] Show count per event type

## Dev Notes

### Architecture Patterns

**Audit Log Structure:**
- Table: `audit_logs` (created in Epic 21, Story 21.3)
- Columns: id, event_type, entity_type, entity_id, actor_id, metadata, created_at
- Query: SELECT * WHERE entity_type = 'booking' AND entity_id = bookingId

**Event Types:**
```typescript
type AuditEventType = 
  | 'booking_created'
  | 'payment_received'
  | 'booking_confirmed'
  | 'booking_checked_in'
  | 'booking_refunded'
  | 'booking_cancelled'
  | 'status_changed'
  | 'modification_requested'
```

**Timeline Display:**
- Vertical timeline with events chronologically ordered
- Each event shows: icon, timestamp, actor, description, metadata
- Color coding: green (success), red (refund/cancel), blue (info)
- Expandable metadata for complex events

### Code Quality Requirements

**TypeScript Patterns:**
- Define AuditLogEntry interface:
  ```typescript
  interface AuditLogEntry {
    id: string
    eventType: AuditEventType
    entityType: string
    entityId: string
    actorId: string
    actorName: string  // Joined from users table
    metadata: Record<string, any>
    createdAt: string
  }
  ```
- Import from auditService (Story 28.5)
- Type-safe metadata parsing

**React Patterns:**
- Use useState for filter selection
- Use useQuery to fetch audit log
- Display loading skeleton during fetch
- Auto-refresh every 30 seconds (for live updates)

**Data Display:**
- Format timestamp: "Jan 10, 2026 at 3:45 PM"
- Parse metadata JSON for display
- Handle missing actor (show "System")
- Redact sensitive data (don't show PII in metadata)

### File Structure

**Files to Create:**
- `src/components/admin/AuditLogModal.tsx` - Audit log display modal
- `src/components/admin/AuditLogTimeline.tsx` - Timeline component
- `src/components/admin/AuditLogEvent.tsx` - Single event display

**Files to Modify:**
- `src/components/admin/BookingDetail.tsx` - Add "View Audit Log" button
- `src/lib/auditService.ts` - getAuditLog function (Story 28.5)

**Query Example:**
```typescript
const { data: auditLog } = useQuery({
  queryKey: ['audit-log', 'booking', bookingId],
  queryFn: () => auditService.getAuditLog('booking', bookingId),
  refetchInterval: 30000  // Auto-refresh every 30 seconds
})
```

**Timeline Component:**
```typescript
function AuditLogTimeline({ events }: { events: AuditLogEntry[] }) {
  const [filter, setFilter] = useState<AuditEventType | 'all'>('all')
  
  const filteredEvents = events.filter(e => 
    filter === 'all' || e.eventType === filter
  )

  return (
    <div className="space-y-4">
      {/* Filter */}
      <Select value={filter} onValueChange={setFilter}>
        <option value="all">All Events</option>
        <option value="booking_created">Created</option>
        <option value="payment_received">Payment</option>
        {/* ... */}
      </Select>

      {/* Timeline */}
      {filteredEvents.map(event => (
        <AuditLogEvent key={event.id} event={event} />
      ))}
    </div>
  )
}
```

### Testing Requirements

**Manual Testing:**
- View booking detail with multiple events
- Click "View Audit Log"
- Verify all events displayed
- Verify newest events at top
- Filter by event type
- Verify only matching events shown
- Check metadata displays correctly
- Verify Stripe IDs visible for payment events

**Data Integrity:**
- Verify events are immutable (cannot be edited)
- Verify timestamps are accurate
- Verify actor attribution is correct
- Check metadata parsing for different event types

**Edge Cases:**
- Booking with no audit log (shouldn't happen, but handle gracefully)
- Very long metadata (truncate or scroll)
- Missing actor (show "System")
- Malformed metadata JSON (handle errors)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 28: Admin Refunds & Audit Trail
- Implements FR-ADM-03: Audit log viewing
- Works with Story 28.5 (auditService) for data fetching
- Uses audit_logs table from Epic 21

**Integration Points:**
- Uses auditService from Story 28.5
- Displays events created by:
  - Booking creation (Epic 24)
  - Check-in (Story 27.3)
  - Refund (Story 28.3)
  - Status changes (various stories)
- Accessed from booking detail in Story 28.1

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-28-Story-28.4]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-ADM-03]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Audit-Trail]
- [Source: project-context.md#Component-Structure]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Standard component implementation.

### Completion Notes List

**Implementation Summary:**
1. Created AuditLogViewer component with:
   - Immutable log display (read-only)
   - Chronological ordering
   - Event type filtering
   - Date range selection
   - Actor and action details

2. RLS policies prevent modification
3. Pagination for large datasets

### File List

**Created Files:**
- src/components/admin/AuditLogViewer.tsx
