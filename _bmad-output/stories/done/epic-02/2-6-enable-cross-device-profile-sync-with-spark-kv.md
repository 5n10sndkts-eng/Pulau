# Story 2.6: Enable Cross-Device Profile Sync with Spark KV

Status: done

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

- [x] Task 1: Implement local persistence (AC: #1)
  - [x] Use Spark useKV for all profile/preference data
  - [x] Store user profile, preferences, saved cards references
  - [x] Update localStorage on any profile change
  - [x] Create useProfile hook for easy access
- [x] Task 2: Create sync state tracking (AC: #5)
  - [x] Add last_synced_at timestamp to user data
  - [x] Track dirty/clean state for sync status
  - [x] Display "Last updated" in settings screen
  - [x] Create SyncStatus component (optional)
- [x] Task 3: Implement sync on login (AC: #3)
  - [x] On login, check for existing local data
  - [x] If backend data exists, load and merge
  - [x] Prefer backend data for initial load (authoritative source)
  - [x] Clear previous user's local data on new login
- [x] Task 4: Implement change synchronization (AC: #2, #4)
  - [x] Create sync queue for pending changes
  - [x] Batch changes for efficient sync
  - [x] Update last_synced_at on successful sync
  - [x] Mock backend API calls (log to console)
- [x] Task 5: Implement conflict resolution (AC: #6)
  - [x] Compare timestamps for concurrent edits
  - [x] Apply "last write wins" strategy
  - [x] Log conflict resolution for debugging
  - [x] Consider showing merge notification (optional)
- [x] Task 6: Handle offline sync (AC: #7)
  - [x] Detect network status (navigator.onLine)
  - [x] Queue changes when offline
  - [x] Sync queued changes when online
  - [x] Show "Offline" indicator in app
  - [x] Show "Syncing..." indicator when reconnecting

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

