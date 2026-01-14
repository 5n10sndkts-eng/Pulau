/**
 * PaymentRequestButton Component Tests
 * Story: 33.4 - Checkout Form Optimization (AC #4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentRequestButton } from '../PaymentRequestButton';

describe('PaymentRequestButton', () => {
  const mockOnPay = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default rendering', () => {
    it('renders with formatted amount', () => {
      render(<PaymentRequestButton amount={99.99} onPay={mockOnPay} />);

      expect(screen.getByRole('button')).toHaveTextContent('$99.99');
    });

    it('renders with custom currency', () => {
      render(<PaymentRequestButton amount={100} currency="EUR" onPay={mockOnPay} />);

      expect(screen.getByRole('button')).toHaveTextContent('€100.00');
    });
  });

  describe('Click handling', () => {
    it('calls onPay when clicked', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} />);

      fireEvent.click(screen.getByRole('button'));

      expect(mockOnPay).toHaveBeenCalledTimes(1);
    });

    it('does not call onPay when disabled', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} disabled />);

      fireEvent.click(screen.getByRole('button'));

      expect(mockOnPay).not.toHaveBeenCalled();
    });

    it('does not call onPay when processing', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} isProcessing />);

      fireEvent.click(screen.getByRole('button'));

      expect(mockOnPay).not.toHaveBeenCalled();
    });
  });

  describe('Processing state', () => {
    it('shows processing text when isProcessing is true', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} isProcessing />);

      expect(screen.getByRole('button')).toHaveTextContent('Processing');
    });

    it('disables button when processing', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} isProcessing />);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} disabled />);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('applies large size styling', () => {
      render(<PaymentRequestButton amount={50} onPay={mockOnPay} />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('h-14');
      expect(button.className).toContain('rounded-xl');
    });
  });
});
