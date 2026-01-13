import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSlot,
  createBulkSlots,
  getAvailableSlots,
  getSlotById,
  updateSlot,
  blockSlot,
  unblockSlot,
  decrementAvailability,
  decrementAvailabilityWithLock,
  incrementAvailability,
} from './slotService';
import { supabase } from './supabase';

// Mocking helper for Supabase chaining
const createMockSupabase = () => {
  const mockChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    // Make it thenable for await
    then: (resolve: any) => resolve({ data: null, error: null }),
    catch: vi.fn().mockReturnThis(),
  };
  return mockChain;
};

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => createMockSupabase()),
    tabe: vi.fn(() => createMockSupabase()),
    rpc: vi.fn(),
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

describe('slotService', () => {
  const mockExperienceId = 'exp-123';
  const mockSlotId = 'slot-456';
  const mockSlot = {
    id: mockSlotId,
    experience_id: mockExperienceId,
    slot_date: '2026-06-01',
    slot_time: '10:00',
    total_capacity: 10,
    available_count: 10,
    price_override_amount: null,
    is_blocked: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================================
  // SLOT CREATION TESTS
  // ================================================
  describe('createSlot', () => {
    it('successfully creates a slot', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: mockSlot, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await createSlot({
        experienceId: mockExperienceId,
        slotDate: '2026-06-01',
        slotTime: '10:00',
        totalCapacity: 10,
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSlot);
      expect(supabase.from).toHaveBeenCalledWith('experience_slots');
    });

    it('handles duplicate slot error (code 23505)', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({
          data: null,
          error: { code: '23505', message: 'Duplicate key' },
        });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await createSlot({
        experienceId: mockExperienceId,
        slotDate: '2026-06-01',
        slotTime: '10:00',
        totalCapacity: 10,
      });

      expect(result.error).toBeTruthy();
      expect(result.error).toContain('already exists');
    });
  });

  describe('createBulkSlots', () => {
    it('successfully creates multiple slots', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: [mockSlot], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await createBulkSlots([
        {
          experienceId: mockExperienceId,
          slotDate: '2026-06-01',
          slotTime: '10:00',
          totalCapacity: 10,
        },
      ]);

      expect(result.success).toBe(true);
      expect(result.created).toBe(1);
    });
  });

  // ================================================
  // SLOT QUERY TESTS
  // ================================================
  describe('getAvailableSlots', () => {
    it('returns filtered list of available slots', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: [mockSlot], error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await getAvailableSlots(mockExperienceId, {
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]?.id).toBe(mockSlotId);
    });
  });

  describe('getSlotById', () => {
    it('returns a slot by its ID', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: mockSlot, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await getSlotById(mockSlotId);
      expect(result.data?.id).toBe(mockSlotId);
    });
  });

  // ================================================
  // SLOT UPDATE & BLOCKING TESTS
  // ================================================
  describe('updateSlot', () => {
    it('successfully updates a slot and logs audit', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: { ...mockSlot, total_capacity: 15 }, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await updateSlot(mockSlotId, { totalCapacity: 15 });

      expect(result.error).toBeNull();
      expect(result.data?.total_capacity).toBe(15);
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('blockSlot', () => {
    it('blocks a slot and creates audit log', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: { ...mockSlot, is_blocked: true }, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await blockSlot(mockSlotId, 'Maintenance');

      expect(result.error).toBeNull();
      expect(result.data?.is_blocked).toBe(true);
      expect(vi.mocked(supabase.from)).toHaveBeenCalledWith('audit_logs');
    });
  });

  // ================================================
  // AVAILABILITY OPERATION TESTS
  // ================================================
  describe('decrementAvailability', () => {
    it('decrements availability using optimistic locking', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { success: true, available_count: 9, error: null },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: { ...mockSlot, available_count: 9 }, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await decrementAvailability(mockSlotId, 1);

      expect(result.error).toBeNull();
      expect(result.data?.available_count).toBe(9);
    });

    it('returns error when slot is sold out', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          success: false,
          error: 'Slot no longer available',
          available_count: null,
        },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const result = await decrementAvailability(mockSlotId, 1);

      expect(result.data).toBeNull();
      expect(result.error).toContain('no longer available');
    });
  });

  describe('decrementAvailabilityWithLock', () => {
    it('uses RPC for atomic locking', async () => {
      // First call for RPC
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: { success: true, available_count: 5, error: null },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      // Secondary calls for fetching updated slot and audit log
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: mockSlot, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await decrementAvailabilityWithLock(mockSlotId, 1);

      expect(result.error).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith(
        'decrement_slot_inventory',
        expect.anything(),
      );
    });
  });

  describe('incrementAvailability', () => {
    it('increments availability', async () => {
      const mockChain = createMockSupabase();
      mockChain.then = (resolve: any) =>
        resolve({ data: { ...mockSlot, available_count: 11 }, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as any);

      const result = await incrementAvailability(mockSlotId, 1);

      expect(result.error).toBeNull();
      expect(result.data?.available_count).toBe(11);
    });
  });
});
