import { test as base, expect, mergeTests } from '@playwright/test';
import { test as sparkFixture } from './spark.fixture';
import { createUser, User } from '../factories/user.factory';

type AuthFixture = {
  auth: {
    loginAs: (overrides?: Partial<User>) => Promise<User>;
    logout: () => Promise<void>;
  };
};

export const test = mergeTests(base, sparkFixture).extend<AuthFixture>({
  auth: async ({ page, spark }, use) => {
    const auth = {
      loginAs: async (overrides: Partial<User> = {}) => {
        const user = createUser(overrides);
        // AuthProvider uses 'pulau_user' key, not 'currentUser'
        await spark.seedKey('pulau_user', user);
        await page.reload();
        return user;
      },
      logout: async () => {
        await page.evaluate(() => localStorage.removeItem('pulau_user'));
        await page.reload();
      },
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(auth);
  },
});

export { expect } from '@playwright/test';
