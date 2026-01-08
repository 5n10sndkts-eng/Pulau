import { test as base, expect, mergeTests } from '@playwright/test';
import { test as authFixture } from './auth.fixture';
import { createTrip, Trip } from '../factories/trip.factory';

type TripFixture = {
  trip: {
    seed: (overrides?: Partial<Trip>) => Promise<Trip>;
    verifyExists: (tripId: string) => Promise<void>;
  };
};

export const test = mergeTests(base, authFixture).extend<TripFixture>({
  trip: async ({ spark }, use) => {
    const tripHelper = {
      seed: async (overrides: Partial<Trip> = {}) => {
        const trip = createTrip(overrides);
        await spark.seedKey(`trip_${trip.id}`, trip);
        return trip;
      },
      verifyExists: async (tripId: string) => {
        const storedTrip = await spark.getKey(`trip_${tripId}`);
        expect(storedTrip).toBeTruthy();
        expect(storedTrip.id).toBe(tripId);
      }
    };
    await use(tripHelper);
  },
});

export { expect } from '@playwright/test';
