import { test, expect } from '@playwright/test';

test.describe('Vendor Operations - Check-in Flow', () => {
  // Grant camera permissions to prevent browser blocking the QR scanner
  test.use({
    permissions: ['camera'],
  });

  const bookingId = 'b1-123-456';
  const bookingData = {
    id: bookingId,
    experience_id: 'exp-1',
    user_id: 'u-1',
    status: 'confirmed',
    guest_count: 2,
    total_price: 150,
    booking_date: new Date().toISOString().split('T')[0], // Today
    customer_name: 'Alice Traveler',
    experience_title: 'Island Hopping Adventure',
    profiles: {
      first_name: 'Alice',
      last_name: 'Traveler',
      email: 'alice@example.com',
    },
  };

  test.beforeEach(async ({ page }) => {
    // Mock Today's Bookings Query
    await page.route('**/rest/v1/bookings*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([bookingData]),
        });
      } else {
        await route.continue();
      }
    });

    // Mock RPC: validate_booking_for_checkin
    await page.route(
      '**/rest/v1/rpc/validate_booking_for_checkin',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            booking: bookingData,
          }),
        });
      },
    );

    // Mock Booking Update (Check-in/No-show)
    await page.route(
      `**/rest/v1/bookings?id=eq.${bookingId}`,
      async (route) => {
        if (route.request().method() === 'PATCH') {
          await route.fulfill({ status: 204 });
        } else {
          await route.continue();
        }
      },
    );

    // Mock Audit Log creation
    await page.route('**/rest/v1/audit_logs', async (route) => {
      await route.fulfill({ status: 201 });
    });

    // Navigate to Vendor Operations Page
    // Adjust URL based on actual routing configuration
    await page.goto('/vendor/operations');
  });

  test("should display today's bookings", async ({ page }) => {
    await expect(page.getByText('Island Hopping Adventure')).toBeVisible();
    await expect(page.getByText('Alice Traveler')).toBeVisible();
    await expect(page.getByText('Confirmed')).toBeVisible();
  });

  test('should process check-in via manual entry', async ({ page }) => {
    // 1. Open Scanner
    await page.getByRole('button', { name: /scan ticket/i }).click();
    await expect(page.getByText('Scan Ticket QR Code')).toBeVisible();

    // 2. Handle Prompt for Manual Entry
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Enter booking ID');
      await dialog.accept(bookingId);
    });

    // 3. Trigger Manual Entry
    await page
      .getByRole('button', { name: /enter booking id manually/i })
      .click();

    // 4. Verify Success
    // Assuming UI shows a success message or updates status
    await expect(page.getByText('Checked In')).toBeVisible();
  });

  test('should mark a booking as no-show', async ({ page }) => {
    // Find the booking card
    const bookingCard = page
      .locator('div')
      .filter({ hasText: 'Alice Traveler' })
      .first();

    // Click No-Show (assuming it's a visible button or in an actions menu)
    await bookingCard.getByRole('button', { name: /no-show/i }).click();

    // Verify Status Update
    await expect(page.getByText('No-Show')).toBeVisible();
  });
});
