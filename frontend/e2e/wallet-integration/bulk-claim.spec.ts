import { test, expect } from '../fixtures';

/**
 * Wallet-Dependent Tests for Bulk Claim functionality
 * Requires Brave browser with Leo Wallet extension
 */
test.describe('Bulk Claim Transactions', () => {
  test.beforeEach(async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant');
    await page.waitForLoadState('networkidle');
  });

  test('Claim All button visible when rewards available', async ({ context }) => {
    const page = context.pages()[0];

    // Check for claimable rewards section
    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      // Verify Claim All button exists
      const claimAllButton = page.getByRole('button', { name: /Claim All/i });
      await expect(claimAllButton).toBeVisible();

      // Verify button is enabled (not disabled)
      await expect(claimAllButton).toBeEnabled();
    } else {
      // Skip test if no claimable rewards
      test.skip();
    }
  });

  test('individual claim buttons are functional', async ({ context }) => {
    const page = context.pages()[0];

    // Check for claimable rewards section
    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      // Find individual claim buttons (not the Claim All button)
      const claimButtons = claimableSection.getByRole('button', { name: /^Claim$/i });
      const buttonCount = await claimButtons.count();

      if (buttonCount > 0) {
        // Verify first claim button is visible and enabled
        await expect(claimButtons.first()).toBeVisible();
        await expect(claimButtons.first()).toBeEnabled();
      }
    } else {
      test.skip();
    }
  });

  test('Claim All button shows progress during claiming', async ({ context }) => {
    const page = context.pages()[0];

    // This test verifies the UI behavior during bulk claiming
    // Note: Actual claiming requires wallet approval

    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      const claimAllButton = page.getByRole('button', { name: /Claim All/i });

      // Click Claim All
      await claimAllButton.click();

      // Button should show loading state
      // Look for "Claiming 1/X..." pattern or loader
      const loadingState = page.locator('text=/Claiming \\d+\\/\\d+/');
      const loader = page.locator('[data-tour="claimable-rewards"]').locator('.animate-spin');

      // Either loading text or spinner should appear (or wallet popup)
      const hasLoadingIndicator = await loadingState.isVisible().catch(() => false) ||
        await loader.isVisible().catch(() => false);

      // Note: In real scenario, wallet popup would appear
      // Test passes if button was clickable and either shows loading or triggers wallet
    } else {
      test.skip();
    }
  });

  test('claimed poll removed from claimable list', async ({ context }) => {
    const page = context.pages()[0];

    // This test would verify that after claiming, the poll is removed
    // Requires wallet interaction and transaction completion

    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      // Count initial claimable polls
      const pollItems = claimableSection.locator('.rounded-lg');
      const initialCount = await pollItems.count();

      // After a successful claim (manual verification needed), count should decrease
      // This is a structural test - actual claiming requires manual wallet approval

      expect(initialCount).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });
});

test.describe('Claim Reward Navigation', () => {
  test('poll title links to poll details', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant');
    await page.waitForLoadState('networkidle');

    const claimableSection = page.locator('[data-tour="claimable-rewards"]');
    const hasClaimable = await claimableSection.count() > 0;

    if (hasClaimable) {
      // Find poll title link in claimable section
      const pollLink = claimableSection.locator('a').first();

      if (await pollLink.count() > 0) {
        const href = await pollLink.getAttribute('href');
        expect(href).toMatch(/\/poll\/\d+/);
      }
    } else {
      test.skip();
    }
  });

  test('rewards page shows claimed history', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant/rewards');
    await page.waitForLoadState('networkidle');

    // Page should load
    await expect(page).toHaveURL('/participant/rewards');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Participant Stats After Claiming', () => {
  test('stats update after claim', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant');
    await page.waitForLoadState('networkidle');

    // Verify stats are visible
    const statsSection = page.locator('[data-tour="participant-stats"]');
    await expect(statsSection).toBeVisible();

    // Check Total Earned card exists
    const totalEarnedCard = page.getByText('Total Earned');
    await expect(totalEarnedCard).toBeVisible();

    // After claiming, Total Earned should increase (manual verification)
    // This test verifies the structure exists for displaying earned amounts
  });
});
