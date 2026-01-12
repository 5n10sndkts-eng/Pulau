import { describe, it, expect, vi, beforeEach } from 'vitest'
import { decrementAvailability, decrementAvailabilityWithLock, incrementAvailability, deleteSlot } from '@/lib/slotService'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => {
  const rpc = vi.fn()
  const from = vi.fn()
  return {
    supabase: {
      rpc,
      from,
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    },
  }
})

const getSupabaseMock = () => supabase as unknown as {
  rpc: ReturnType<typeof vi.fn>
  from: ReturnType<typeof vi.fn>
}

const auditLogFallback = () => ({
  insert: () => Promise.resolve({ error: null }),
})

describe('slotService', () => {
  beforeEach(() => {
    const { rpc, from } = getSupabaseMock()
    rpc.mockReset()
    from.mockReset()
  })

  it('rejects non-positive decrements', async () => {
    const res = await decrementAvailability('slot-1', 0)
    expect(res.error).toBeTruthy()
    expect(res.error).toMatch(/positive/i)
  })

  it('decrements availability via RPC and logs audit', async () => {
    const { rpc, from } = getSupabaseMock()

    rpc.mockResolvedValue({
      data: { success: true, error: null, available_count: 2 },
      error: null,
    })

    from
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'slot-1',
                experience_id: 'exp-1',
                available_count: 2,
              } as any,
              error: null,
            }),
          }),
        }),
      }))
      .mockImplementation(auditLogFallback)

    const result = await decrementAvailabilityWithLock('slot-1', 1)

    expect(rpc).toHaveBeenCalledWith('decrement_slot_inventory', {
      p_slot_id: 'slot-1',
      p_count: 1,
    })
    expect(result.error).toBeNull()
    expect(result.data?.available_count).toBe(2)
  })

  it('propagates RPC errors when decrementing', async () => {
    const { rpc } = getSupabaseMock()

    rpc.mockResolvedValue({ data: { success: false, error: 'boom' }, error: null })
    const result = await decrementAvailabilityWithLock('slot-1', 1)
    expect(result.data).toBeNull()
    expect(result.error).toMatch(/boom/i)
  })

  it('caps increment at total capacity', async () => {
    const { from } = getSupabaseMock()

    from
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'slot-1',
                experience_id: 'exp-1',
                available_count: 9,
                total_capacity: 10,
              } as any,
              error: null,
            }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'slot-1',
                  experience_id: 'exp-1',
                  available_count: 10,
                  total_capacity: 10,
                } as any,
                error: null,
              }),
            }),
          }),
        }),
      }))
      .mockImplementation(auditLogFallback)

    const result = await incrementAvailability('slot-1', 5)

    expect(result.error).toBeNull()
    expect(result.data?.available_count).toBe(10)
  })

  it('prevents deleting slots that have bookings', async () => {
    const { from } = getSupabaseMock()

    from
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'slot-1',
                experience_id: 'exp-1',
                available_count: 5,
                total_capacity: 10,
                slot_date: '2026-01-01',
                slot_time: '10:00',
              } as any,
              error: null,
            }),
          }),
        }),
      }))
      .mockImplementation(auditLogFallback)

    const result = await deleteSlot('slot-1')

    expect(result.data).toBeNull()
    expect(result.error).toMatch(/Cannot delete slot with existing bookings/i)
  })

  it('deletes slots with no bookings and logs audit', async () => {
    const { from } = getSupabaseMock()

    from
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'slot-1',
                experience_id: 'exp-1',
                available_count: 10,
                total_capacity: 10,
                slot_date: '2026-01-01',
                slot_time: '10:00',
              } as any,
              error: null,
            }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }))
      .mockImplementation(auditLogFallback)

    const result = await deleteSlot('slot-1')

    expect(result.error).toBeNull()
    expect(result.data?.deleted).toBe(true)
  })
})
