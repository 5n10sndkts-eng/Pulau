### Story 26.4: Implement Network Restoration Sync

As a **traveler**,
I want my app to sync automatically when I regain connectivity,
So that I have the latest booking information.

**Acceptance Criteria:**

**Given** I was offline and network is restored
**When** the app detects connectivity
**Then** within 10 seconds it:

- Syncs any pending state changes
- Refreshes cached ticket data
- Updates booking status if changed
- Shows brief "Syncing..." indicator
  **And** if booking was cancelled while offline, I see a clear notification

---
