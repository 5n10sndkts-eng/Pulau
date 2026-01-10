# Story 25.1: Implement Supabase Realtime Subscriptions

Status: ready-for-dev

## Story

As a **traveler**,
I want to see availability update in real-time,
So that I know the current booking status without refreshing.

## Acceptance Criteria

1. **Given** I am viewing an experience detail page
   **When** another user books a slot I'm viewing
   **Then** the availability count updates within 500ms
   **And** if a slot becomes sold out, the UI updates immediately
   **And** I see a subtle animation indicating the change
   **And** subscription is automatically cleaned up when I leave the page

## Tasks / Subtasks

- [ ] Implement Supabase Realtime channel subscription for experience slots (AC: 1)
  - [ ] Create subscription in experience detail component using `supabase.channel()`
  - [ ] Subscribe to `experience_slots` table changes for specific experience_id
  - [ ] Set up callback to update local state when PostgreSQL changes broadcast
- [ ] Update UI with real-time availability changes (AC: 1)
  - [ ] Update available count when slot capacity changes
  - [ ] Implement subtle fade-in animation (200ms) for count updates
  - [ ] Disable "Book Now" button when slot becomes sold out
  - [ ] Show "Sold Out" badge with coral accent color when capacity reaches 0
- [ ] Ensure subscription cleanup on component unmount (AC: 1)
  - [ ] Use React `useEffect` cleanup function to unsubscribe
  - [ ] Remove channel listener when navigating away
  - [ ] Test for memory leaks with React DevTools Profiler
- [ ] Verify 500ms performance requirement (AC: 1)
  - [ ] Test with multiple concurrent users simulating bookings
  - [ ] Measure latency from database update to UI render
  - [ ] Ensure Supabase Realtime is enabled in project settings

## Dev Notes

### Architecture Patterns

**Supabase Realtime Integration:**
- Uses Supabase Realtime channels for PostgreSQL change data capture (CDC)
- Subscription pattern: `supabase.channel('experience-slots-{experienceId}').on('postgres_changes', ...)`
- Must handle reconnection logic automatically (Supabase client does this)
- TypeScript types for payload: `RealtimePostgresChangesPayload<ExperienceSlot>`

**Component Structure:**
- Implement in experience detail page component (likely `src/components/ExperienceDetail.tsx`)
- Use `useEffect` hook for subscription lifecycle management
- Store slot availability in local component state (updated by realtime callback)
- Follow existing pattern from project: named exports, strict TypeScript, no default exports except App.tsx

**Performance Requirements:**
- NFR-PERF-01: 500ms propagation time (99th percentile)
- Use Supabase Dashboard metrics to verify latency
- Consider using `react-query` for optimistic updates if needed

### Code Quality Requirements

**TypeScript Patterns:**
- Strict null checks enabled - handle subscription failures gracefully
- Use discriminated unions for connection states (connected | disconnected | error)
- Import types from `@/lib/types` (ExperienceSlot, Booking, etc.)
- No `any` types - use proper Supabase Realtime payload types

**React Patterns:**
- Use `useState` for local slot availability state
- Use `useEffect` with dependency array containing experienceId
- Clean up subscription in return function of useEffect
- Follow hooks rules (no conditional calls)

**Animation:**
- Use Framer Motion for subtle fade-in: `<motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>`
- Wrap count display in motion component
- Respect `prefers-reduced-motion` media query

### File Structure

**Files to Create/Modify:**
- `src/components/ExperienceDetail.tsx` - Add realtime subscription logic
- `src/lib/types.ts` - Add ExperienceSlot type if not exists
- May need to import from `@supabase/supabase-js` for Realtime types

**Database Schema Reference:**
- Table: `experience_slots` (from Epic 21, Story 21.1)
- Columns: `id`, `experience_id`, `slot_time`, `capacity`, `available_count`, `created_at`, `updated_at`
- Subscribe to changes on `available_count` for specific `experience_id`

### Testing Requirements

**Manual Testing:**
- Open experience page in two browser windows
- Book slot in Window A
- Verify Window B updates within 500ms
- Check subscription cleanup by navigating away and monitoring browser console

**Edge Cases:**
- Handle subscription failure (network error) gracefully
- Show stale data indicator if disconnected
- Verify no memory leaks on rapid navigation

### Project Structure Notes

**Alignment with Architecture:**
- Follows Phase 2a architecture for real-time inventory management
- Part of Epic 25: Real-Time Inventory & Availability
- Depends on Epic 21 (Database Schema Extensions) being complete
- Uses existing Supabase client from `src/lib/supabaseClient.ts` (or similar)

**Integration Points:**
- Works with Story 25.2 (Real-Time Service Module) for centralized subscription management
- Feeds data to Story 25.5 (Display Real-Time Slot Availability) for UI rendering
- Coordinates with Story 25.3 (Atomic Inventory Decrement) for consistency

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-25-Story-25.1]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Real-Time-Features]
- [Source: _bmad-output/planning-artifacts/architecture/architecture.md#Real-Time-Patterns]
- [Source: project-context.md#Backend-Integration-Rules]
- [Supabase Realtime Documentation: https://supabase.com/docs/guides/realtime]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
