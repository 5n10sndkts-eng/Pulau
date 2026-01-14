/**
 * Quick Add Interaction Loop Test
 * Story: 33.3 - Quick Add Interaction Loop
 *
 * Tests the complete quick-add interaction flow including:
 * - Quick add button presence
 * - Instant state change (optimistic UI)
 * - Toggle behavior (add/remove)
 * - Animation triggering
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrendingExperienceCard, HiddenGemCard, LimitedAvailabilityCard } from '@/components/features/discovery/DiscoveryCards';
import type { Experience } from '@/lib/types';

// Mock experience data
const mockExperience: Experience = {
  id: 'exp_1',
  title: 'Sunrise Hike at Mount Batur',
  description: 'Experience breathtaking sunrise views',
  images: ['https://example.com/image.jpg'],
  price: {
    amount: 65,
    currency: 'USD',
    per: 'person',
  },
  duration: '6 hours',
  category: 'adventure',
  tags: ['hiking', 'sunrise'],
  groupSize: { min: 1, max: 12 },
  provider: {
    id: 'provider_1',
    name: 'Bali Adventures',
    rating: 4.9,
    reviewCount: 342,
    instantBookEnabled: true,
  },
};

describe('Quick Add Interaction Loop', () => {
  describe('TrendingExperienceCard', () => {
    it('should render with quick add button when onQuickAdd is provided', () => {
      const onQuickAdd = vi.fn();
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          onClick={vi.fn()}
          onQuickAdd={onQuickAdd}
        />
      );

      expect(screen.getByRole('button', { name: /add to trip/i })).toBeInTheDocument();
    });

    it('should not render quick add button when onQuickAdd is not provided', () => {
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          onClick={vi.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: /add to trip/i })).not.toBeInTheDocument();
    });

    it('should show "Added" state when isInTrip is true', () => {
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          isInTrip={true}
          onClick={vi.fn()}
          onQuickAdd={vi.fn()}
        />
      );

      expect(screen.getByText('Added')).toBeInTheDocument();
    });

    it('should call onQuickAdd with button rect when clicked', async () => {
      const onQuickAdd = vi.fn();
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          onClick={vi.fn()}
          onQuickAdd={onQuickAdd}
        />
      );

      const addButton = screen.getByRole('button', { name: /add to trip/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onQuickAdd).toHaveBeenCalledTimes(1);
        // DOMRect is provided (may be zeros in test environment)
        expect(onQuickAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
          })
        );
      });
    });

    it('should not trigger parent onClick when quick add button is clicked', () => {
      const onClick = vi.fn();
      const onQuickAdd = vi.fn();
      
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          onClick={onClick}
          onQuickAdd={onQuickAdd}
        />
      );

      const addButton = screen.getByRole('button', { name: /add to trip/i });
      fireEvent.click(addButton);

      expect(onClick).not.toHaveBeenCalled();
      expect(onQuickAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('HiddenGemCard', () => {
    it('should toggle between "Add" and "Added" states', async () => {
      const { rerender } = render(
        <HiddenGemCard
          experience={mockExperience}
          isInTrip={false}
          onClick={vi.fn()}
          onQuickAdd={vi.fn()}
        />
      );

      // Initially shows "Add" - check for button with text or icon
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(
        <HiddenGemCard
          experience={mockExperience}
          isInTrip={true}
          onClick={vi.fn()}
          onQuickAdd={vi.fn()}
        />
      );

      // After toggle, should show success variant (bg-success class)
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-success');
    });
  });

  describe('LimitedAvailabilityCard', () => {
    it('should render with quick add button in compact layout', () => {
      render(
        <LimitedAvailabilityCard
          experience={mockExperience}
          spotsLeft={3}
          onClick={vi.fn()}
          onQuickAdd={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
      expect(screen.getByText(/only 3 spots left/i)).toBeInTheDocument();
    });

    it('should show singular "spot" when spotsLeft is 1', () => {
      render(
        <LimitedAvailabilityCard
          experience={mockExperience}
          spotsLeft={1}
          onClick={vi.fn()}
          onQuickAdd={vi.fn()}
        />
      );

      expect(screen.getByText(/only 1 spot left/i)).toBeInTheDocument();
    });
  });

  describe('Animation Support', () => {
    it('should provide DOMRect for flying animation', async () => {
      const onQuickAdd = vi.fn();
      render(
        <TrendingExperienceCard
          experience={mockExperience}
          onClick={vi.fn()}
          onQuickAdd={onQuickAdd}
        />
      );

      const addButton = screen.getByRole('button', { name: /add to trip/i });
      const rect = addButton.getBoundingClientRect();

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onQuickAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
          })
        );
      });

      // Verify rect has expected properties
      const calledRect = onQuickAdd.mock.calls[0]?.[0];
      expect(calledRect).toBeDefined();
      expect(typeof calledRect?.x).toBe('number');
      expect(typeof calledRect?.y).toBe('number');
    });
  });
});
