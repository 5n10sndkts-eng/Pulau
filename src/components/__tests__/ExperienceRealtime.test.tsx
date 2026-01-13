import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { RealtimeSlotDisplay } from '../RealtimeSlotDisplay';
import { getAvailableSlots } from '@/lib/slotService';
import {
  subscribeToSlotAvailability,
  unsubscribe,
} from '@/lib/realtimeService';

// Mock dependencies
vi.mock('@/lib/slotService', () => ({
  getAvailableSlots: vi.fn(),
}));

vi.mock('@/lib/realtimeService', () => ({
  subscribeToSlotAvailability: vi.fn(),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('RealtimeSlotDisplay Integration', () => {
  const mockExperienceId = 'exp-123';
  const mockDate = '2026-01-10';
  const mockSlots = [
    {
      id: 'slot-1',
      experience_id: mockExperienceId,
      slot_date: mockDate,
      slot_time: '10:00:00',
      total_capacity: 10,
      available_count: 5,
      is_blocked: false,
      price_override_amount: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ];

  let realtimeCallback: (payload: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock initial slots load
    vi.mocked(getAvailableSlots).mockResolvedValue({
      data: mockSlots,
      error: null,
    });

    // Mock realtime subscription
    vi.mocked(subscribeToSlotAvailability).mockImplementation((id, cb) => {
      realtimeCallback = cb;
      return 'sub-123';
    });
  });

  it('displays slots and updates availability in real-time', async () => {
    render(
      <RealtimeSlotDisplay
        experienceId={mockExperienceId}
        selectedDate={mockDate}
        basePrice={5000} // $50.00
      />,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    // Simulate real-time update: 5 spots -> 2 spots
    act(() => {
      if (realtimeCallback) {
        realtimeCallback({
          eventType: 'UPDATE',
          new: { ...mockSlots[0], available_count: 2 },
          old: mockSlots[0],
        });
      }
    });

    // Verify UI updated to Limited
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Limited')).toBeInTheDocument();
    });

    // Simulate real-time update: 2 spots -> 0 spots (Sold Out)
    act(() => {
      if (realtimeCallback) {
        realtimeCallback({
          eventType: 'UPDATE',
          new: { ...mockSlots[0], available_count: 0 },
          old: { ...mockSlots[0], available_count: 2 },
        });
      }
    });

    // Verify UI updated to Sold Out
    await waitFor(() => {
      const soldOutElements = screen.getAllByText('Sold Out');
      expect(soldOutElements.length).toBeGreaterThan(0);
    });
  });

  it('displays connection error when subscription fails', async () => {
    vi.mocked(subscribeToSlotAvailability).mockImplementation(() => {
      throw new Error('Websocket failed');
    });

    render(
      <RealtimeSlotDisplay
        experienceId={mockExperienceId}
        selectedDate={mockDate}
        basePrice={5000}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Connection error: Websocket failed/i),
      ).toBeInTheDocument();
    });
  });
});
