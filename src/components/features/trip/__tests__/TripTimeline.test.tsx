/**
 * TripTimeline Component Tests
 * Story: DEF-003 - Trip Timeline Missing Connecting Lines
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TripTimeline, TimelineNode, TimelineMobile, TimelineNodeMobile } from '../TripTimeline';

describe('TripTimeline', () => {
  describe('TripTimeline container', () => {
    it('renders children', () => {
      render(
        <TripTimeline>
          <div data-testid="child">Content</div>
        </TripTimeline>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders timeline line when showTimeline is true', () => {
      const { container } = render(
        <TripTimeline showTimeline>
          <div>Content</div>
        </TripTimeline>
      );

      // Timeline line should have primary color and be hidden from screen readers
      const line = container.querySelector('[aria-hidden="true"]');
      expect(line).toBeInTheDocument();
      expect(line).toHaveClass('bg-primary/20');
    });

    it('does not render timeline line when showTimeline is false', () => {
      const { container } = render(
        <TripTimeline showTimeline={false}>
          <div>Content</div>
        </TripTimeline>
      );

      const line = container.querySelector('[aria-hidden="true"]');
      expect(line).not.toBeInTheDocument();
    });
  });

  describe('TimelineNode', () => {
    it('renders day number', () => {
      render(
        <TimelineNode dayNumber={1} hasItems={false}>
          <div>Day content</div>
        </TimelineNode>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows filled node when hasItems is true', () => {
      const { container } = render(
        <TimelineNode dayNumber={2} hasItems>
          <div>Day content</div>
        </TimelineNode>
      );

      const node = container.querySelector('.bg-primary');
      expect(node).toBeInTheDocument();
    });

    it('shows outlined node when hasItems is false', () => {
      const { container } = render(
        <TimelineNode dayNumber={3} hasItems={false}>
          <div>Day content</div>
        </TimelineNode>
      );

      const node = container.querySelector('.bg-background');
      expect(node).toBeInTheDocument();
    });

    it('has proper accessibility label', () => {
      render(
        <TimelineNode dayNumber={1} hasItems>
          <div>Day content</div>
        </TimelineNode>
      );

      expect(screen.getByLabelText('Day 1, has activities')).toBeInTheDocument();
    });

    it('indicates no activities in aria label', () => {
      render(
        <TimelineNode dayNumber={2} hasItems={false}>
          <div>Day content</div>
        </TimelineNode>
      );

      expect(screen.getByLabelText('Day 2, no activities')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <TimelineNode dayNumber={1} hasItems={false}>
          <div data-testid="day-content">My activities</div>
        </TimelineNode>
      );

      expect(screen.getByTestId('day-content')).toBeInTheDocument();
    });
  });

  describe('TimelineMobile', () => {
    it('renders children with thinner line', () => {
      const { container } = render(
        <TimelineMobile>
          <div data-testid="mobile-child">Mobile content</div>
        </TimelineMobile>
      );

      expect(screen.getByTestId('mobile-child')).toBeInTheDocument();
      
      // Mobile line should be 1px (w-px)
      const line = container.querySelector('.w-px');
      expect(line).toBeInTheDocument();
    });
  });

  describe('TimelineNodeMobile', () => {
    it('renders smaller node indicator', () => {
      const { container } = render(
        <TimelineNodeMobile dayNumber={1} hasItems>
          <div>Content</div>
        </TimelineNodeMobile>
      );

      // Mobile nodes are w-4 h-4 (smaller than desktop w-8 h-8)
      const node = container.querySelector('.w-4.h-4');
      expect(node).toBeInTheDocument();
    });

    it('applies correct styling for hasItems', () => {
      const { container } = render(
        <TimelineNodeMobile dayNumber={1} hasItems>
          <div>Content</div>
        </TimelineNodeMobile>
      );

      const node = container.querySelector('.bg-primary');
      expect(node).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders multiple days correctly', () => {
      render(
        <TripTimeline>
          <TimelineNode dayNumber={1} hasItems>
            <div>Day 1 activities</div>
          </TimelineNode>
          <TimelineNode dayNumber={2} hasItems={false}>
            <div>Day 2 free</div>
          </TimelineNode>
          <TimelineNode dayNumber={3} hasItems>
            <div>Day 3 activities</div>
          </TimelineNode>
        </TripTimeline>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Day 1 activities')).toBeInTheDocument();
      expect(screen.getByText('Day 2 free')).toBeInTheDocument();
      expect(screen.getByText('Day 3 activities')).toBeInTheDocument();
    });
  });
});
