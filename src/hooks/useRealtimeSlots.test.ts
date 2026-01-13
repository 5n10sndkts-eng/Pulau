/**
 * Tests for useRealtimeSlots Hook
 * Story: 25.1 - Implement Supabase Realtime Subscriptions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRealtimeSlots } from './useRealtimeSlots';
import * as realtimeService from '@/lib/realtimeService';

// Mock the realtime service
vi.mock('@/lib/realtimeService', () => ({
  subscribeToSlotAvailability: vi.fn(),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
}));

describe('useRealtimeSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useRealtimeSlots(undefined));

    expect(result.current.connectionState).toBe('disconnected');
    expect(result.current.lastUpdate).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isStale).toBe(false);
  });

  it('should subscribe when experienceId is provided', () => {
    const mockSubId = 'sub-123';
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockReturnValue(
      mockSubId,
    );

    const callback = vi.fn();
    const { result } = renderHook(() => useRealtimeSlots('exp-123', callback));

    expect(realtimeService.subscribeToSlotAvailability).toHaveBeenCalledWith(
      'exp-123',
      expect.any(Function),
    );

    // Should transition to connecting then connected
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.connectionState).toBe('connected');
  });

  it('should not subscribe when experienceId is undefined', () => {
    const { result } = renderHook(() => useRealtimeSlots(undefined));

    expect(realtimeService.subscribeToSlotAvailability).not.toHaveBeenCalled();
    expect(result.current.connectionState).toBe('disconnected');
  });

  it('should unsubscribe on unmount', async () => {
    const mockSubId = 'sub-456';
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockReturnValue(
      mockSubId,
    );
    vi.mocked(realtimeService.unsubscribe).mockResolvedValue();

    const { unmount } = renderHook(() => useRealtimeSlots('exp-456'));

    act(() => {
      unmount();
    });

    await vi.runAllTimersAsync();

    expect(realtimeService.unsubscribe).toHaveBeenCalledWith(mockSubId);
  });

  it('should call callback when slot changes', async () => {
    let capturedCallback: any;
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockImplementation(
      (experienceId, callback) => {
        capturedCallback = callback;
        return 'sub-789';
      },
    );

    const userCallback = vi.fn();
    const { result } = renderHook(() =>
      useRealtimeSlots('exp-789', userCallback),
    );

    // Simulate a slot change
    const mockPayload = {
      eventType: 'UPDATE',
      new: { id: 'slot-1', available_count: 5 },
      old: { id: 'slot-1', available_count: 6 },
    };

    act(() => {
      capturedCallback(mockPayload);
    });

    // Should update lastUpdate
    expect(result.current.lastUpdate).not.toBeNull();
    expect(result.current.connectionState).toBe('connected');

    // Should call user callback
    expect(userCallback).toHaveBeenCalledWith(mockPayload);
  });

  it('should handle callback errors gracefully', async () => {
    let capturedCallback: any;
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockImplementation(
      (experienceId, callback) => {
        capturedCallback = callback;
        return 'sub-error';
      },
    );

    const errorCallback = vi.fn(() => {
      throw new Error('Callback error');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useRealtimeSlots('exp-error', errorCallback),
    );

    const mockPayload = { eventType: 'UPDATE', new: {}, old: {} };

    act(() => {
      capturedCallback(mockPayload);
    });

    // Should set error but not crash
    expect(result.current.error).toBe('Callback error');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should detect stale data', async () => {
    let capturedCallback: any;
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockImplementation(
      (experienceId, callback) => {
        capturedCallback = callback;
        return 'sub-stale';
      },
    );

    const { result } = renderHook(() =>
      useRealtimeSlots('exp-stale', undefined, { staleThresholdMs: 5000 }),
    );

    // Trigger update
    act(() => {
      capturedCallback({ eventType: 'UPDATE', new: {}, old: {} });
    });

    // Should not be stale immediately
    expect(result.current.isStale).toBe(false);

    // Advance time past threshold
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // Check staleness (runs every 10s, so advance more)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isStale).toBe(true);
  });

  it('should retry on error when enabled', async () => {
    const mockError = new Error('Connection failed');
    let callCount = 0;

    vi.mocked(realtimeService.subscribeToSlotAvailability).mockImplementation(
      () => {
        callCount++;
        if (callCount === 1) {
          throw mockError;
        }
        return 'sub-retry-success';
      },
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useRealtimeSlots('exp-retry', undefined, {
        retryOnError: true,
        retryDelayMs: 1000,
      }),
    );

    // Should be in error state initially
    expect(result.current.connectionState).toBe('error');
    expect(result.current.error).toBe('Connection failed');

    // Advance time to trigger retry
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // Should retry and succeed
    expect(callCount).toBe(2);

    consoleSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should not retry when retryOnError is false', async () => {
    const mockError = new Error('Connection failed');
    vi.mocked(realtimeService.subscribeToSlotAvailability).mockImplementation(
      () => {
        throw mockError;
      },
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useRealtimeSlots('exp-no-retry', undefined, { retryOnError: false }),
    );

    // Should be in error state
    expect(result.current.connectionState).toBe('error');

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not retry (still only 1 call)
    expect(realtimeService.subscribeToSlotAvailability).toHaveBeenCalledTimes(
      1,
    );

    consoleSpy.mockRestore();
  });

  it('should resubscribe when experienceId changes', async () => {
    const mockUnsubscribe = vi
      .mocked(realtimeService.unsubscribe)
      .mockResolvedValue();
    vi.mocked(realtimeService.subscribeToSlotAvailability)
      .mockReturnValueOnce('sub-1')
      .mockReturnValueOnce('sub-2');

    const { rerender } = renderHook(
      ({ experienceId }) => useRealtimeSlots(experienceId),
      { initialProps: { experienceId: 'exp-1' } },
    );

    expect(realtimeService.subscribeToSlotAvailability).toHaveBeenCalledWith(
      'exp-1',
      expect.any(Function),
    );

    // Change experienceId
    act(() => {
      rerender({ experienceId: 'exp-2' });
    });

    await vi.runAllTimersAsync();

    // Should unsubscribe from old and subscribe to new
    expect(mockUnsubscribe).toHaveBeenCalledWith('sub-1');
    expect(realtimeService.subscribeToSlotAvailability).toHaveBeenCalledWith(
      'exp-2',
      expect.any(Function),
    );
  });
});
