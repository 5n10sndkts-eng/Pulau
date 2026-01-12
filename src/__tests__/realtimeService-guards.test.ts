import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      channel: vi.fn(),
      removeChannel: vi.fn(),
    },
    isSupabaseConfigured: vi.fn(() => false),
  }
})

import { subscribeToSlotAvailability, subscribeToBookingStatus, unsubscribeAll } from '@/lib/realtimeService'

const uuid = '00000000-0000-4000-8000-000000000000'

describe('realtimeService guards', () => {
  it('returns noop id when supabase not configured (slot)', () => {
    const subId = subscribeToSlotAvailability(uuid, () => {})
    expect(subId).toBe('realtime-disabled')
  })

  it('returns noop id when supabase not configured (booking)', () => {
    const subId = subscribeToBookingStatus(uuid, () => {})
    expect(subId).toBe('realtime-disabled')
  })

  it('unsubscribeAll is safe with no active subs', async () => {
    await expect(unsubscribeAll()).resolves.not.toThrow()
  })
})
