
import { test, expect } from '@playwright/test';

test.describe('Offline Ticket Access (PWA)', () => {

    test.skip('should cache ticket and working offline', async ({ page, context }) => {
        // 1. Online: Visit Ticket Page
        await page.goto('/bookings/book-123/ticket');
        await expect(page.getByText('Sunset Snorkeling')).toBeVisible();
        await expect(page.getByAltText('Ticket QR Code')).toBeVisible();

        // 2. Go Offline
        await context.setOffline(true);

        // 3. Reload Page
        await page.reload();

        // 4. Verify Content still visible
        await expect(page.getByText('Sunset Snorkeling')).toBeVisible();
        await expect(page.getByAltText('Ticket QR Code')).toBeVisible();

        // 5. Verify Offline Indicator
        await expect(page.getByText('Offline Mode')).toBeVisible();
    });

});

