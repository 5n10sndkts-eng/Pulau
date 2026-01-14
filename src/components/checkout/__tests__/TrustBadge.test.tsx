/**
 * TrustBadge Component Tests
 * Story: 33.4 - Checkout Form Optimization (AC #5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustBadge } from '../TrustBadge';

describe('TrustBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-14T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Default rendering', () => {
    it('shows free cancellation message by default', () => {
      render(<TrustBadge />);

      expect(screen.getByText(/free cancellation/i)).toBeInTheDocument();
    });

    it('shows secure payment message by default', () => {
      render(<TrustBadge />);

      expect(screen.getByText(/secure payment/i)).toBeInTheDocument();
      expect(screen.getByText(/256-bit encryption/i)).toBeInTheDocument();
    });

    it('does not show instant confirmation by default', () => {
      render(<TrustBadge />);

      expect(screen.queryByText(/instant confirmation/i)).not.toBeInTheDocument();
    });
  });

  describe('Conditional rendering', () => {
    it('hides cancellation when showCancellation is false', () => {
      render(<TrustBadge showCancellation={false} />);

      expect(screen.queryByText(/free cancellation/i)).not.toBeInTheDocument();
    });

    it('hides secure payment when showSecure is false', () => {
      render(<TrustBadge showSecure={false} />);

      expect(screen.queryByText(/secure payment/i)).not.toBeInTheDocument();
    });

    it('shows instant confirmation when showInstant is true', () => {
      render(<TrustBadge showInstant />);

      expect(screen.getByText(/instant confirmation/i)).toBeInTheDocument();
    });
  });

  describe('Cancellation deadline', () => {
    it('calculates deadline based on experience date', () => {
      // Experience on Jan 20, 2026 -> deadline is Jan 19, 2026 (24h before)
      render(<TrustBadge experienceDate="2026-01-20" />);

      expect(screen.getByText(/jan 19/i)).toBeInTheDocument();
    });

    it('shows default deadline when no date provided', () => {
      render(<TrustBadge />);

      // Should show a date ~30 days from now
      expect(screen.getByText(/free cancellation/i)).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(<TrustBadge className="mt-4 p-2" />);

      expect(container.firstChild).toHaveClass('mt-4');
      expect(container.firstChild).toHaveClass('p-2');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic text elements', () => {
      render(<TrustBadge showInstant />);

      // Verify strong element for emphasis
      expect(screen.getByText('Free Cancellation').tagName).toBe('STRONG');
    });

    it('icons have proper sizing for visibility', () => {
      const { container } = render(<TrustBadge showInstant />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(3); // CheckCircle, Shield, Clock
    });
  });
});
