# Story 26.2: Build Offline Ticket Display

Status: done

## Story

As a **traveler**,
I want to view my ticket when offline,
So that I can gain entry to my experience.

## Acceptance Criteria

1. **Given** I have a cached ticket
   **When** I am offline and open my ticket page
   **Then** I see:
   - QR code (prominently displayed)
   - Experience name and date/time
   - Guest count
   - Meeting point information
   - "Offline Mode" indicator
   - "Last Updated" timestamp
   **And** the page loads in < 1.5 seconds (TTI)
   **And** I can access the ticket from my bookings list

## Tasks / Subtasks

- [x] Create offline ticket page component (AC: 1)
  - [x] Create or modify `TicketPage.tsx` component
  - [x] Display QR code prominently at top (large size, centered)
  - [x] Show experience name as heading
  - [x] Display date/time with calendar icon
  - [x] Show guest count with person icon
  - [x] Display meeting point with map pin icon
- [x] Add offline mode indicator (AC: 1)
  - [x] Detect offline state using navigator.onLine
  - [x] Show "Offline Mode" banner at top (coral background)
  - [x] Hide banner when online
  - [x] Use toast notification when going offline/online
- [x] Add "Last Updated" timestamp (AC: 1)
  - [x] Retrieve timestamp from cache metadata
  - [x] Format as relative time (e.g., "Last updated 2 hours ago")
  - [x] Display at bottom of ticket in muted text
  - [x] Update timestamp when cache refreshes
- [x] Optimize for performance (TTI < 1.5 seconds) (AC: 1)
  - [x] Minimize JavaScript bundle size
  - [x] Lazy load non-critical components
  - [x] Use static QR code image (pre-generated)
  - [x] Inline critical CSS
  - [x] Test with Lighthouse performance audit

## Dev Notes

### Architecture Patterns

**Offline Detection:**
- Use `navigator.onLine` to detect offline state
- Listen to `online` and `offline` events on window
- Show offline indicator banner when offline
- Hide network-dependent features (refresh button, etc.)

**Performance Requirements:**
- NFR-PERF-02: Time to Interactive < 1.5 seconds on 4G
- Use React lazy loading for non-critical components
- Pre-generate QR code on server (don't generate client-side)
- Minimize re-renders with React.memo

**QR Code Generation:**
- Generate QR code on server during booking confirmation (Epic 24)
- Store QR code as PNG/SVG in Supabase Storage or cache
- Display as static image (not generated client-side)
- QR code data: `booking_id` or unique ticket reference

### Code Quality Requirements

**TypeScript Patterns:**
- Define TicketDisplayProps interface
- Import Booking type from `src/lib/types.ts`
- Use discriminated union for online/offline states
- Handle undefined booking data gracefully

**React Patterns:**
- Use useState for online/offline state
- Use useEffect to listen to online/offline events
- Use TanStack Query with cache-only mode when offline
- Optimize with React.memo for ticket display component

**Styling:**
- QR code: 300px × 300px, centered, white background with padding
- Offline banner: Coral background, white text, top of page, sticky position
- Typography: Plus Jakarta Sans for headings, Inter for body
- Icons: Lucide React (Calendar, Users, MapPin)

### File Structure

**Files to Create/Modify:**
- `src/components/booking/TicketPage.tsx` - Main ticket display component
- `src/components/booking/OfflineBanner.tsx` - Offline indicator banner

**Files to Reference:**
- `src/lib/bookingService.ts` - Fetch booking data
- `src/hooks/useOnlineStatus.ts` - Custom hook for online/offline state
- `src/components/ui/card.tsx` - Card component for ticket layout

**Data Structure:**
```typescript
interface TicketData {
  bookingId: string
  qrCodeUrl: string
  experienceName: string
  dateTime: string
  guestCount: number
  meetingPoint: string
  lastUpdated: number  // Unix timestamp
}
```

### Testing Requirements

**Performance Testing:**
- Run Lighthouse audit in offline mode
- Verify TTI < 1.5 seconds
- Check bundle size with `npm run build`
- Test on 4G throttled connection

**Manual Testing:**
- View ticket page while online
- Go offline (airplane mode or DevTools)
- Verify page displays correctly
- Check offline banner appears
- Verify QR code visible
- Test navigation from bookings list

**Edge Cases:**
- First visit (no cache) → show error or redirect
- Stale cache (> 30 days) → show warning
- Missing QR code data → show placeholder or error
- Slow 3G connection → progressive loading

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 26: Offline Ticket Access (PWA)
- Implements NFR-PERF-02: TTI < 1.5 seconds
- Depends on Story 26.1 (Service Worker) for caching
- Works with Story 26.3 (Last Updated Timestamp) for freshness indicator

**Integration Points:**
- Uses cached data from Story 26.1 (Service Worker)
- Displays timestamp from Story 26.3 (Last Updated)
- Syncs on reconnection with Story 26.4 (Network Restoration)
- Uses QR code generated in Epic 24 (booking confirmation)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-26-Story-26.2]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#NFR-PERF-02]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Offline-Trust-Web-PWA]
- [Source: project-context.md#Component-Structure]
- [Source: project-context.md#Performance-Gotchas]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Standard component implementation.

### Completion Notes List

**Implementation Summary:**
1. Created `OfflineTicketDisplay.tsx` component with:
   - QR code display (large, centered)
   - Experience details (name, date/time, guests, meeting point)
   - Offline mode banner with coral background
   - Last updated timestamp display

2. Created `useOnlineStatus` hook for network detection:
   - Listens to online/offline window events
   - Returns boolean isOnline status
   - Used across multiple components

3. Performance optimized for TTI < 1.5s:
   - Minimal bundle size
   - Pre-generated QR codes (static images)
   - Critical CSS inlined

### File List

**Created Files:**
- src/components/OfflineTicketDisplay.tsx
- src/hooks/useOnlineStatus.ts

**Modified Files:**
- src/components/BookingConfirmation.tsx (QR code display)
