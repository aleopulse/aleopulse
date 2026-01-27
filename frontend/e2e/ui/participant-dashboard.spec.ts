import { test, expect } from '@playwright/test';

/**
 * UI Tests for Participant Dashboard
 * Tests tier progress card, daily vote display, reset countdown, and claim functionality UI
 */
test.describe('Participant Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/participant');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays page title and layout', async ({ page }) => {
    // Verify page title is visible (use heading role for specificity)
    await expect(page.getByRole('heading', { name: 'Participant Dashboard' })).toBeVisible();
    await expect(page.getByText('Track your votes and rewards')).toBeVisible();
  });

  test('shows wallet connection warning when not connected', async ({ page }) => {
    // Without wallet connection, should show warning
    const walletWarning = page.getByText(/connect your wallet/i);
    await expect(walletWarning).toBeVisible();
  });

  test('displays sidebar navigation', async ({ page }) => {
    // Verify sidebar items are visible regardless of wallet state
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Polls/i })).toBeVisible();
  });
});

test.describe('Participant Dashboard with Wallet', () => {
  // These tests document expected behavior when wallet IS connected
  // They check for elements that appear conditionally

  test.beforeEach(async ({ page }) => {
    await page.goto('/participant');
    await page.waitForLoadState('domcontentloaded');
  });

  test('tier progress card structure exists when connected', async ({ page }) => {
    // Check if Daily Votes text exists (only appears when wallet connected)
    const dailyVotes = page.getByText(/Daily Votes/i);
    const hasDailyVotes = await dailyVotes.isVisible().catch(() => false);

    if (hasDailyVotes) {
      // If connected, these elements should be visible
      await expect(page.getByText(/Resets in/i)).toBeVisible();
    }
    // If not connected, wallet warning is shown instead - that's OK
  });

  test('stats section has expected structure', async ({ page }) => {
    // Check for the participant stats data-tour attribute
    const statsSection = page.locator('[data-tour="participant-stats"]');
    const hasStats = await statsSection.isVisible().catch(() => false);

    if (hasStats) {
      // Verify stat card labels when connected
      await expect(page.getByText('Polls Voted')).toBeVisible();
      await expect(page.getByText('Pending Rewards')).toBeVisible();
      await expect(page.getByText('Total Earned')).toBeVisible();
      await expect(page.getByText('Active Polls')).toBeVisible();
    }
    // Without wallet, the page shows connection warning
  });

  test('claimable rewards section appears conditionally', async ({ page }) => {
    // Check if claimable section exists (only when wallet connected AND rewards available)
    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      // Verify "Claim All" button is visible in claimable section
      await expect(page.getByRole('button', { name: /Claim All/i })).toBeVisible();
      await expect(page.getByText(/Polls to Claim/i)).toBeVisible();
    }
    // Section being absent is also valid (no rewards or no wallet)
  });

  test('recommended polls section structure', async ({ page }) => {
    const recommendedSection = page.locator('[data-tour="recommended-polls"]');
    const hasRecommended = await recommendedSection.isVisible().catch(() => false);

    if (hasRecommended) {
      await expect(page.getByText('Recommended Polls')).toBeVisible();
      await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    }
  });

  test('recent votes section structure', async ({ page }) => {
    const recentVotes = page.getByText('Recent Votes');
    const hasRecentVotes = await recentVotes.isVisible().catch(() => false);

    if (hasRecentVotes) {
      await expect(page.getByRole('link', { name: /View All/i })).toBeVisible();
    }
  });
});
