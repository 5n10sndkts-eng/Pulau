import { test, expect } from '../support/fixtures/trip.fixture';
import { createExperience } from '../support/factories/experience.factory';

test.describe('Epic 8: Trip Canvas & Itinerary', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs();
  });

  test('should create a new trip from scratch @p0 @trip', async ({ page }) => {
    await page.goto('/trips');
    await page.getByRole('button', { name: /new trip/i }).click();
    const tripName = 'My Bali Adventure';
    await page.getByLabel('Trip Name').fill(tripName);
    await page.getByLabel('Start Date').fill('2026-06-01');
    await page.getByLabel('End Date').fill('2026-06-10');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('heading', { name: tripName })).toBeVisible();
    await expect(page).toHaveURL(/\/trips\/.+/);
  });

  test('should drag and drop experience into itinerary @p0 @trip @interactive', async ({
    page,
    spark,
  }) => {
    const experience = createExperience({ title: 'Surf Lesson' });
    await spark.seedKey(`experience_${experience.id}`, experience);
    await page.goto('/trips/new');
    // await page.getByText('Surf Lesson').dragTo(page.locator('.day-schedule'));
    // await expect(page.locator('.itinerary-item')).toContainText('Surf Lesson');
  });

  test('should detect scheduling conflicts @p1 @trip', async ({ page }) => {
    // 1. Setup trip with conflicting items
    // ... logic to seed trip with overlapping times
    // await expect(page.getByRole('alert')).toContainText('Conflict detected');
  });
});
