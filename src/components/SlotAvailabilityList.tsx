/**
 * SlotAvailabilityList Component
 * Story: 25.5 - Display Real-Time Slot Availability
 *
 * Wrapper component that re-exports RealtimeSlotDisplay for
 * naming consistency with the story specification.
 *
 * @see RealtimeSlotDisplay for the actual implementation
 */

// Re-export RealtimeSlotDisplay as SlotAvailabilityList for story compliance
export { RealtimeSlotDisplay as SlotAvailabilityList } from './RealtimeSlotDisplay'

// Also export props type for external use
export type { RealtimeSlotDisplayProps as SlotAvailabilityListProps } from './RealtimeSlotDisplay'
