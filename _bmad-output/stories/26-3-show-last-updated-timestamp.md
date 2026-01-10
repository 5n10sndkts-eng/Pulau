# Story 26.3: Show Last Updated Timestamp

Status: ready-for-dev

## Story

As a **traveler**,
I want to see when my ticket data was last updated,
So that I know if the information is current.

## Acceptance Criteria

1. **Given** I am viewing a cached ticket offline
   **When** the ticket displays
   **Then** I see "Last updated: [timestamp]" (e.g., "Last updated: 2 hours ago")
   **And** if data is older than 24 hours, I see a warning
   **And** a "Refresh" button is available (grayed out when offline)

## Tasks / Subtasks

- [ ] Add timestamp to cache metadata (AC: 1)
  - [ ] Store last_updated timestamp when caching ticket data
  - [ ] Use Unix timestamp (milliseconds since epoch)
  - [ ] Update timestamp when cache refreshes online
  - [ ] Retrieve timestamp from cache when displaying ticket
- [ ] Display relative timestamp (AC: 1)
  - [ ] Format timestamp as relative time (e.g., "2 hours ago", "3 days ago")
  - [ ] Use date-fns library: `formatDistanceToNow()` function
  - [ ] Display at bottom of ticket page in muted text
  - [ ] Update display every minute (for accuracy)
- [ ] Show warning for stale data (AC: 1)
  - [ ] Check if last_updated is > 24 hours old
  - [ ] Display yellow warning banner: "Ticket data may be outdated"
  - [ ] Suggest refreshing when back online
  - [ ] Use alert icon (AlertCircle from Lucide React)
- [ ] Add refresh button (AC: 1)
  - [ ] Add "Refresh" button at bottom of ticket
  - [ ] Disable button when offline (grayed out, cursor not-allowed)
  - [ ] Enable button when online
  - [ ] Show loading spinner when refreshing
  - [ ] Update timestamp after successful refresh

## Dev Notes

### Architecture Patterns

**Cache Metadata:**
- Store timestamp alongside ticket data in cache
- Use Cache API custom headers or IndexedDB metadata field
- Structure: `{ data: TicketData, metadata: { lastUpdated: number } }`

**Timestamp Formatting:**
- Use date-fns library (already in project dependencies)
- Function: `formatDistanceToNow(date, { addSuffix: true })`
- Example output: "2 hours ago", "3 days ago", "just now"
- Update every 60 seconds using setInterval

**Refresh Logic:**
- Detect online state using navigator.onLine
- Fetch latest booking data from bookingService
- Update cache with fresh data
- Update last_updated timestamp
- Show success toast notification

### Code Quality Requirements

**TypeScript Patterns:**
- Define CacheMetadata interface:
  ```typescript
  interface CacheMetadata {
    lastUpdated: number  // Unix timestamp in milliseconds
    expiresAt: number    // Timestamp when cache expires (30 days)
  }
  ```
- Import formatDistanceToNow from date-fns
- Use strict type checking for timestamp values

**React Patterns:**
- Use useState for current time (updates every minute)
- Use useEffect with setInterval for time updates
- Clean up interval on unmount
- Use useOnlineStatus custom hook for online state

**Styling:**
- Timestamp: Muted text color `oklch(0.5 0 0)`, 14px Inter Medium
- Warning banner: Yellow background `oklch(0.87 0.12 85)`, dark text
- Refresh button: Secondary variant (coral outline), disabled state gray
- Position timestamp at bottom of ticket card

### File Structure

**Files to Modify:**
- `src/components/booking/TicketPage.tsx` - Display timestamp and refresh button
- `public/sw.js` - Store timestamp in cache metadata
- `src/lib/bookingService.ts` - Add refreshBooking function

**Files to Reference:**
- `src/hooks/useOnlineStatus.ts` - Online/offline state
- `src/components/ui/button.tsx` - Refresh button styling
- `node_modules/date-fns` - formatDistanceToNow function

**Cache Structure:**
```javascript
// In Service Worker (sw.js)
const cacheData = {
  ticket: { /* TicketData */ },
  metadata: {
    lastUpdated: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)  // 30 days
  }
}
```

### Testing Requirements

**Manual Testing:**
- View ticket page while online
- Check "Last updated: just now" appears
- Go offline
- Wait 5 minutes
- Verify timestamp updates to "Last updated: 5 minutes ago"
- Modify cache timestamp to 25 hours ago
- Verify warning banner appears
- Verify refresh button disabled when offline

**Edge Cases:**
- Cache data without timestamp (fallback to "Unknown")
- Very old cache (> 30 days) → show critical warning
- Failed refresh attempt → show error toast
- Offline refresh click → show "Cannot refresh while offline" toast

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 26: Offline Ticket Access (PWA)
- Implements NFR-REL-01: 30-day retention with freshness indicator
- Works with Story 26.1 (Service Worker) for cache storage
- Works with Story 26.2 (Offline Display) for ticket rendering
- Works with Story 26.4 (Network Restoration) for auto-refresh

**Integration Points:**
- Uses cache metadata from Story 26.1 (Service Worker)
- Displays on ticket page from Story 26.2 (Offline Display)
- Triggers refresh from Story 26.4 (Network Restoration Sync)
- Uses bookingService from Epic 24 for data refresh

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-26-Story-26.3]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-REL-01]
- [Source: project-context.md#UI-Components-Utilities]
- [date-fns Documentation: https://date-fns.org/]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
