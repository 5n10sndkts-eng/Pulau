import { test, expect } from '../support/fixtures/auth.fixture';

/**
 * PWA Offline Tests for Epic 26
 * 
 * NOTE: Service Worker only registers in production builds (import.meta.env.PROD).
 * These tests verify the offline UI components (OfflineBanner, network detection)
 * WITHOUT relying on actual Service Worker caching.
 * 
 * For full PWA caching verification, run manual tests against a production build.
 */
test.describe('PWA Offline Functionality [Epic 26]', () => {
  const userId = 'user-pwa-test';
  const bookingId = 'booking-pwa-offline-test';
  const experienceId = 'exp_001'; // Using actual mock data experience
  
  const mockBooking = {
    id: bookingId,
    tripId: 'trip-123',
    reference: 'PUL-2026-TEST',
    status: 'confirmed',
    bookedAt: '2026-01-10T10:00:00Z',
    trip: {
      id: 'trip-123',
      userId: userId,
      destination: 'bali',
      startDate: '2026-01-20',
      endDate: '2026-01-22',
      travelers: 2,
      status: 'booked' as const,
      items: [
        {
          experienceId: experienceId,
          date: '2026-01-20',
          time: '05:00:00',
          guests: 2,
          totalPrice: 130, // 2 guests × $65
          notes: 'First time snorkeling',
        },
      ],
      subtotal: 130,
      serviceFee: 6.5,
      total: 136.5,
      bookingReference: 'PUL-2026-TEST',
      bookedAt: '2026-01-10T10:00:00Z',
    },
  };

  test.beforeEach(async ({ page, auth, spark }) => {
    // Authenticate user with onboarding completed
    await auth.loginAs({ 
      id: userId, 
      name: 'PWA Test User', 
      email: 'test@pulau.app',
      hasCompletedOnboarding: true 
    });
    
    // Seed bookings array for getUserBookings() mock mode lookup
    await spark.seedKey('pulau_bookings', [mockBooking]);

    // Visit ticket page
    await page.goto(`/ticket/${bookingId}`);

    // Wait for ticket to load
    await expect(page.getByText(/Sunrise Snorkeling/)).toBeVisible({
      timeout: 15000,
    });
  });

  test('AC-26.6-1: should display ticket details from localStorage when loaded', async ({
    page,
  }) => {
    // Verify ticket data loaded from mock localStorage is displayed correctly
    // This tests that the TicketPageRoute can render from seeded data
    await expect(page.getByText(/Sunrise Snorkeling/)).toBeVisible();
    // Date is displayed as "Tuesday, January 20, 2026" format
    await expect(page.getByText(/January 20, 2026/)).toBeVisible();
    // Time is displayed from the booking
    await expect(page.getByText(/5:00 AM/)).toBeVisible();
    await expect(page.getByText(/PUL-2026-TEST/i)).toBeVisible();
  });

  test('AC-26.6-2: should display offline indicator when network goes down', async ({
    page,
    context,
  }) => {
    // Simulate network going offline (browser fires 'offline' event)
    await context.setOffline(true);
    
    // Trigger the browser's offline event via JavaScript
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Verify OfflineBanner component text is visible
    await expect(
      page.getByText('Offline Mode - Showing cached ticket data')
    ).toBeVisible({ timeout: 5000 });
  });

  test('AC-26.6-3: should remove offline indicator when network restores', async ({
    page,
    context,
  }) => {
    // Start in Offline Mode
    await context.setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    // Verify OfflineBanner appears
    await expect(
      page.getByText('Offline Mode - Showing cached ticket data')
    ).toBeVisible({ timeout: 5000 });

    // Restore Network
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // Verify Offline Indicator disappears automatically
    await expect(
      page.getByText('Offline Mode - Showing cached ticket data')
    ).toBeHidden({ timeout: 10000 });
  });
});
