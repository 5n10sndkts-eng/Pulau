# Story 25.5: Display Real-Time Slot Availability

Status: done

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

- [ ] Create slot availability component (AC: 1)
  - [ ] Create `SlotAvailabilityList.tsx` component
  - [ ] Display list of time slots for selected date
  - [ ] Show time, available count, and price for each slot
  - [ ] Use card component for each slot
  - [ ] Make slots clickable to select for booking
- [ ] Add low availability visual indicator (AC: 1)
  - [ ] Show warning color (coral) when available_count < 3
  - [ ] Add "Only X left!" text in coral color
  - [ ] Add subtle pulsing animation for urgency (200ms)
  - [ ] Use alert icon (AlertCircle from Lucide React)
- [ ] Handle sold out slots (AC: 1)
  - [ ] Display "Sold Out" badge on unavailable slots
  - [ ] Gray out sold out slots (reduced opacity: 0.5)
  - [ ] Disable click interaction on sold out slots
  - [ ] Show slots but make unselectable
- [ ] Integrate real-time updates (AC: 1)
  - [ ] Use realtimeService from Story 25.2
  - [ ] Subscribe to slot availability changes on component mount
  - [ ] Update local state when subscription fires
  - [ ] Clean up subscription on unmount
  - [ ] Show subtle animation when availability changes

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

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
