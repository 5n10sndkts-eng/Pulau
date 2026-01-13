import { faker } from '@faker-js/faker';

export type Experience = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  duration: number; // in minutes
  vendorId: string;
  availableDates: string[]; // ISO date strings
};

export const createExperience = (
  overrides: Partial<Experience> = {},
): Experience => {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    currency: 'USD',
    location: faker.location.city(),
    category: faker.helpers.arrayElement([
      'Adventure',
      'Culture',
      'Food',
      'Nature',
      'Wellness',
    ]),
    rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 }),
    images: [faker.image.urlLoremFlickr({ category: 'nature' })],
    duration: faker.helpers.arrayElement([60, 120, 240, 480]),
    vendorId: faker.string.uuid(),
    availableDates: [
      faker.date.future().toISOString(),
      faker.date.future().toISOString(),
    ],
    ...overrides,
  };
};
