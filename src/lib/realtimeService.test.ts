/**
 * Tests for Realtime Service Module
 * Story: 25.1 - Implement Supabase Realtime Subscriptions
 * Story: 25.2 - Create Real-Time Service Module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  subscribeToSlotAvailability,
  subscribeToBookingStatus,
  unsubscribe,
  unsubscribeAll,
  getActiveSubscriptionCount,
  getActiveSubscriptionIds,
} from './realtimeService';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi
      .fn()
      .mockResolvedValue('ok' as 'ok' | 'error' | 'timed out'),
  },
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
}));

describe('realtimeService', () => {
  let mockChannel: any;
  let mockOn: any;
  let mockSubscribe: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock channel that supports chaining
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };

    // Expose mocks for assertions
    mockOn = mockChannel.on;
    mockSubscribe = mockChannel.subscribe;

    // Setup supabase.channel to return mock channel
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);
    vi.mocked(supabase.removeChannel).mockResolvedValue('ok' as const);
  });

  afterEach(async () => {
    // Clean up all subscriptions after each test
    await unsubscribeAll();
  });

  describe('subscribeToSlotAvailability', () => {
    it('should create a channel subscription for an experience', () => {
      const experienceId = '123e4567-e89b-12d3-a456-426614174123';
      const callback = vi.fn();

      const subId = subscribeToSlotAvailability(experienceId, callback);

      // Should create channel with correct name prefix
      expect(supabase.channel).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^experience-slots-${experienceId}-`)),
      );

      // Should set up postgres_changes listener
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_slots',
          filter: `experience_id=eq.${experienceId}`,
        },
        callback,
      );

      // Should call subscribe
      expect(mockSubscribe).toHaveBeenCalled();

      // Should return subscription ID
      expect(subId).toMatch(
        /^slot-123e4567-e89b-12d3-a456-426614174123-[\d-]+$/,
      );
    });

    it('should track active subscriptions', () => {
      const experienceId = '123e4567-e89b-12d3-a456-426614174456';
      const callback = vi.fn();

      expect(getActiveSubscriptionCount()).toBe(0);

      const subId = subscribeToSlotAvailability(experienceId, callback);

      expect(getActiveSubscriptionCount()).toBe(1);
      expect(getActiveSubscriptionIds()).toContain(subId);
    });

    it('should allow multiple subscriptions to same experience', () => {
      const experienceId = '123e4567-e89b-12d3-a456-426614174789';
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const subId1 = subscribeToSlotAvailability(experienceId, callback1);
      const subId2 = subscribeToSlotAvailability(experienceId, callback2);

      expect(subId1).not.toBe(subId2);
      expect(getActiveSubscriptionCount()).toBe(2);
    });
  });

  describe('subscribeToBookingStatus', () => {
    it('should create a channel subscription for a booking', () => {
      const bookingId = '223e4567-e89b-12d3-a456-426614174b23';
      const callback = vi.fn();

      const subId = subscribeToBookingStatus(bookingId, callback);

      // Should create channel with correct name prefix
      expect(supabase.channel).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^booking-${bookingId}-`)),
      );

      // Should set up postgres_changes listener
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        callback,
      );

      // Should return subscription ID
      expect(subId).toMatch(
        /^booking-223e4567-e89b-12d3-a456-426614174b23-[\d-]+$/,
      );
    });
  });

  describe('unsubscribe', () => {
    it('should remove a specific subscription', async () => {
      const experienceId = '123e4567-e89b-12d3-a456-426614174000';
      const callback = vi.fn();

      const subId = subscribeToSlotAvailability(experienceId, callback);
      expect(getActiveSubscriptionCount()).toBe(1);

      await unsubscribe(subId);

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
      expect(getActiveSubscriptionCount()).toBe(0);
    });

    it('should handle unsubscribing non-existent subscription', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await unsubscribe('non-existent-id');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Subscription non-existent-id not found',
      );
      expect(supabase.removeChannel).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should not affect other subscriptions', async () => {
      const callback = vi.fn();
      const subId1 = subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174001',
        callback,
      );
      const subId2 = subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174002',
        callback,
      );

      expect(getActiveSubscriptionCount()).toBe(2);

      await unsubscribe(subId1);

      expect(getActiveSubscriptionCount()).toBe(1);
      expect(getActiveSubscriptionIds()).toContain(subId2);
      expect(getActiveSubscriptionIds()).not.toContain(subId1);
    });
  });

  describe('unsubscribeAll', () => {
    it('should remove all active subscriptions', async () => {
      const callback = vi.fn();

      subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174001',
        callback,
      );
      subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174002',
        callback,
      );
      subscribeToBookingStatus(
        '323e4567-e89b-12d3-a456-426614174b01',
        callback,
      );

      expect(getActiveSubscriptionCount()).toBe(3);

      await unsubscribeAll();

      expect(getActiveSubscriptionCount()).toBe(0);
      expect(supabase.removeChannel).toHaveBeenCalledTimes(3);
    });

    it('should handle empty subscription list', async () => {
      expect(getActiveSubscriptionCount()).toBe(0);

      await unsubscribeAll();

      expect(getActiveSubscriptionCount()).toBe(0);
      expect(supabase.removeChannel).not.toHaveBeenCalled();
    });
  });

  describe('getActiveSubscriptionCount', () => {
    it('should return correct count', () => {
      expect(getActiveSubscriptionCount()).toBe(0);

      const callback = vi.fn();
      subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174001',
        callback,
      );
      expect(getActiveSubscriptionCount()).toBe(1);

      subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174002',
        callback,
      );
      expect(getActiveSubscriptionCount()).toBe(2);
    });
  });

  describe('getActiveSubscriptionIds', () => {
    it('should return list of active subscription IDs', () => {
      expect(getActiveSubscriptionIds()).toEqual([]);

      const callback = vi.fn();
      const subId1 = subscribeToSlotAvailability(
        '123e4567-e89b-12d3-a456-426614174001',
        callback,
      );
      const subId2 = subscribeToBookingStatus(
        '323e4567-e89b-12d3-a456-426614174b01',
        callback,
      );

      const activeIds = getActiveSubscriptionIds();
      expect(activeIds).toHaveLength(2);
      expect(activeIds).toContain(subId1);
      expect(activeIds).toContain(subId2);
    });
  });
});
