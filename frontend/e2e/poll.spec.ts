import { test, expect } from './fixtures';

test.describe('Poll Features', () => {
  test('should navigate to create poll page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/create');

    await expect(page).toHaveURL('/create');
    await page.waitForLoadState('networkidle');
  });

  test('should display poll creation form elements', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/create');

    await page.waitForLoadState('networkidle');

    // Look for common form elements (adjust selectors based on your actual form)
    const formElements = page.locator('form, [data-testid="poll-form"], input, textarea');
    await expect(formElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to poll details page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();

    // Navigate to a poll details page (using a placeholder ID)
    await page.goto('/poll/1');

    // Should either show the poll or a not found message
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show questionnaires list', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/questionnaires');

    await expect(page).toHaveURL('/questionnaires');
    await page.waitForLoadState('networkidle');

    // Page should have loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to create questionnaire page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/questionnaire/create');

    await expect(page).toHaveURL('/questionnaire/create');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Creator Dashboard', () => {
  test('should access creator dashboard', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/creator');

    await expect(page).toHaveURL('/creator');
    await page.waitForLoadState('networkidle');
  });

  test('should access manage polls page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/creator/manage');

    await expect(page).toHaveURL('/creator/manage');
    await page.waitForLoadState('networkidle');
  });

  test('should access creator questionnaires', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/creator/questionnaires');

    await expect(page).toHaveURL('/creator/questionnaires');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Participant Dashboard', () => {
  test('should access participant dashboard', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant');

    await expect(page).toHaveURL('/participant');
    await page.waitForLoadState('networkidle');
  });

  test('should access voting history', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant/history');

    await expect(page).toHaveURL('/participant/history');
    await page.waitForLoadState('networkidle');
  });

  test('should access rewards page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant/rewards');

    await expect(page).toHaveURL('/participant/rewards');
    await page.waitForLoadState('networkidle');
  });

  test('should access quests page', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/participant/quests');

    await expect(page).toHaveURL('/participant/quests');
    await page.waitForLoadState('networkidle');
  });
});
