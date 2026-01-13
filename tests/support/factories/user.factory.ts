import { faker } from '@faker-js/faker';

export type User = {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'traveler' | 'vendor' | 'admin';
  createdAt: Date;
  preferences?: {
    currency: string;
    language: string;
  };
};

export const createUser = (overrides: Partial<User> = {}): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    name: `${firstName} ${lastName}`,
    password: 'Password123!',
    role: 'traveler',
    createdAt: new Date(),
    preferences: {
      currency: 'USD',
      language: 'en',
    },
    ...overrides,
  };
};
