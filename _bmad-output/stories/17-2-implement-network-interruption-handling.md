# Story 17.2: Implement Network Interruption Handling

Status: ready-for-dev

## Story

As a user with poor connectivity,
I want the app to handle offline gracefully,
So that I don't lose my data.

## Acceptance Criteria

### AC1: Offline Data Display
**Given** the device loses network connection
**When** a network request fails
**Then** cached data (from Spark useKV) continues to display
**And** "Last updated [timestamp]" indicator shows data freshness
**And** "Retry" button appears on failed sections

### AC2: User Feedback
**And** toast displays "You're offline. Some features unavailable."
**When** I tap "Retry"
**Then** request attempts again
**And** success replaces error state

### AC3: Auto-Recovery
**When** network returns
**Then** data syncs automatically in background
**And** "Back online" toast displays

## Tasks / Subtasks

### Task 1: Implement Network Status Detection (AC: #1, #3)
- [ ] Create useOnlineStatus hook using navigator.onLine
- [ ] Listen to online/offline events globally
- [ ] Store network status in global state (Spark or context)
- [ ] Update UI based on online/offline state
- [ ] Test with browser DevTools network throttling

### Task 2: Display Cached Data During Offline (AC: #1)
- [ ] Configure Spark useKV to serve stale cache when offline
- [ ] Display cached data with visual indicator (grayed out or banner)
- [ ] Show "Last updated [X minutes ago]" timestamp
- [ ] Disable actions requiring network (Add to Trip, Book, etc.)
- [ ] Prevent infinite loading states when offline

### Task 3: Add Retry Mechanism (AC: #1, #2)
- [ ] Display "Retry" button on failed network requests
- [ ] Implement exponential backoff for retry attempts
- [ ] Show loading state during retry
- [ ] Replace error state with success when retry succeeds
- [ ] Limit retry attempts to prevent infinite loops (max 3)

### Task 4: Show Offline Toast Notifications (AC: #2, #3)
- [ ] Display "You're offline" toast when connection lost
- [ ] Show dismissible banner: "Some features unavailable offline"
- [ ] Display "Back online" toast when connection restored
- [ ] Auto-dismiss online toast after 3 seconds
- [ ] Use warning variant for offline, success for online

### Task 5: Implement Background Sync on Reconnect (AC: #3)
- [ ] Detect when connection restored (online event)
- [ ] Automatically refetch critical data (trip, wishlist, bookings)
- [ ] Invalidate stale cache entries
- [ ] Queue failed mutations to retry on reconnect
- [ ] Show sync progress indicator if needed

## Dev Notes

### Network Status Hook
File: `src/hooks/useOnlineStatus.ts`
```typescript
import { useEffect, useState } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

### Cached Data Display
```tsx
const ExperienceList = () => {
  const isOnline = useOnlineStatus();
  const { data, lastUpdated, error, retry } = useCachedExperiences();

  if (error && !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-700 mb-4">Failed to load experiences</p>
        <button onClick={retry} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      {!isOnline && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-4">
          <p className="text-sm text-warning-800">
            You're offline. Showing cached data from {formatRelativeTime(lastUpdated)}
          </p>
        </div>
      )}
      {/* Render experiences */}
    </div>
  );
};
```

### Retry Logic with Exponential Backoff
```typescript
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.min(1000 * 2 ** attempt, 10000); // Cap at 10s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### Offline Toast Component
```tsx
const OfflineToast = () => {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setShowOnline(false);
    } else {
      setShowOffline(false);
      setShowOnline(true);
      setTimeout(() => setShowOnline(false), 3000);
    }
  }, [isOnline]);

  return (
    <>
      {showOffline && (
        <Toast variant="warning" onDismiss={() => setShowOffline(false)}>
          You're offline. Some features unavailable.
        </Toast>
      )}
      {showOnline && (
        <Toast variant="success">
          Back online!
        </Toast>
      )}
    </>
  );
};
```

### Background Sync on Reconnect
```typescript
useEffect(() => {
  if (isOnline) {
    // Refetch critical data
    refetchTrip();
    refetchWishlist();
    refetchBookings();

    // Retry queued mutations
    retryQueuedMutations();
  }
}, [isOnline]);
```

### Spark useKV Configuration for Offline
```typescript
const { data, error } = useKV('experiences', async () => {
  const response = await fetch('/api/experiences');
  return response.json();
}, {
  cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  staleWhileRevalidate: true, // Serve stale cache when offline
  refetchOnReconnect: true,   // Auto-refetch when online
});
```

### Last Updated Timestamp
```typescript
const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};
```

### Testing Offline Mode
- **Chrome DevTools**: Network tab → Throttling → Offline
- **Firefox**: Network conditions → Offline
- **Safari**: Develop menu → Disable network
- Test transitions: online → offline → online

### Accessibility
- Offline banner has `role="alert"` for screen reader announcement
- Retry button has clear label: "Retry loading experiences"
- Focus management: Keep focus on retry button after failed attempt
- ARIA live regions announce connectivity changes

## References

- [Source: epics.md#Epic 17, Story 17.2]
- [MDN: Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Spark: useKV Caching](https://spark.apache.org/)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
