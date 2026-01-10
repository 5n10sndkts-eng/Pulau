# Story 26.4: Implement Network Restoration Sync

Status: ready-for-dev

## Story

As a **traveler**,
I want my app to sync automatically when I regain connectivity,
So that I have the latest booking information.

## Acceptance Criteria

1. **Given** I was offline and network is restored
   **When** the app detects connectivity
   **Then** within 10 seconds it:
   - Syncs any pending state changes
   - Refreshes cached ticket data
   - Updates booking status if changed
   - Shows brief "Syncing..." indicator
   **And** if booking was cancelled while offline, I see a clear notification

## Tasks / Subtasks

- [ ] Detect network restoration (AC: 1)
  - [ ] Listen to window `online` event
  - [ ] Trigger sync function when online event fires
  - [ ] Use custom hook: `useNetworkSync()`
  - [ ] Debounce sync to avoid multiple rapid triggers
- [ ] Implement sync logic (AC: 1)
  - [ ] Fetch latest booking data from API
  - [ ] Compare with cached data for changes
  - [ ] Update cache with fresh data
  - [ ] Update last_updated timestamp
  - [ ] Complete within 10 seconds (NFR-REL-02)
- [ ] Show "Syncing..." indicator (AC: 1)
  - [ ] Display toast notification: "Syncing your tickets..."
  - [ ] Show loading spinner in toast
  - [ ] Auto-dismiss after sync completes (< 10 seconds)
  - [ ] Use Sonner toast library
- [ ] Handle booking status changes (AC: 1)
  - [ ] Check if booking status changed while offline
  - [ ] Show notification if booking cancelled
  - [ ] Update UI to reflect new status
  - [ ] Show detailed notification with reason if available

## Dev Notes

### Architecture Patterns

**Network Sync Pattern:**
- Listen to `online` event on window object
- Trigger background sync when connectivity restored
- Use Background Sync API if supported (progressive enhancement)
- Fallback to immediate sync on online event
- NFR-REL-02: Complete sync within 10 seconds

**Sync Strategy:**
1. Detect online event
2. Fetch all active bookings from API
3. Compare with cached bookings
4. Update cache for changed bookings
5. Notify user of critical changes

**Background Sync API (Progressive Enhancement):**
```javascript
// In Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings())
  }
})
```

### Code Quality Requirements

**TypeScript Patterns:**
- Define SyncResult type:
  ```typescript
  type SyncResult = {
    success: boolean
    changedBookings: string[]  // booking IDs
    errors: string[]
  }
  ```
- Use ApiResponse pattern for sync function
- Handle undefined/null booking data

**React Patterns:**
- Create custom hook: `useNetworkSync()`
- Use useEffect to listen to online/offline events
- Clean up event listeners on unmount
- Use TanStack Query mutation for sync operation

**Error Handling:**
- Handle sync failures gracefully (show retry option)
- Log errors for debugging
- Show user-friendly error messages
- Retry failed syncs (max 3 attempts)

### File Structure

**Files to Create:**
- `src/hooks/useNetworkSync.ts` - Custom hook for network sync

**Files to Modify:**
- `src/App.tsx` or `src/main.tsx` - Use useNetworkSync hook globally
- `src/lib/bookingService.ts` - Add syncBookings function
- `public/sw.js` - Add Background Sync event listener (optional)

**Files to Reference:**
- `src/hooks/useOnlineStatus.ts` - Online/offline state detection
- `src/lib/toast.ts` - Toast notification helpers

**Hook Implementation:**
```typescript
function useNetworkSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleOnline = async () => {
      toast.loading('Syncing your tickets...')
      
      const result = await syncBookings()
      
      if (result.success) {
        queryClient.invalidateQueries(['bookings'])
        toast.success('Tickets synced')
      } else {
        toast.error('Sync failed. Will retry.')
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])
}
```

### Testing Requirements

**Manual Testing:**
- Go offline (airplane mode)
- Wait 30 seconds
- Go online
- Verify "Syncing..." toast appears within 1 second
- Verify sync completes within 10 seconds
- Verify cached data updated
- Check console for errors

**Simulating Status Change:**
- Cancel booking from separate device while app offline
- Go online on original device
- Verify notification: "Your booking has been cancelled"
- Verify booking status updated in UI

**Edge Cases:**
- Multiple rapid online/offline toggles (debounce)
- Sync failure (network timeout) → retry logic
- No bookings to sync → silent success
- Large number of bookings (> 50) → pagination

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 26: Offline Ticket Access (PWA)
- Implements NFR-REL-02: 10-second sync window
- Works with Story 26.1 (Service Worker) for cache updates
- Works with Story 26.3 (Last Updated) for timestamp updates

**Integration Points:**
- Uses bookingService from Epic 24 for data fetching
- Updates cache from Story 26.1 (Service Worker)
- Triggers timestamp update from Story 26.3
- Coordinates with Story 26.2 (Offline Display) for UI updates

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-26-Story-26.4]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-REL-02]
- [Source: project-context.md#React-Hooks-Usage]
- [Background Sync API: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
