/**
 * OnboardingSingleScreen Component Tests
 * Story: 33.2 - Single-Screen Onboarding Redesign
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingSingleScreen } from '../OnboardingSingleScreen';
import { BrowserRouter } from 'react-router-dom';

const renderComponent = (props = {}) => {
  const defaultProps = {
    onComplete: vi.fn(),
    onSkip: vi.fn(),
  };
  return render(
    <BrowserRouter>
      <OnboardingSingleScreen {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('OnboardingSingleScreen', () => {
  describe('AC #1: Initial Render', () => {
    it('should display all three sections: Vibe, Group, Budget', () => {
      renderComponent();
      
      expect(screen.getByText(/What's Your Vibe?/i)).toBeInTheDocument();
      expect(screen.getByText(/Who's Traveling?/i)).toBeInTheDocument();
      expect(screen.getByText(/Budget Range/i)).toBeInTheDocument();
    });

    it('should display the main heading', () => {
      renderComponent();
      
      expect(screen.getByText(/Plan Your Dream Trip/i)).toBeInTheDocument();
    });
  });

  describe('AC #2: Selection UI', () => {
    it('should display all travel style options', () => {
      renderComponent();
      
      expect(screen.getByText('Adventure')).toBeInTheDocument();
      expect(screen.getByText('Relaxation')).toBeInTheDocument();
      expect(screen.getByText('Culture')).toBeInTheDocument();
      expect(screen.getByText('Wellness')).toBeInTheDocument();
    });

    it('should display all group type options', () => {
      renderComponent();
      
      expect(screen.getByText('Solo')).toBeInTheDocument();
      expect(screen.getByText('Couple')).toBeInTheDocument();
      expect(screen.getByText('Friends')).toBeInTheDocument();
      expect(screen.getByText('Family')).toBeInTheDocument();
    });

    it('should display all budget options', () => {
      renderComponent();
      
      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('Mid-Range')).toBeInTheDocument();
      expect(screen.getByText('Luxury')).toBeInTheDocument();
    });

    it('should allow multiple travel style selections', () => {
      renderComponent();
      
      const adventureBtn = screen.getByText('Adventure').closest('button');
      const relaxationBtn = screen.getByText('Relaxation').closest('button');
      
      fireEvent.click(adventureBtn!);
      fireEvent.click(relaxationBtn!);
      
      expect(adventureBtn).toHaveClass('border-primary');
      expect(relaxationBtn).toHaveClass('border-primary');
    });

    it('should toggle travel style selection on multiple clicks', () => {
      renderComponent();
      
      const adventureBtn = screen.getByText('Adventure').closest('button');
      
      // Select
      fireEvent.click(adventureBtn!);
      expect(adventureBtn).toHaveClass('border-primary');
      
      // Deselect
      fireEvent.click(adventureBtn!);
      expect(adventureBtn).not.toHaveClass('border-primary');
    });

    it('should allow only single group type selection', () => {
      renderComponent();
      
      const soloBtn = screen.getByText('Solo').closest('button');
      const coupleBtn = screen.getByText('Couple').closest('button');
      
      fireEvent.click(soloBtn!);
      expect(soloBtn).toHaveClass('border-primary');
      
      fireEvent.click(coupleBtn!);
      expect(coupleBtn).toHaveClass('border-primary');
      expect(soloBtn).not.toHaveClass('border-primary');
    });

    it('should allow only single budget selection', () => {
      renderComponent();
      
      const budgetBtn = screen.getByText('Budget').closest('button');
      const luxuryBtn = screen.getByText('Luxury').closest('button');
      
      fireEvent.click(budgetBtn!);
      expect(budgetBtn).toHaveClass('border-primary');
      
      fireEvent.click(luxuryBtn!);
      expect(luxuryBtn).toHaveClass('border-primary');
      expect(budgetBtn).not.toHaveClass('border-primary');
    });
  });

  describe('AC #3: Validation', () => {
    it('should disable Start Planning button when no selections made', () => {
      renderComponent();
      
      const startBtn = screen.getByText(/Start Planning/i);
      expect(startBtn).toBeDisabled();
    });

    it('should enable Start Planning button when all categories selected', () => {
      renderComponent();
      
      // Select one from each category
      fireEvent.click(screen.getByText('Adventure').closest('button')!);
      fireEvent.click(screen.getByText('Solo').closest('button')!);
      fireEvent.click(screen.getByText('Mid-Range').closest('button')!);
      
      const startBtn = screen.getByText(/Start Planning/i);
      expect(startBtn).not.toBeDisabled();
    });

    it('should show Skip & Explore link', () => {
      renderComponent();
      
      expect(screen.getByText(/Skip & Explore/i)).toBeInTheDocument();
    });

    it('should show validation helper text when incomplete', () => {
      renderComponent();
      
      expect(screen.getByText(/Select at least one option in each category/i)).toBeInTheDocument();
    });
  });

  describe('AC #4: Persistence - Start Planning', () => {
    it('should call onComplete with selected preferences', () => {
      const onComplete = vi.fn();
      renderComponent({ onComplete });
      
      // Make selections
      fireEvent.click(screen.getByText('Adventure').closest('button')!);
      fireEvent.click(screen.getByText('Culture').closest('button')!);
      fireEvent.click(screen.getByText('Couple').closest('button')!);
      fireEvent.click(screen.getByText('Luxury').closest('button')!);
      
      // Click Start Planning
      const startBtn = screen.getByText(/Start Planning/i);
      fireEvent.click(startBtn);
      
      expect(onComplete).toHaveBeenCalledWith({
        travelStyles: expect.arrayContaining(['adventure', 'culture']),
        groupType: 'couple',
        budget: 'luxury',
      });
    });

    it('should not call onComplete when button is disabled', () => {
      const onComplete = vi.fn();
      renderComponent({ onComplete });
      
      const startBtn = screen.getByText(/Start Planning/i);
      fireEvent.click(startBtn);
      
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('AC #5: Skip Logic', () => {
    it('should call onSkip when Skip & Explore clicked', () => {
      const onSkip = vi.fn();
      renderComponent({ onSkip });
      
      const skipBtn = screen.getByText(/Skip & Explore/i);
      fireEvent.click(skipBtn);
      
      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for selection chips', () => {
      renderComponent();
      
      const adventureBtn = screen.getByText('Adventure').closest('button');
      expect(adventureBtn).toHaveAttribute('aria-pressed');
    });

    it('should announce selected state to screen readers', () => {
      renderComponent();
      
      const adventureBtn = screen.getByText('Adventure').closest('button');
      
      // Initially not selected
      expect(adventureBtn).toHaveAttribute('aria-pressed', 'false');
      
      // After selection
      fireEvent.click(adventureBtn!);
      expect(adventureBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
