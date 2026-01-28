import { test, expect } from '@playwright/test';

/**
 * UI Tests for Dashboard View Toggle
 * Tests toggle switch between Classic and Unified views and localStorage persistence
 */
test.describe('Dashboard View Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.removeItem('leopulse_dashboard_view'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays view toggle in header', async ({ page }) => {
    // Verify toggle switch is visible
    const toggle = page.getByRole('switch');
    await expect(toggle).toBeVisible();

    // Verify Classic/Unified label is present
    const viewLabel = page.locator('text=/Classic|Unified/');
    await expect(viewLabel.first()).toBeVisible();
  });

  test('defaults to Classic view', async ({ page }) => {
    // Verify Classic view label is shown
    await expect(page.getByText('Classic')).toBeVisible();

    // Verify role buttons are visible in Classic mode
    await expect(page.getByRole('button', { name: /Creator View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Participant View/i })).toBeVisible();

    // Verify switch is unchecked (Classic mode)
    const toggle = page.getByRole('switch');
    await expect(toggle).toHaveAttribute('data-state', 'unchecked');
  });

  test('switches to Unified view on toggle', async ({ page }) => {
    // Click the toggle switch
    const toggle = page.getByRole('switch');
    await toggle.click();

    // Verify Unified label appears
    await expect(page.getByText('Unified')).toBeVisible();

    // Verify switch state changed
    await expect(toggle).toHaveAttribute('data-state', 'checked');
  });

  test('unified view shows different layout', async ({ page }) => {
    // Switch to Unified view
    const toggle = page.getByRole('switch');
    await toggle.click();

    // Wait for unified view to render
    await page.waitForTimeout(500);

    // In unified view, role buttons should be hidden
    const creatorButton = page.getByRole('button', { name: /Creator View/i });
    const creatorVisible = await creatorButton.isVisible().catch(() => false);
    expect(creatorVisible).toBe(false);
  });

  test('preference persists across page reload', async ({ page }) => {
    // Switch to Unified view
    const toggle = page.getByRole('switch');
    await toggle.click();

    // Verify Unified is selected
    await expect(page.getByText('Unified')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify preference was preserved
    await expect(page.getByText('Unified')).toBeVisible();
    await expect(page.getByRole('switch')).toHaveAttribute('data-state', 'checked');

    // Verify localStorage value
    const storedValue = await page.evaluate(() => localStorage.getItem('leopulse_dashboard_view'));
    expect(storedValue).toBe('unified');
  });

  test('Classic view shows role toggle buttons', async ({ page }) => {
    // Ensure we're in Classic view (default)
    await expect(page.getByText('Classic')).toBeVisible();

    // Role toggle buttons should be visible in Classic mode
    await expect(page.getByRole('button', { name: /Creator View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Participant View/i })).toBeVisible();
  });

  test('role buttons hidden in Unified view', async ({ page }) => {
    // Switch to Unified view
    await page.getByRole('switch').click();
    await page.waitForTimeout(500);

    // Role toggle buttons should be hidden in Unified mode
    const creatorButton = page.getByRole('button', { name: /Creator View/i });
    const participantButton = page.getByRole('button', { name: /Participant View/i });

    // These should not be visible in unified view
    const creatorVisible = await creatorButton.isVisible().catch(() => false);
    const participantVisible = await participantButton.isVisible().catch(() => false);

    expect(creatorVisible).toBe(false);
    expect(participantVisible).toBe(false);
  });

  test('can toggle back to Classic from Unified', async ({ page }) => {
    // Switch to Unified
    const toggle = page.getByRole('switch');
    await toggle.click();
    await expect(page.getByText('Unified')).toBeVisible();

    // Switch back to Classic
    await toggle.click();
    await expect(page.getByText('Classic')).toBeVisible();
    await expect(toggle).toHaveAttribute('data-state', 'unchecked');

    // Role buttons should reappear
    await expect(page.getByRole('button', { name: /Creator View/i })).toBeVisible();
  });
});

test.describe('Dashboard Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('search input is visible', async ({ page }) => {
    await expect(page.getByPlaceholder('Search polls...')).toBeVisible();
  });

  test('refresh button works', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshButton).toBeVisible();

    // Click refresh
    await refreshButton.click();

    // Page should still be functional
    await expect(page.getByPlaceholder('Search polls...')).toBeVisible();
  });

  test('tabs for Active and Completed polls', async ({ page }) => {
    // Ensure Classic view for tabs
    const toggle = page.getByRole('switch');
    if (await toggle.getAttribute('data-state') === 'checked') {
      await toggle.click();
    }

    // Verify tabs
    await expect(page.getByRole('tab', { name: /Active/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Completed/i })).toBeVisible();
  });

  test('can switch between Active and Completed tabs', async ({ page }) => {
    // Ensure Classic view
    const toggle = page.getByRole('switch');
    if (await toggle.getAttribute('data-state') === 'checked') {
      await toggle.click();
    }

    // Click Active tab
    await page.getByRole('tab', { name: /Active/i }).click();
    await expect(page.getByRole('tab', { name: /Active/i })).toHaveAttribute('data-state', 'active');

    // Click Completed tab
    await page.getByRole('tab', { name: /Completed/i }).click();
    await expect(page.getByRole('tab', { name: /Completed/i })).toHaveAttribute('data-state', 'active');
  });
});

test.describe('Dashboard Stats Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.setItem('leopulse_dashboard_view', 'classic'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays stats cards in Classic view', async ({ page }) => {
    // Verify stats cards are visible (use first() for potential duplicates)
    await expect(page.getByText('Active Polls').first()).toBeVisible();
    await expect(page.getByText('Total Votes').first()).toBeVisible();
    await expect(page.getByText('Rewards Pool').first()).toBeVisible();
    await expect(page.getByText('Total Polls').first()).toBeVisible();
  });

  test('stats show numeric values', async ({ page }) => {
    // Check that stat cards have numeric content (font-mono class for numbers)
    const statsGrid = page.locator('.grid').first();
    await expect(statsGrid).toBeVisible();

    // Verify font-mono class for numbers (used for stat values)
    const statValues = page.locator('.font-mono');
    const count = await statValues.count();
    expect(count).toBeGreaterThan(0);
  });
});
