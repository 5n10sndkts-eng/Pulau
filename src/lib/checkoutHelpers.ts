/**
 * Checkout Helpers
 * Story: 33.4 - Checkout Form Optimization
 *
 * Provides smart defaults and utility functions for checkout flow
 */

/**
 * Maps user group type preference to suggested guest count
 * @param groupType - User's travel group type preference
 * @returns Suggested number of guests
 */
export function getGuestCountFromGroupType(
  groupType?: string,
): number {
  switch (groupType) {
    case 'solo':
      return 1;
    case 'couple':
      return 2;
    case 'family':
      return 4;
    case 'friends':
      return 4;
    default:
      return 2; // Default to couple
  }
}

/**
 * Gets the nearest upcoming weekend dates
 * @returns Object with startDate and endDate for the next weekend
 */
export function getNextWeekend(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Days until Saturday (6)
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return {
    startDate: saturday.toISOString().split('T')[0] || '',
    endDate: sunday.toISOString().split('T')[0] || '',
  };
}

/**
 * Calculates free cancellation deadline
 * Default: 24 hours before experience start date
 * @param experienceDate - The date of the experience
 * @returns Formatted cancellation deadline string
 */
export function getCancellationDeadline(experienceDate?: string): string {
  if (!experienceDate) {
    // Default to 30 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const expDate = new Date(experienceDate);
  const deadline = new Date(expDate);
  deadline.setHours(expDate.getHours() - 24); // 24 hours before

  return deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats price breakdown for transparency
 * @param subtotal - Subtotal amount
 * @param serviceFee - Service fee amount
 * @param total - Total amount
 * @returns Formatted breakdown object
 */
export function getPriceBreakdown(
  subtotal: number,
  serviceFee: number,
  total: number,
) {
  return {
    subtotal,
    serviceFee,
    total,
    formatted: {
      subtotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(subtotal),
      serviceFee: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(serviceFee),
      total: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total),
    },
  };
}
