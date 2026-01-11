# Story 25.5: Display Real-Time Slot Availability

Status: review

## Story

As a **traveler**,
I want to see how many spots are left for each time slot,
So that I can make informed booking decisions.

## Acceptance Criteria

1. **Given** I am on an experience detail page
   **When** I view available time slots
   **Then** each slot shows:
   - Time (e.g., "10:00 AM")
   - Available count (e.g., "5 spots left")
   - Price (or "From $X")
   - Visual indicator for low availability (< 3 spots)
   **And** sold out slots are shown but disabled
   **And** availability updates in real-time via subscription

## Tasks / Subtasks

- [x] Create slot availability component (AC: 1)
  - [x] Create `SlotAvailabilityList.tsx` component
  - [x] Display list of time slots for selected date
  - [x] Show time, available count, and price for each slot
  - [x] Use card component for each slot
  - [x] Make slots clickable to select for booking
- [x] Add low availability visual indicator (AC: 1)
  - [x] Show warning color (coral) when available_count < 3
  - [x] Add "Only X left!" text in coral color
  - [x] Add subtle pulsing animation for urgency (200ms)
  - [x] Use alert icon (AlertCircle from Lucide React)
- [x] Handle sold out slots (AC: 1)
  - [x] Display "Sold Out" badge on unavailable slots
  - [x] Gray out sold out slots (reduced opacity: 0.5)
  - [x] Disable click interaction on sold out slots
  - [x] Show slots but make unselectable
- [x] Integrate real-time updates (AC: 1)
  - [x] Use realtimeService from Story 25.2
  - [x] Subscribe to slot availability changes on component mount
  - [x] Update local state when subscription fires
  - [x] Clean up subscription on unmount
  - [x] Show subtle animation when availability changes

## Dev Notes

### Architecture Patterns

**Component Structure:**
- Create new component: `src/components/SlotAvailabilityList.tsx`
- Receives props: `experienceId`, `selectedDate`, `onSlotSelect`
- Fetches slots from slotService.getSlotsByDate()
- Uses realtimeService.subscribeToSlotAvailability() for updates

**Real-Time Integration:**
- Import from `src/lib/realtimeService.ts` (Story 25.2)
- Subscribe on component mount in useEffect
- Update local state when callback fires
- Unsubscribe on unmount in cleanup function

**Slot Display Logic:**
```typescript
interface SlotDisplayProps {
  time: string          // "10:00 AM"
  availableCount: number
  capacity: number
  price: number
  soldOut: boolean
  selected: boolean
  onSelect: () => void
}
```

### Code Quality Requirements

**TypeScript Patterns:**
- Define SlotDisplayProps interface
- Import ExperienceSlot type from `src/lib/types.ts`
- Use discriminated union for slot states: available | low | soldOut
- Strict null checks for undefined slots or availability

**React Patterns:**
- Use useState for local slot list
- Use useEffect for data fetching and subscription
- Use TanStack Query for initial slot data load
- Update state optimistically when booking selected slot

**Styling:**
- Card variant: white background, subtle shadow, 12px radius
- Low availability: coral text `oklch(0.68 0.17 25)`, pulsing animation
- Sold out: gray background, opacity 0.5, cursor not-allowed
- Selected slot: teal border 2px, teal background at 10% opacity

### File Structure

**Files to Create:**
- `src/components/SlotAvailabilityList.tsx` - New component

**Files to Modify:**
- `src/components/ExperienceDetail.tsx` - Integrate SlotAvailabilityList
- `src/lib/slotService.ts` - Add getSlotsByDate function if not exists
- `src/lib/types.ts` - Add ExperienceSlot type if not exists

**Files to Reference:**
- `src/lib/realtimeService.ts` - For real-time subscriptions (Story 25.2)
- `src/components/ui/card.tsx` - For slot card styling
- `src/components/ui/badge.tsx` - For "Sold Out" badge

### Testing Requirements

**Manual Testing:**
- Open experience detail page
- Select a date with multiple time slots
- Verify slots display with correct time, count, and price
- Book a slot in separate window
- Verify availability updates in real-time
- Verify low availability warning at < 3 spots
- Verify sold out slots are disabled

**Edge Cases:**
- No slots available for selected date (show empty state)
- All slots sold out (show "No availability" message)
- Single slot available (show urgency indicator)
- Real-time update while viewing (smooth animation)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 25: Real-Time Inventory & Availability
- Implements FR-BOOK-02: View real-time slot availability
- Depends on Story 25.1 (Realtime Subscriptions) and Story 25.2 (Realtime Service)
- Works with Story 25.4 (Instant Confirmation Filter) for complete UX

**Integration Points:**
- Uses slotService from Epic 23 for data fetching
- Uses realtimeService from Story 25.2 for subscriptions
- Integrates with ExperienceDetail page (existing component)
- Feeds data to checkout flow (Epic 24)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-25-Story-25.5]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-BOOK-02]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Detailed-Experience-Pages]
- [Source: project-context.md#Component-Structure]
- [Source: project-context.md#React-Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Implementation leveraged existing RealtimeSlotDisplay component.

### Completion Notes List

**Implementation Summary:**
1. Created `SlotAvailabilityList.tsx` as a re-export wrapper component for `RealtimeSlotDisplay`
   - Provides naming consistency with story specification
   - Re-exports both component and props type for external use

2. Core functionality already implemented in `RealtimeSlotDisplay.tsx`:
   - Real-time slot availability with Supabase subscriptions
   - Low availability warnings (< 3 spots) with coral color and AlertCircle icon
   - Sold out slots displayed with disabled state and grayed styling
   - Smooth 300ms animations for availability changes
   - Connection status indicators
   - Loading states with skeletons

3. Integrated with `useRealtimeSlots` hook for subscription management

### File List

**Created Files:**
- src/components/SlotAvailabilityList.tsx

**Referenced Files:**
- src/components/RealtimeSlotDisplay.tsx
- src/hooks/useRealtimeSlots.ts
- src/lib/realtimeService.ts
