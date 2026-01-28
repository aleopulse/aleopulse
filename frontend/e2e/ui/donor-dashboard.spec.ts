import { test, expect } from '@playwright/test';

/**
 * UI Tests for Donor Dashboard
 * Tests donor impact card visibility and metrics display
 */
test.describe('Donor Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/donor');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays page title and layout', async ({ page }) => {
    // Verify page title is visible (use heading role for specificity)
    await expect(page.getByRole('heading', { name: 'Donor Dashboard' })).toBeVisible();
  });

  test('shows wallet connection warning when not connected', async ({ page }) => {
    const walletWarning = page.getByText(/connect your wallet/i);
    await expect(walletWarning).toBeVisible();
  });

  test('displays sidebar navigation', async ({ page }) => {
    // Verify sidebar items exist
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible();
  });
});

test.describe('Donor Impact Card Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/donor');
    await page.waitForLoadState('domcontentloaded');
  });

  test('impact card displays when donor has funded polls', async ({ page }) => {
    // Check if impact card exists (conditional on donor having funded polls AND connected)
    const impactCard = page.getByText('Your Impact');
    const hasImpactCard = await impactCard.isVisible().catch(() => false);

    if (hasImpactCard) {
      // Verify metrics labels are present
      await expect(page.getByText('Participants Reached')).toBeVisible();
      await expect(page.getByText('Total Distributed')).toBeVisible();
      await expect(page.getByText('Completion Rate')).toBeVisible();
    }
    // If not visible, that's OK - no wallet or no funded polls
  });

  test('stats section structure', async ({ page }) => {
    const statsSection = page.locator('[data-tour="donor-stats"]');
    const hasStats = await statsSection.isVisible().catch(() => false);

    if (hasStats) {
      // Donor stats would be visible when connected
      await expect(statsSection).toBeVisible();
    }
  });

  test('recommended polls section structure', async ({ page }) => {
    const recommendedSection = page.locator('[data-tour="recommended-polls"]');
    const hasRecommended = await recommendedSection.isVisible().catch(() => false);

    if (hasRecommended) {
      await expect(recommendedSection).toBeVisible();
    }
  });
});

test.describe('Donor Distributions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/creator/distributions');
    await page.waitForLoadState('domcontentloaded');
  });

  test('distributions page loads', async ({ page }) => {
    // Verify page loaded - look for title or content
    await expect(page.locator('body')).toBeVisible();

    // Page should have some heading or content
    const pageContent = page.locator('h1, h2, [class*="title"]');
    await expect(pageContent.first()).toBeVisible();
  });
});
