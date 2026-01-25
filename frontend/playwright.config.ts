import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for LeoPulse E2E tests
 * Uses Brave browser with the "playwright" profile that has Leo Wallet installed
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for wallet state consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for wallet tests
  reporter: 'html',
  timeout: 60000, // 60s per test
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'brave-with-leo-wallet',
      use: {
        launchOptions: {
          executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
          args: [
            '--disable-blink-features=AutomationControlled',
          ],
        },
        // Note: We use launchPersistentContext in tests for extension support
        headless: false,
      },
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
