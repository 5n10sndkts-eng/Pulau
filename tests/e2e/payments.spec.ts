
import { test, expect } from '@playwright/test';

test.describe('Payment & Atomic Booking Flow', () => {

    test.skip('should complete a full booking flow', async ({ page }) => {
        // 1. Visit Experience Page
        await page.goto('/experience/exp-123'); // Assumption: configured test data
        await expect(page.getByText('Sunset Snorkeling')).toBeVisible();

        // 2. Select Date and Guests
        await page.getByRole('button', { name: /Select Date/i }).click();
        await page.getByText('15').click(); // Select a date
        await page.getByLabel('Guests').fill('2');

        // 3. Initiate Checkout
        await page.getByRole('button', { name: /Book Now/i }).click();

        // 4. Verify Checkout Page
        await expect(page).toHaveURL(/.*\/checkout/);
        await expect(page.getByText('Total')).toBeVisible();

        // 5. Simulate Stripe Payment (using test mode)
        // In strict E2E this might mock the Stripe redirect or use Stripe Test Cards
        await page.getByRole('button', { name: /Pay/i }).click();

        // 6. Verify Confirmation
        await expect(page).toHaveURL(/.*\/confirmation/);
        await expect(page.getByText('Booking Confirmed')).toBeVisible();
        await expect(page.getByText('PL-')).toBeVisible(); // Booking reference
    });

    test.skip('should handle concurrent booking attempts', async () => {
        // This is a more advanced test usually run with separate contexts
        // Placeholder to indicate requirement
    });

});

