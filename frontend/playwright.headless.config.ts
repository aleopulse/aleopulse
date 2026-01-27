import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for headless UI-only tests
 * These tests do not require wallet extensions and can run in CI
 */
export default defineConfig({
  testDir: './e2e/ui',
  fullyParallel: true, // Parallel execution for speed
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4, // Multiple workers for parallel execution
  reporter: [['html', { outputFolder: 'playwright-report-headless' }]],
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000,
  },

  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
