import { test as base } from '@playwright/test';

type SparkFixture = {
  spark: {
    reset: () => Promise<void>;
    seedKey: (key: string, value: any) => Promise<void>;
    getKey: (key: string) => Promise<any>;
  };
};

export const test = base.extend<SparkFixture>({
  spark: async ({ page }, use) => {
    const spark = {
      reset: async () => {
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
      },
      seedKey: async (key: string, value: any) => {
        // Ensure we are on the app domain before accessing localStorage
        if (page.url() === 'about:blank') {
          await page.goto('/');
        }
        await page.evaluate(({ k, v }) => {
          localStorage.setItem(k, JSON.stringify(v));
        }, { k: key, v: value });
      },
      getKey: async (key: string) => {
        return await page.evaluate((k) => {
          const val = localStorage.getItem(k);
          return val ? JSON.parse(val) : null;
        }, key);
      }
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(spark);
  },
});
