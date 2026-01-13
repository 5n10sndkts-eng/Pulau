import { test as base, expect, mergeTests } from '@playwright/test';
import { test as tripFixture } from './trip.fixture';
import { createTrip, Trip } from '../factories/trip.factory';

type CheckoutFixture = {
  checkout: {
    startWithTrip: (overrides?: Partial<Trip>) => Promise<Trip>;
    completePayment: () => Promise<void>;
  };
};

export const test = mergeTests(base, tripFixture).extend<CheckoutFixture>({
  checkout: async ({ page, trip: tripHelper }, use) => {
    const checkout = {
      startWithTrip: async (overrides: Partial<Trip> = {}) => {
        const trip = await tripHelper.seed({ status: 'draft', ...overrides });
        await page.goto(`/checkout/${trip.id}`);
        return trip;
      },
      completePayment: async () => {
        await page.route('**/api/payment/process', (route) => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true }),
          });
        });
      },
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(checkout);
  },
});

export { expect } from '@playwright/test';
