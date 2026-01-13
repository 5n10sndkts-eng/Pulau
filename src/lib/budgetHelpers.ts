/**
 * Budget Helper Utilities
 * Story: 33.5 - Budget Helper & Discovery Optimization
 *
 * Provides budget calculation and visualization helpers.
 */

import type { UserPreferences } from './types';

// Budget caps per preference level (in USD)
export const BUDGET_CAPS: Record<
  NonNullable<UserPreferences['budget']>,
  number
> = {
  budget: 300,
  midrange: 800,
  luxury: 2000,
};

export type BudgetStatus = 'healthy' | 'warning' | 'danger' | 'over';

/**
 * Get the budget cap for a user's budget preference
 */
export function getBudgetCap(budget: UserPreferences['budget']): number {
  if (!budget) return BUDGET_CAPS.midrange; // Default to midrange
  return BUDGET_CAPS[budget];
}

/**
 * Calculate remaining budget
 */
export function getRemainingBudget(
  budget: UserPreferences['budget'],
  currentTotal: number,
): number {
  const cap = getBudgetCap(budget);
  return cap - currentTotal;
}

/**
 * Get budget status based on percentage remaining
 */
export function getBudgetStatus(
  budget: UserPreferences['budget'],
  currentTotal: number,
): BudgetStatus {
  const cap = getBudgetCap(budget);
  const remaining = cap - currentTotal;
  const percentRemaining = (remaining / cap) * 100;

  if (remaining < 0) return 'over';
  if (percentRemaining < 20) return 'danger';
  if (percentRemaining < 50) return 'warning';
  return 'healthy';
}

/**
 * Get CSS classes for budget status colors
 */
export function getBudgetStatusColor(status: BudgetStatus): string {
  switch (status) {
    case 'healthy':
      return 'text-success';
    case 'warning':
      return 'text-yellow-600';
    case 'danger':
      return 'text-orange-500';
    case 'over':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get background classes for budget status
 */
export function getBudgetStatusBg(status: BudgetStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 border-success/20';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/20';
    case 'danger':
      return 'bg-orange-500/10 border-orange-500/20';
    case 'over':
      return 'bg-destructive/10 border-destructive/20';
    default:
      return 'bg-muted/50 border-border';
  }
}

/**
 * Format budget message
 */
export function formatBudgetMessage(
  budget: UserPreferences['budget'],
  currentTotal: number,
): string {
  const remaining = getRemainingBudget(budget, currentTotal);
  const status = getBudgetStatus(budget, currentTotal);

  if (status === 'over') {
    return `$${Math.abs(remaining).toFixed(0)} over budget`;
  }
  return `$${remaining.toFixed(0)} remaining`;
}
