import { Page } from '@playwright/test';
import { test, expect } from '../support/fixtures';

test.describe('Pulau - Basic Flows', () => {
  test('should load the home screen', async ({ page }: { page: Page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Verify navigation bar or logo is present
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page).toHaveTitle(/Pulau/i);
  });

  test('should navigate to onboarding', async ({ page }: { page: Page }) => {
    await page.goto('/');

    const onboardingButton = page.getByRole('button', {
      name: /start|get started|plan/i,
    });
    if (await onboardingButton.isVisible()) {
      await onboardingButton.click();
      await expect(
        page.getByText('Your Travel Style', { exact: false }),
      ).toBeVisible();
    }
  });

  test('should demonstrate user factory pattern', async ({
    userFactory,
  }: {
    userFactory: any;
  }) => {
    // This test doesn't use the page, just shows the factory works
    const user = await userFactory.createUser({ name: 'Murat Test' });
    expect(user.name).toBe('Murat Test');
    expect(user.email).toContain('@example.com');
  });
});
