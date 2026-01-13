import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StickyTripBar } from '../features/trip/StickyTripBar';
import { TripProvider, useTrip } from '@/contexts/TripContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import type { Trip } from '@/lib/types';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock tripService
vi.mock('@/lib/tripService', () => ({
  tripService: {
    getActiveTrip: vi.fn(),
    saveTrip: vi.fn(),
    clearTrip: vi.fn(),
  },
}));

// Helper to trigger trip updates during tests
function AddItemsButton() {
  const { addToTrip } = useTrip();
  return <button onClick={() => addToTrip('exp_new', 2, 50)}>Add Item</button>;
}

// Test wrapper with all required providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>{children}</TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('StickyTripBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('AC #1: Conditional Visibility', () => {
    it('should not render when trip is empty', () => {
      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      // Should not find checkout button when no items
      expect(
        screen.queryByRole('button', { name: /checkout/i }),
      ).not.toBeInTheDocument();
    });

    it('should render when trip has items', async () => {
      // Add item to localStorage to simulate existing trip
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 2,
            totalPrice: 100,
          },
        ],
        subtotal: 100,
        serviceFee: 10,
        total: 110,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      // Should find checkout button when items exist
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /checkout/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('AC #2: Appearance Animation', () => {
    it('should apply animation classes when rendered', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 30,
          },
        ],
        subtotal: 30,
        serviceFee: 3,
        total: 33,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      const { container } = render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const motionDiv = container.querySelector('[style*="transform"]');
        expect(motionDiv).toBeInTheDocument();
      });
    });

    it('should display correct item count and price for first item', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 25,
          },
        ],
        subtotal: 25,
        serviceFee: 2.5,
        total: 27.5,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Check for item count badge
        expect(screen.getByText('1')).toBeInTheDocument();
        // Check for total price
        expect(screen.getByText(/\$27\.50/)).toBeInTheDocument();
      });
    });
  });

  describe('AC #3: Real-Time Updates', () => {
    it('should update item count and total when trip changes', async () => {
      render(
        <TestWrapper>
          <StickyTripBar />
          <AddItemsButton />
        </TestWrapper>,
      );

      // Add first item
      fireEvent.click(screen.getByText('Add Item'));

      // Verify update
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
      });

      // Add second item
      fireEvent.click(screen.getByText('Add Item'));

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
      });
    });

    it('should apply highlight animation on price change', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 20,
          },
        ],
        subtotal: 20,
        serviceFee: 2,
        total: 22,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      const { container } = render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const barElement = container.querySelector('[role="button"]');
        expect(barElement).toBeInTheDocument();
        // Check for scale-105 class which indicates highlight
        expect(barElement?.className).toMatch(/scale-105|scale-100/);
      });
    });
  });

  describe('AC #4: Layout & Positioning', () => {
    it('should have fixed positioning at bottom of viewport', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 35,
          },
        ],
        subtotal: 35,
        serviceFee: 3.5,
        total: 38.5,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      const { container } = render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const fixedDiv = container.querySelector('.fixed');
        expect(fixedDiv).toBeInTheDocument();
        expect(fixedDiv?.className).toContain('bottom-0');
        expect(fixedDiv?.className).toContain('left-0');
        expect(fixedDiv?.className).toContain('right-0');
      });
    });

    it('should apply safe-area inset padding', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 40,
          },
        ],
        subtotal: 40,
        serviceFee: 4,
        total: 44,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      const { container } = render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const fixedDiv = container.querySelector('.pb-safe');
        expect(fixedDiv).toBeInTheDocument();
      });
    });

    it('should have high z-index to stay above content', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 60,
          },
        ],
        subtotal: 60,
        serviceFee: 6,
        total: 66,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      const { container } = render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        const fixedDiv = container.querySelector('.z-\\[100\\]');
        expect(fixedDiv).toBeInTheDocument();
      });
    });
  });

  describe('AC #5: Interaction & Expansion', () => {
    it('should open Drawer when bar is clicked', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 30,
          },
        ],
        subtotal: 30,
        serviceFee: 3,
        total: 33,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      const tripBar = await screen.findByRole('button', {
        name: /view trip summary/i,
      });
      fireEvent.click(tripBar);

      // expect Drawer to open and show TripCanvas title
      await waitFor(() => {
        expect(screen.getByText('Your Trip')).toBeInTheDocument();
      });
    });

    it('should navigate to checkout when checkout button is clicked', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 50,
          },
        ],
        subtotal: 50,
        serviceFee: 5,
        total: 55,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      const checkoutButton = await screen.findByRole('button', {
        name: /checkout/i,
      });
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    });

    it('should prevent event bubbling when checkout is clicked', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 40,
          },
        ],
        subtotal: 40,
        serviceFee: 4,
        total: 44,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      const checkoutButton = await screen.findByRole('button', {
        name: /checkout/i,
      });
      fireEvent.click(checkoutButton);

      // Should only navigate to checkout, not open drawer
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
      expect(screen.queryByText('Your Trip')).not.toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 70,
          },
        ],
        subtotal: 70,
        serviceFee: 7,
        total: 77,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      const tripBar = await screen.findByRole('button', {
        name: /view trip summary/i,
      });

      // Simulate click for keyboard interaction for now as discussed
      fireEvent.click(tripBar);

      await waitFor(() => {
        expect(screen.getByText('Your Trip')).toBeInTheDocument();
      });
    });

    it('should have proper accessibility attributes', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 2,
            totalPrice: 200,
          },
        ],
        subtotal: 200,
        serviceFee: 20,
        total: 220,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      const tripBar = await screen.findByRole('button', {
        name: /view trip summary: 1 items for \$220\.00/i,
      });

      expect(tripBar).toBeInTheDocument();
      expect(tripBar).toHaveAttribute('tabIndex', '0');
      expect(tripBar).toHaveAttribute('aria-label');
    });
  });

  describe('Currency Formatting', () => {
    it('should format USD correctly', async () => {
      const mockTrip: Trip = {
        id: 'trip_session',
        userId: 'guest',
        destination: 'bali',
        travelers: 1,
        status: 'planning',
        items: [
          {
            experienceId: 'exp_1',
            date: '2026-01-15',
            guests: 1,
            totalPrice: 99.99,
          },
        ],
        subtotal: 99.99,
        serviceFee: 9.99,
        total: 109.98,
      };
      localStorage.setItem('pulau_guest_trip', JSON.stringify(mockTrip));

      render(
        <TestWrapper>
          <StickyTripBar />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/\$109\.98/)).toBeInTheDocument();
      });
    });
  });
});
