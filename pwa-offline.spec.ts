import { test, expect } from '@playwright/test';

test.describe('PWA Offline Functionality [Epic 26]', () => {
  const bookingId = 'b1-offline-test';
  const ticketUrl = `/tickets/${bookingId}`;

  test.beforeEach(async ({ page }) => {
    // Mock the booking data API call to ensure consistent data for caching
    // This matches the structure expected by the TicketPage component
    await page.route(`**/rest/v1/bookings?id=eq.${bookingId}*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: bookingId,
          status: 'confirmed',
          experience_title: 'Offline Island Tour',
          booking_date: '2026-01-20',
          guest_count: 2,
          meeting_point: 'Main Harbor',
          start_time: '09:00:00',
          ticket_qr_code: `pulau://booking/${bookingId}`,
          profiles: {
             first_name: 'Test',
             last_name: 'User'
          }
        }),
      });
    });

    // 1. Visit the page ONLINE first to allow Service Worker to install and cache
    await page.goto(ticketUrl);
    
    // Wait for data to render
    await expect(page.getByText('Offline Island Tour')).toBeVisible();

    // Wait a moment for the Service Worker to complete caching (heuristic)
    // In a real environment, we might check navigator.serviceWorker.controller
    await page.waitForTimeout(2000); 
  });

  test('AC-26.6-1: should load ticket details from cache when offline', async ({ page, context }) => {
    // 2. Simulate Network Failure
    await context.setOffline(true);

    // 3. Reload page to force load from Service Worker cache
    await page.reload();

    // 4. Verify critical ticket information is still visible
    await expect(page.getByText('Offline Island Tour')).toBeVisible();
    await expect(page.getByText('Main Harbor')).toBeVisible();
    await expect(page.getByText('09:00:00')).toBeVisible();
  });

  test('AC-26.6-2: should display offline indicator and disable actions', async ({ page, context }) => {
    // Simulate Offline Mode
    await context.setOffline(true);
    
    // Trigger offline state detection (might need an event or reload depending on implementation)
    // Reloading ensures we test the "start offline" case as well
    await page.reload();

    // Verify "Offline Mode" indicator is visible
    await expect(page.getByText(/offline mode/i)).toBeVisible();

    // Verify interactive elements that require network are disabled or hidden
    // Assuming there is a "Cancel Booking" or similar action
    const actionButton = page.getByRole('button', { name: /cancel/i });
    if (await actionButton.isVisible()) {
      await expect(actionButton).toBeDisabled();
    }
  });

  test('AC-26.6-3: should sync and remove indicator when network restores', async ({ page, context }) => {
    // Start in Offline Mode
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText(/offline mode/i)).toBeVisible();

    // Restore Network
    await context.setOffline(false);

    // Verify Offline Indicator disappears automatically (Network Restoration Sync)
    await expect(page.getByText(/offline mode/i)).toBeHidden({ timeout: 10000 });
  });
});