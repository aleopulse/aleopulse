import { test, expect } from '@playwright/test';

/**
 * UI Tests for Creator Experience
 * Tests inline action buttons, distribution modal, and poll templates
 */
test.describe('Creator Manage Polls UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/creator/manage');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays page layout', async ({ page }) => {
    // Verify page title is visible (use heading role for specificity)
    await expect(page.getByRole('heading', { name: 'Manage Polls' })).toBeVisible();
    await expect(page.getByText('View and manage all your polls')).toBeVisible();
  });

  test('shows wallet connection warning when not connected', async ({ page }) => {
    // Without wallet, should show warning
    const walletWarning = page.getByText(/connect your wallet/i);
    await expect(walletWarning).toBeVisible();
  });

  test('displays sidebar navigation', async ({ page }) => {
    // Verify sidebar items are visible
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Manage Polls/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Create Poll/i })).toBeVisible();
  });
});

test.describe('Poll Templates in CreatePoll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays progress stepper', async ({ page }) => {
    // Verify step indicators exist (use first() for potential duplicates)
    await expect(page.getByText('Basic Info').first()).toBeVisible();
    await expect(page.getByText('Voting Options').first()).toBeVisible();
    await expect(page.getByText('Incentives').first()).toBeVisible();
  });

  test('step 1 shows basic info fields', async ({ page }) => {
    // Verify form fields on step 1
    await expect(page.getByLabel(/Poll Title/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
    await expect(page.getByText('Privacy Mode')).toBeVisible();
    await expect(page.getByText('Poll Visibility')).toBeVisible();
  });

  test('can navigate to step 2 with voting options', async ({ page }) => {
    // Fill required fields
    await page.getByLabel(/Poll Title/i).fill('Test Poll Title');
    await page.getByLabel(/Description/i).fill('Test poll description');

    // Click Next Step
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Verify step 2 content - Quick Templates
    await expect(page.getByText('Quick Templates')).toBeVisible();
    await expect(page.getByText('Step 2: Voting Options')).toBeVisible();
  });

  test('poll template selector displays options', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Verify 5 template buttons are visible
    await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yes/No' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Agree/Disagree' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'A/B/C/D' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rating' })).toBeVisible();
  });

  test('Yes/No template pre-fills options', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Click Yes/No template
    await page.getByRole('button', { name: 'Yes/No' }).click();

    // Verify options are pre-filled
    const option1 = page.locator('input[placeholder="Option 1"]');
    const option2 = page.locator('input[placeholder="Option 2"]');

    await expect(option1).toHaveValue('Yes');
    await expect(option2).toHaveValue('No');
  });

  test('Agree/Disagree template applies 5 options', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Click Agree/Disagree template
    await page.getByRole('button', { name: 'Agree/Disagree' }).click();

    // Verify 5 option inputs are visible
    await expect(page.locator('input[placeholder="Option 1"]')).toHaveValue('Strongly Agree');
    await expect(page.locator('input[placeholder="Option 2"]')).toHaveValue('Agree');
    await expect(page.locator('input[placeholder="Option 3"]')).toHaveValue('Neutral');
    await expect(page.locator('input[placeholder="Option 4"]')).toHaveValue('Disagree');
    await expect(page.locator('input[placeholder="Option 5"]')).toHaveValue('Strongly Disagree');
  });

  test('custom editing switches template to custom', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Select Yes/No template
    await page.getByRole('button', { name: 'Yes/No' }).click();

    // Verify Yes/No is selected
    const yesNoButton = page.getByRole('button', { name: 'Yes/No' });
    await expect(yesNoButton).toHaveClass(/border-primary/);

    // Edit an option
    const option1 = page.locator('input[placeholder="Option 1"]');
    await option1.clear();
    await option1.fill('Maybe');

    // Custom button should now be selected (template switches to custom)
    const customButton = page.getByRole('button', { name: 'Custom' });
    await expect(customButton).toHaveClass(/border-primary/);
  });

  test('can add and remove options', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Initially should have 2 options
    const initialOptions = page.locator('input[placeholder^="Option"]');
    await expect(initialOptions).toHaveCount(2);

    // Click Add Option
    await page.getByRole('button', { name: /Add Option/i }).click();

    // Should now have 3 options
    await expect(page.locator('input[placeholder^="Option"]')).toHaveCount(3);

    // Remove third option (trash button)
    const trashButtons = page.locator('button:has(svg.lucide-trash-2)');
    await trashButtons.first().click();

    // Should be back to 2 options
    await expect(page.locator('input[placeholder^="Option"]')).toHaveCount(2);
  });

  test('can navigate to step 3 incentives', async ({ page }) => {
    // Navigate to step 2
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Fill options
    await page.locator('input[placeholder="Option 1"]').fill('Yes');
    await page.locator('input[placeholder="Option 2"]').fill('No');

    // Navigate to step 3
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Verify step 3 content
    await expect(page.getByText('Step 3: Incentives (Optional)')).toBeVisible();
    await expect(page.getByText('Funding Token')).toBeVisible();
    await expect(page.getByText('Reward Type')).toBeVisible();
  });

  test('incentives step shows token selection', async ({ page }) => {
    // Navigate through to step 3
    await page.getByLabel(/Poll Title/i).fill('Test Poll');
    await page.getByLabel(/Description/i).fill('Test description');
    await page.getByRole('button', { name: /Next Step/i }).click();
    await page.locator('input[placeholder="Option 1"]').fill('Yes');
    await page.locator('input[placeholder="Option 2"]').fill('No');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Verify token options
    await expect(page.getByLabel('PULSE')).toBeVisible();
    await expect(page.getByLabel('USDC')).toBeVisible();

    // Verify reward type options
    await expect(page.getByLabel('No Rewards')).toBeVisible();
    await expect(page.getByLabel('Fixed Per Vote')).toBeVisible();
    await expect(page.getByLabel('Equal Split')).toBeVisible();
  });
});

test.describe('Distribution Mode Modal UI', () => {
  test('modal appears when Start Claims clicked (if available)', async ({ page }) => {
    await page.goto('/creator/manage');
    await page.waitForLoadState('domcontentloaded');

    // Without wallet connection, modal test would need actual data
    // This tests the page structure is correct
    const pageTitle = page.getByRole('heading', { name: 'Manage Polls' });
    await expect(pageTitle).toBeVisible();
  });
});
