### Story 17.2: Implement Network Interruption Handling

As a user with poor connectivity,
I want the app to handle offline gracefully,
So that I don't lose my data.

**Acceptance Criteria:**

**Given** the device loses network connection
**When** a network request fails
**Then** cached data (from Spark useKV) continues to display
**And** "Last updated [timestamp]" indicator shows data freshness
**And** "Retry" button appears on failed sections
**And** toast displays "You're offline. Some features unavailable."
**When** I tap "Retry"
**Then** request attempts again
**And** success replaces error state
**When** network returns
**Then** data syncs automatically in background
**And** "Back online" toast displays
