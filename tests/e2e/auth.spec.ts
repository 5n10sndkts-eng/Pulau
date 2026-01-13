import { test, expect } from '../support/fixtures/auth.fixture';

test.describe('Epic 2: Authentication & Profile', () => {
  test('should register a new customer successfully @p0 @auth', async ({
    page,
  }) => {
    await page.goto('/register');

    // Reverted to 'Full Name' matching src/components/auth/RegisterScreen.tsx
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    // RegisterScreen.tsx has "Confirm Password"
    await page.getByLabel('Confirm Password').fill('SecurePass123!');

    await page.getByRole('button', { name: /create account/i }).click();

    // RegisterScreen.tsx navigates to '/profile' on success
    await expect(page).toHaveURL(/.*\/profile/);
    // Profile usually shows the user's name or a greeting
    // Checking for "Test User" as that's the name we registered with
    await expect(
      page.getByRole('heading', { name: 'Test User' }),
    ).toBeVisible();
  });

  test('should persist login session across reloads @p0 @auth', async ({
    page,
    auth,
  }) => {
    const user = await auth.loginAs({ name: 'Persisted User' });
    await page.goto('/profile');
    // Profile screen shows the user's name
    await expect(
      page.getByRole('heading', { name: 'Persisted User' }),
    ).toBeVisible();

    // We can't check for input value email because ProfileScreen doesn't show email in an input
    // It shows it in "Member since..." or possibly not at all directly visible without clicking "Edit Profile"
    // Let's verify we are still on the profile page and the name is still visible
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Persisted User' }),
    ).toBeVisible();
  });

  test('should logout successfully @p1 @auth', async ({ page, auth }) => {
    await auth.loginAs();
    await page.goto('/profile');
    // Logout is a Card with text "Log Out", not a button role
    await page.getByText('Log Out').click();
    await expect(page).toHaveURL(/login|home/);
  });
});
