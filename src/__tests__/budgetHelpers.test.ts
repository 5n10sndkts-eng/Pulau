/**
 * Budget Helper Tests
 * Story: 33.5 - Budget Helper & Discovery Optimization
 *
 * Tests budget calculation, status determination, and formatting
 */

import { describe, it, expect } from 'vitest';
import {
  BUDGET_CAPS,
  getBudgetCap,
  getRemainingBudget,
  getBudgetStatus,
  getBudgetStatusColor,
  getBudgetStatusBg,
  formatBudgetMessage,
} from '@/lib/budgetHelpers';

describe('Budget Helpers', () => {
  describe('BUDGET_CAPS', () => {
    it('should define correct budget caps', () => {
      expect(BUDGET_CAPS).toEqual({
        budget: 300,
        midrange: 800,
        luxury: 2000,
      });
    });
  });

  describe('getBudgetCap', () => {
    it('should return correct cap for each budget level', () => {
      expect(getBudgetCap('budget')).toBe(300);
      expect(getBudgetCap('midrange')).toBe(800);
      expect(getBudgetCap('luxury')).toBe(2000);
    });

    it('should default to midrange for undefined budget', () => {
      expect(getBudgetCap(undefined)).toBe(800);
    });
  });

  describe('getRemainingBudget', () => {
    it('should calculate remaining budget correctly', () => {
      expect(getRemainingBudget('budget', 100)).toBe(200);
      expect(getRemainingBudget('midrange', 500)).toBe(300);
      expect(getRemainingBudget('luxury', 1500)).toBe(500);
    });

    it('should return negative when over budget', () => {
      expect(getRemainingBudget('budget', 400)).toBe(-100);
      expect(getRemainingBudget('midrange', 900)).toBe(-100);
    });

    it('should handle zero current total', () => {
      expect(getRemainingBudget('budget', 0)).toBe(300);
      expect(getRemainingBudget('midrange', 0)).toBe(800);
    });
  });

  describe('getBudgetStatus', () => {
    it('should return "healthy" when > 50% remaining', () => {
      expect(getBudgetStatus('budget', 100)).toBe('healthy'); // 66% remaining
      expect(getBudgetStatus('midrange', 200)).toBe('healthy'); // 75% remaining
    });

    it('should return "warning" when 20-50% remaining', () => {
      expect(getBudgetStatus('budget', 180)).toBe('warning'); // 40% remaining
      expect(getBudgetStatus('midrange', 500)).toBe('warning'); // 37.5% remaining
    });

    it('should return "danger" when < 20% remaining but still positive', () => {
      expect(getBudgetStatus('budget', 260)).toBe('danger'); // 13.3% remaining
      expect(getBudgetStatus('midrange', 700)).toBe('danger'); // 12.5% remaining
    });

    it('should return "over" when budget exceeded', () => {
      expect(getBudgetStatus('budget', 301)).toBe('over');
      expect(getBudgetStatus('midrange', 801)).toBe('over');
      expect(getBudgetStatus('luxury', 2500)).toBe('over');
    });

    it('should handle exact budget limit', () => {
      // At exact budget limit (0 remaining), it's 0% remaining which is < 20%, so "danger"
      expect(getBudgetStatus('budget', 300)).toBe('danger');
      expect(getBudgetStatus('midrange', 800)).toBe('danger');
    });
  });

  describe('getBudgetStatusColor', () => {
    it('should return correct color classes', () => {
      expect(getBudgetStatusColor('healthy')).toBe('text-success');
      expect(getBudgetStatusColor('warning')).toBe('text-yellow-600');
      expect(getBudgetStatusColor('danger')).toBe('text-orange-500');
      expect(getBudgetStatusColor('over')).toBe('text-destructive');
    });
  });

  describe('getBudgetStatusBg', () => {
    it('should return correct background classes', () => {
      expect(getBudgetStatusBg('healthy')).toBe('bg-success/10 border-success/20');
      expect(getBudgetStatusBg('warning')).toBe('bg-yellow-500/10 border-yellow-500/20');
      expect(getBudgetStatusBg('danger')).toBe('bg-orange-500/10 border-orange-500/20');
      expect(getBudgetStatusBg('over')).toBe('bg-destructive/10 border-destructive/20');
    });
  });

  describe('formatBudgetMessage', () => {
    it('should format remaining budget message', () => {
      expect(formatBudgetMessage('budget', 100)).toBe('$200 remaining');
      expect(formatBudgetMessage('midrange', 500)).toBe('$300 remaining');
    });

    it('should format over budget message', () => {
      expect(formatBudgetMessage('budget', 350)).toBe('$50 over budget');
      expect(formatBudgetMessage('midrange', 900)).toBe('$100 over budget');
    });

    it('should handle zero remaining', () => {
      // 0 remaining means danger status, which shows as "$0 remaining"
      expect(formatBudgetMessage('budget', 300)).toBe('$0 remaining');
    });

    it('should round to nearest dollar', () => {
      expect(formatBudgetMessage('budget', 100.75)).toBe('$199 remaining');
      expect(formatBudgetMessage('midrange', 550.99)).toBe('$249 remaining');
    });
  });

  describe('Budget Thresholds (Integration)', () => {
    it('should show correct status as budget is consumed', () => {
      const budget = 'budget'; // $300 cap

      // Start: $0 spent -> healthy
      expect(getBudgetStatus(budget, 0)).toBe('healthy');
      expect(getRemainingBudget(budget, 0)).toBe(300);

      // $100 spent (66% remaining) -> healthy
      expect(getBudgetStatus(budget, 100)).toBe('healthy');
      expect(formatBudgetMessage(budget, 100)).toBe('$200 remaining');

      // $180 spent (40% remaining) -> warning
      expect(getBudgetStatus(budget, 180)).toBe('warning');
      expect(formatBudgetMessage(budget, 180)).toBe('$120 remaining');

      // $260 spent (13% remaining) -> danger
      expect(getBudgetStatus(budget, 260)).toBe('danger');
      expect(formatBudgetMessage(budget, 260)).toBe('$40 remaining');

      // $320 spent (over) -> over
      expect(getBudgetStatus(budget, 320)).toBe('over');
      expect(formatBudgetMessage(budget, 320)).toBe('$20 over budget');
    });
  });

  describe('Filter Use Case', () => {
    it('should support "Under Budget" filtering', () => {
      const userBudget = 'midrange'; // $800 cap
      const currentTotal = 500; // $300 remaining
      const remaining = getRemainingBudget(userBudget, currentTotal);

      // Mock experiences
      const experiences = [
        { id: '1', price: { amount: 50 } },
        { id: '2', price: { amount: 250 } },
        { id: '3', price: { amount: 300 } }, // Exactly at limit
        { id: '4', price: { amount: 350 } }, // Over
        { id: '5', price: { amount: 100 } },
      ];

      // Filter experiences under budget
      const underBudget = experiences.filter((exp) => exp.price.amount <= remaining);

      expect(underBudget).toHaveLength(4);
      expect(underBudget.map((e) => e.id)).toEqual(['1', '2', '3', '5']);
    });
  });
});
