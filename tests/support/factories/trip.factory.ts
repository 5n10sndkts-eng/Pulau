import { faker } from '@faker-js/faker';
import { createExperience, Experience } from './experience.factory';

export type TripItem = {
  id: string;
  experience: Experience;
  date?: string; // ISO date string
  startTime?: string; // HH:mm
  guests: number;
};

export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  items: TripItem[];
  userId: string;
  status: 'draft' | 'booked' | 'completed';
};

export const createTripItem = (overrides: Partial<TripItem> = {}): TripItem => {
  return {
    id: faker.string.uuid(),
    experience: createExperience(),
    guests: faker.number.int({ min: 1, max: 4 }),
    ...overrides,
  };
};

export const createTrip = (overrides: Partial<Trip> = {}): Trip => {
  const startDate = faker.date.future();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  return {
    id: faker.string.uuid(),
    name: `${faker.location.city()} Adventure`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    items: [],
    userId: faker.string.uuid(),
    status: 'draft',
    ...overrides,
  };
};
