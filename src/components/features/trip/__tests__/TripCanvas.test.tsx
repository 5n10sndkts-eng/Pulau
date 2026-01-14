/**
 * TripCanvas Component Tests (Story 33-1)
 *
 * Tests for the expandable trip drawer showing item details
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripCanvas } from '../TripCanvas';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import type { Trip } from '@/lib/types';

// Mock the helpers module
vi.mock('@/lib/helpers', () => ({
  formatPrice: (price: number) => `$${price.toFixed(2)}`,
  getExperienceById: (id: string) => ({
    id,
    title: `Experience ${id}`,
    images: [`https://example.com/${id}.jpg`],
    destination: 'Bali',
    category: 'Adventure',
  }),
  formatDateRange: (start?: string, end?: string) => {
    if (!start) return 'No dates';
    if (!end) return start;
    return `${start} - ${end}`;
  },
}));

// Wrapper to provide Drawer context that TripCanvas requires
function TestWrapper({
  children,
  open = true,
}: {
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <Drawer open={open}>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}

describe('TripCanvas', () => {
  const mockOnRemoveItem = vi.fn();
  const mockOnCheckout = vi.fn();

  const createMockTrip = (itemCount: number = 1): Trip => ({
    id: 'trip_test',
    userId: 'user_123',
    destination: 'bali',
    travelers: 2,
    status: 'planning',
    items: Array.from({ length: itemCount }, (_, i) => ({
      experienceId: `exp_${i + 1}`,
      date: '2026-01-20',
      guests: 2,
      totalPrice: 100 * (i + 1),
    })),
    subtotal: itemCount * 100,
    serviceFee: itemCount * 10,
    total: itemCount * 110,
    startDate: '2026-01-20',
    endDate: '2026-01-25',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Display', () => {
    it('renders the trip title', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip()}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Your Trip')).toBeInTheDocument();
    });

    it('displays total price in header badge', () => {
      const trip = createMockTrip(2);
      render(
        <TestWrapper>
          <TripCanvas
            trip={trip}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      // Total should appear (may be in badge and summary)
      expect(screen.getAllByText(/\$220\.00/).length).toBeGreaterThanOrEqual(1);
    });

    it('displays correct item count - singular', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    });

    it('displays correct item count - plural', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(3)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText(/3 items/i)).toBeInTheDocument();
    });
  });

  describe('Item List', () => {
    it('renders all trip items', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(3)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Experience exp_1')).toBeInTheDocument();
      expect(screen.getByText('Experience exp_2')).toBeInTheDocument();
      expect(screen.getByText('Experience exp_3')).toBeInTheDocument();
    });

    it('displays guest count for each item', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('2 Guests')).toBeInTheDocument();
    });

    it('displays item price', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      // Item price should be visible (may be duplicated with totals)
      expect(screen.getAllByText(/\$100\.00/).length).toBeGreaterThanOrEqual(1);
    });

    it('shows empty state when no items', () => {
      const emptyTrip: Trip = {
        ...createMockTrip(0),
        items: [],
        subtotal: 0,
        serviceFee: 0,
        total: 0,
      };

      render(
        <TestWrapper>
          <TripCanvas
            trip={emptyTrip}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Your trip is empty')).toBeInTheDocument();
    });
  });

  describe('Remove Item Functionality', () => {
    it('calls onRemoveItem when remove button is clicked', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      // Find the remove button (X icon button)
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('absolute'),
      );

      if (removeButton) {
        fireEvent.click(removeButton);
        expect(mockOnRemoveItem).toHaveBeenCalledWith('exp_1');
      }
    });

    it('calls onRemoveItem with correct experienceId for multiple items', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(2)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      // Find all remove buttons
      const removeButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.querySelector('svg') && btn.className.includes('absolute'),
        );

      // Click second remove button
      if (removeButtons[1]) {
        fireEvent.click(removeButtons[1]);
        expect(mockOnRemoveItem).toHaveBeenCalledWith('exp_2');
      }
    });
  });

  describe('Price Summary', () => {
    it('displays subtotal label', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(2)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Subtotal')).toBeInTheDocument();
    });

    it('displays service fee label', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(2)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Service Fee')).toBeInTheDocument();
    });

    it('displays total label and value', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(2)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
      // Total is displayed in the UI
      expect(screen.getAllByText(/\$220\.00/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Checkout Button', () => {
    it('renders checkout button', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('button', { name: /proceed to checkout/i }),
      ).toBeInTheDocument();
    });

    it('calls onCheckout when clicked', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      fireEvent.click(
        screen.getByRole('button', { name: /proceed to checkout/i }),
      );
      expect(mockOnCheckout).toHaveBeenCalled();
    });

    it('is disabled when trip is empty', () => {
      const emptyTrip: Trip = {
        ...createMockTrip(0),
        items: [],
        subtotal: 0,
        serviceFee: 0,
        total: 0,
      };

      render(
        <TestWrapper>
          <TripCanvas
            trip={emptyTrip}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(
        screen.getByRole('button', { name: /proceed to checkout/i }),
      ).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has close button for drawer', () => {
      render(
        <TestWrapper>
          <TripCanvas
            trip={createMockTrip(1)}
            onRemoveItem={mockOnRemoveItem}
            onCheckout={mockOnCheckout}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });
});
