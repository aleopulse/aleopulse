import { test, expect } from './fixtures';

test.describe('Navigation', () => {
  test('should load the home page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/');

    // Check that the page loaded
    await expect(page).toHaveURL('/');

    // Look for main content (adjust based on your actual home page)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to dashboard', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate to questionnaires', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/questionnaires');

    await expect(page).toHaveURL('/questionnaires');
  });

  test('should navigate to wallet page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/wallet');

    await expect(page).toHaveURL('/wallet');
  });

  test('should navigate to staking page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/staking');

    await expect(page).toHaveURL('/staking');
  });

  test('should navigate to swap page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/swap');

    await expect(page).toHaveURL('/swap');
  });

  test('should navigate to leaderboard', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/leaderboard');

    await expect(page).toHaveURL('/leaderboard');
  });

  test('should show 404 for unknown routes', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/unknown-page-xyz');

    // Check for 404 content (adjust based on your NotFound component)
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });
});
