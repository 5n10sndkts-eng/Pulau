# Story 26.1: Implement Service Worker for Ticket Caching

Status: ready-for-dev

## Story

As a **traveler**,
I want my tickets cached for offline access,
So that I can show my ticket even without internet.

## Acceptance Criteria

1. **Given** I have a confirmed booking
   **When** I view my ticket page while online
   **Then** the Service Worker caches:
   - Ticket page HTML/JS/CSS
   - QR code image
   - Booking metadata (experience name, time, meeting point)
   **And** cached data persists for 30 days
   **And** cache is updated when I view the ticket online

## Tasks / Subtasks

- [ ] Create Service Worker file (AC: 1)
  - [ ] Create `public/sw.js` service worker file
  - [ ] Register service worker in main.tsx or index.html
  - [ ] Implement install event handler
  - [ ] Implement activate event handler for cache cleanup
- [ ] Implement ticket caching strategy (AC: 1)
  - [ ] Use Cache API to store ticket resources
  - [ ] Cache ticket HTML, CSS, and JavaScript on fetch
  - [ ] Cache QR code images (generated or static)
  - [ ] Cache booking metadata as JSON in IndexedDB
  - [ ] Use "Network First, Cache Fallback" strategy
- [ ] Set cache expiration to 30 days (AC: 1)
  - [ ] Add timestamp to cached entries
  - [ ] Check timestamp on cache retrieval
  - [ ] Expire entries older than 30 days
  - [ ] Re-fetch and update cache when online
- [ ] Implement cache update on online view (AC: 1)
  - [ ] Detect when ticket page viewed while online
  - [ ] Fetch latest booking data from API
  - [ ] Update cache with fresh data
  - [ ] Update timestamp for cache expiration

## Dev Notes

### Architecture Patterns

**Service Worker Pattern:**
- Service Worker lifecycle: Install → Activate → Fetch
- Cache-First strategy for static assets (JS/CSS)
- Network-First strategy for ticket data (fresher data when online)
- IndexedDB for structured data (booking metadata)

**PWA Requirements:**
- Service Worker registered via navigator.serviceWorker.register()
- Must be served over HTTPS (or localhost for development)
- Manifest.json for PWA installation (Story 26.5)
- NFR-REL-01: 30-day offline access requirement

**Caching Strategy:**
```javascript
// Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        cache.put(event.request, response.clone())
        return response
      })
      .catch(() => cache.match(event.request))
  )
})
```

### Code Quality Requirements

**JavaScript/TypeScript:**
- Service Worker in vanilla JavaScript (no TypeScript support)
- Use modern async/await syntax
- Handle promise rejections gracefully
- Log cache hits/misses for debugging

**Cache Management:**
- Cache name versioning: `pulau-tickets-v1`
- Increment version on Service Worker updates
- Delete old cache versions in activate event
- Limit cache size to prevent storage quota issues

**Error Handling:**
- Handle fetch failures (network offline)
- Handle cache.match() failures (cache miss)
- Show user-friendly error when both fail
- Log errors to console for debugging

### File Structure

**Files to Create:**
- `public/sw.js` - Service Worker implementation

**Files to Modify:**
- `src/main.tsx` - Register service worker
- `public/manifest.json` - PWA manifest (if not exists, create in Story 26.5)

**Files to Reference:**
- `src/components/booking/TicketPage.tsx` - Ticket page to cache
- `src/lib/bookingService.ts` - Fetch booking data for cache

### Testing Requirements

**Manual Testing:**
- View ticket page while online
- Open Chrome DevTools → Application → Service Workers
- Verify service worker registered and activated
- Open Application → Cache Storage
- Verify ticket resources cached
- Go offline (DevTools Network → Offline)
- Reload ticket page
- Verify page loads from cache

**Edge Cases:**
- First visit without cache (should fetch from network)
- Cache full (should evict old entries)
- Service Worker update (should clear old cache)
- Browser without Service Worker support (graceful degradation)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 26: Offline Ticket Access (PWA)
- Implements NFR-REL-01: 30-day offline access
- Implements NFR-REL-02: Network restoration sync (with Story 26.4)
- Works with Epic 24 (checkout) to generate cacheable tickets

**Integration Points:**
- Works with Story 26.2 (Offline Ticket Display) for offline rendering
- Works with Story 26.3 (Last Updated Timestamp) for cache freshness
- Works with Story 26.4 (Network Restoration Sync) for sync logic
- Depends on Epic 24 (booking confirmation) for ticket generation

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-26-Story-26.1]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-REL-01]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Offline-Trust-Web-PWA]
- [MDN Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API]
- [Google PWA Guide: https://web.dev/service-workers-cache-storage/]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
