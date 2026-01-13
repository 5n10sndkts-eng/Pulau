import { test as base } from '@playwright/test';
import { UserFactory } from './factories/user-factory';

type TestFixtures = {
  userFactory: UserFactory;
};

export const test = base.extend<TestFixtures>({
  userFactory: async ({}, use) => {
    const factory = new UserFactory();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(factory);
    await factory.cleanup(); // Auto-cleanup after each test
  },
});

export { expect } from '@playwright/test';
