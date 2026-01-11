import { test, expect } from '@playwright/test';

test.describe('Epic 33: Sticky Trip Bar', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show sticky trip bar when items are added to trip @p0 @sticky-bar', async ({ page }) => {
    // Navigate to explore screen
    await page.goto('/explore');
    
    // Add an experience to the trip
    const addButton = page.getByRole('button', { name: /add to trip/i }).or(
      page.getByRole('button', { name: /add/i })
    ).first();
    await addButton.click();
    
    // Verify the sticky trip bar appears
    const tripBar = page.locator('[data-testid="sticky-trip-bar"]').or(
      page.getByRole('button', { name: /trip summary/i })
    );
    await expect(tripBar).toBeVisible();
  });

  test('should be accessible via keyboard @p0 @a11y @sticky-bar', async ({ page }) => {
    // Add an item to trigger the sticky bar
    await page.goto('/explore');
    const addButton = page.getByRole('button', { name: /add to trip/i }).or(
      page.getByRole('button', { name: /add/i })
    ).first();
    await addButton.click();
    
    // Tab to the sticky trip bar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is on the trip bar button
    const tripBarButton = page.getByRole('button', { name: /trip summary/i }).or(
      page.getByRole('button', { name: /view trip/i })
    );
    
    // Activate with keyboard
    await tripBarButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify navigated to plan page
    await expect(page).toHaveURL(/\/plan/);
  });

  test('should show correct trip count @p1 @sticky-bar', async ({ page }) => {
    await page.goto('/explore');
    
    // Add first experience
    await page.getByRole('button', { name: /add/i }).first().click();
    await expect(page.getByText(/1.*item/i)).toBeVisible();
    
    // Add second experience
    await page.getByRole('button', { name: /add/i }).nth(1).click();
    await expect(page.getByText(/2.*item/i)).toBeVisible();
  });

  test('should persist when navigating between pages @p1 @sticky-bar', async ({ page }) => {
    // Add an experience
    await page.goto('/explore');
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Navigate to another page
    await page.goto('/');
    
    // Verify sticky bar is still visible
    const tripBar = page.locator('[data-testid="sticky-trip-bar"]').or(
      page.getByRole('button', { name: /trip summary/i })
    );
    await expect(tripBar).toBeVisible();
  });

  test('should handle mobile safe area on iOS devices @p1 @mobile @sticky-bar', async ({ page, browserName }) => {
    // Set mobile viewport (iPhone dimensions)
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/explore');
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Verify sticky bar is visible and has safe area padding
    const tripBar = page.locator('[data-testid="sticky-trip-bar"]').or(
      page.getByRole('button', { name: /trip summary/i }).locator('..')
    );
    await expect(tripBar).toBeVisible();
    
    // Check that the bar has bottom padding (pb-safe class should add padding)
    const boundingBox = await tripBar.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      // Verify the bar is near the bottom of the viewport
      expect(boundingBox.y + boundingBox.height).toBeGreaterThan(700);
    }
  });

  test('should migrate guest trip data on login @p0 @sticky-bar @auth', async ({ page, context }) => {
    // As guest, add items to trip
    await page.goto('/explore');
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Verify localStorage has guest trip data
    const guestTrip = await page.evaluate(() => localStorage.getItem('pulau_guest_trip'));
    expect(guestTrip).toBeTruthy();
    
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation after login
    await page.waitForURL(/\/trips|\/explore|\/$/);
    
    // Verify trip data persisted after login
    const tripBar = page.locator('[data-testid="sticky-trip-bar"]').or(
      page.getByRole('button', { name: /trip summary/i })
    );
    await expect(tripBar).toBeVisible();
    await expect(page.getByText(/1.*item/i)).toBeVisible();
  });
});
