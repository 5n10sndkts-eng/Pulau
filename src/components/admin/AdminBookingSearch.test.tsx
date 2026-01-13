/**
 * Admin Booking Search Tests
 * Story: 28.1 - Build Booking Search Interface
 *
 * Tests search, filtering, and export functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminBookingSearch } from './AdminBookingSearch';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock URL APIs for CSV export
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

const mockBookings = [
  {
    id: 'booking-1',
    reference: 'PL-ABC123',
    status: 'confirmed',
    booked_at: '2026-01-10T10:00:00Z',
    trip_id: 'trip-1',
    trips: {
      id: 'trip-1',
      name: 'Bali Adventure',
      user_id: 'user-1',
      travelers: 2,
      start_date: '2026-02-15',
      destination_id: 'dest-bali',
    },
  },
  {
    id: 'booking-2',
    reference: 'PL-DEF456',
    status: 'pending',
    booked_at: '2026-01-09T14:00:00Z',
    trip_id: 'trip-2',
    trips: {
      id: 'trip-2',
      name: 'Sunset Tour',
      user_id: 'user-2',
      travelers: 4,
      start_date: '2026-02-20',
      destination_id: 'dest-ubud',
    },
  },
  {
    id: 'booking-3',
    reference: 'PL-GHI789',
    status: 'cancelled',
    booked_at: '2026-01-08T09:00:00Z',
    trip_id: 'trip-3',
    trips: null,
  },
];

// Helper to create a chainable Supabase mock
function createChainableMock(resolveData: { data: any; error: any }) {
  const chainable: any = {};
  const methods = ['eq', 'gte', 'lte', 'or', 'order', 'limit', 'select'];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => chainable);
  });

  // Make it thenable (Promise-like)
  chainable.then = (onFulfilled: any) =>
    Promise.resolve(resolveData).then(onFulfilled);
  chainable.catch = (onRejected: any) =>
    Promise.resolve(resolveData).catch(onRejected);

  return chainable;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('AdminBookingSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default chainable mock with bookings data
    const mockChainable = createChainableMock({
      data: mockBookings,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue(mockChainable),
    } as any);
  });

  describe('[P1] Search functionality', () => {
    it('should render search interface with all controls', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      // Header
      expect(screen.getByText('Booking Management')).toBeInTheDocument();

      // Search input
      expect(
        screen.getByPlaceholderText('Search by booking reference...'),
      ).toBeInTheDocument();

      // Filters should be present
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();

      // Export button
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    it('should display bookings in table format', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('PL-ABC123')).toBeInTheDocument();
        expect(screen.getByText('PL-DEF456')).toBeInTheDocument();
        expect(screen.getByText('PL-GHI789')).toBeInTheDocument();
      });

      // Check status badges
      expect(screen.getByText('confirmed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('cancelled')).toBeInTheDocument();
    });

    it('should show loading state while fetching', async () => {
      // Create a delayed chainable mock
      const delayedChainable = createChainableMock({ data: [], error: null });
      // Override then to add delay
      delayedChainable.then = (onFulfilled: any) =>
        new Promise((r) =>
          setTimeout(() => r({ data: [], error: null }), 100),
        ).then(onFulfilled);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(delayedChainable),
      } as any);

      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      expect(screen.getByText('Loading bookings...')).toBeInTheDocument();
    });
  });

  describe('[P1] Filter functionality', () => {
    it('should render filter controls', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      // Status filter
      expect(screen.getByText('All Statuses')).toBeInTheDocument();

      // Date range filter
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
    });
  });

  describe('[P1] Export functionality', () => {
    it('should render export button', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      const exportButton = screen.getByText('Export CSV');
      expect(exportButton).toBeInTheDocument();
    });

    it('should call export when clicked with bookings', async () => {
      const user = userEvent.setup();
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('PL-ABC123')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      // Verify blob was created for download
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('[P1] Refresh functionality', () => {
    it('should render refresh button', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('[P2] Results display', () => {
    it('should show booking count in footer', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 bookings/)).toBeInTheDocument();
      });
    });

    it('should display traveler count from trip data', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      await waitFor(() => {
        // First booking has 2 travelers
        expect(screen.getByText('2')).toBeInTheDocument();
        // Second booking has 4 travelers
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });

    it('should handle bookings without trip data gracefully', async () => {
      render(<AdminBookingSearch />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Third booking has no trip, should show dash
        const dashes = screen.getAllByText('-');
        expect(dashes.length).toBeGreaterThan(0);
      });
    });
  });
});
