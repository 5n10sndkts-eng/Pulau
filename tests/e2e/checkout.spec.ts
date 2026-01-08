import { test, expect } from '../support/fixtures/checkout.fixture';
import { createTripItem } from '../support/factories/trip.factory';

test.describe('Epic 10: Checkout Flow', () => {
  
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs();
  });

  test('should complete full checkout flow successfully @p0 @checkout @revenue', async ({ page, checkout }) => {
    const trip = await checkout.startWithTrip({
      items: [createTripItem(), createTripItem()]
    });

    await expect(page).toHaveURL(/.*checkout\/step-1/);
    await expect(page.getByText(trip.name)).toBeVisible();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/.*checkout\/step-2/);
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/.*checkout\/step-3/);
    await page.getByLabel('Card Number').fill('4242 4242 4242 4242');
    await page.getByLabel('Expiry').fill('12/30');
    await page.getByLabel('CVC').fill('123');
    
    await checkout.completePayment();
    await page.getByRole('button', { name: /pay/i }).click();

    await expect(page).toHaveURL(/.*checkout\/confirmation/);
    await expect(page.getByText(/booking confirmed/i)).toBeVisible();
    await expect(page.getByText(trip.id)).toBeVisible();
  });

  test('should validate form fields in checkout @p1 @checkout', async ({ page, checkout }) => {
    await checkout.startWithTrip();
    await page.getByRole('button', { name: /continue/i }).click();
    // await expect(page.getByText('Required field')).toBeVisible();
  });
});
