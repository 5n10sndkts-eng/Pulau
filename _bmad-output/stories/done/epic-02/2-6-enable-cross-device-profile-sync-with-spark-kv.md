# Story 2.6: Enable Cross-Device Profile Sync with Spark KV

Status: ready-for-dev

## Story

As a traveler using multiple devices,
I want my profile and preferences synced automatically,
so that I have a consistent experience across devices.

## Acceptance Criteria

1. **Given** I am logged in on Device A **When** I update my profile or preferences **Then** changes are persisted to Spark useKV localStorage
2. Changes are also synced to backend user_profiles KV namespace
3. **When** I login on Device B with the same account **Then** my profile data is loaded from backend on initial login
4. Subsequent changes on Device B sync via useKV and backend
5. last_synced_at timestamp tracks sync state
6. Conflicts are resolved using "last write wins" strategy
7. Sync works offline (queues updates until network returns)

## Tasks / Subtasks

- [ ] Task 1: Implement local persistence (AC: #1)
  - [ ] Use Spark useKV for all profile/preference data
  - [ ] Store user profile, preferences, saved cards references
  - [ ] Update localStorage on any profile change
  - [ ] Create useProfile hook for easy access
- [ ] Task 2: Create sync state tracking (AC: #5)
  - [ ] Add last_synced_at timestamp to user data
  - [ ] Track dirty/clean state for sync status
  - [ ] Display "Last updated" in settings screen
  - [ ] Create SyncStatus component (optional)
- [ ] Task 3: Implement sync on login (AC: #3)
  - [ ] On login, check for existing local data
  - [ ] If backend data exists, load and merge
  - [ ] Prefer backend data for initial load (authoritative source)
  - [ ] Clear previous user's local data on new login
- [ ] Task 4: Implement change synchronization (AC: #2, #4)
  - [ ] Create sync queue for pending changes
  - [ ] Batch changes for efficient sync
  - [ ] Update last_synced_at on successful sync
  - [ ] Mock backend API calls (log to console)
- [ ] Task 5: Implement conflict resolution (AC: #6)
  - [ ] Compare timestamps for concurrent edits
  - [ ] Apply "last write wins" strategy
  - [ ] Log conflict resolution for debugging
  - [ ] Consider showing merge notification (optional)
- [ ] Task 6: Handle offline sync (AC: #7)
  - [ ] Detect network status (navigator.onLine)
  - [ ] Queue changes when offline
  - [ ] Sync queued changes when online
  - [ ] Show "Offline" indicator in app
  - [ ] Show "Syncing..." indicator when reconnecting

## Dev Notes

- Spark useKV provides localStorage persistence automatically
- Backend sync is mocked for MVP (simulated with timeouts)
- Consider localStorage size limits (~5MB per origin)
- Sync queue should handle multiple rapid changes efficiently

### References

- [Source: vendor-customer-auth-requirements.md]
- [Source: architecture/architecture.md#State Management]
- [Source: project-context.md#Spark KV Patterns]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

