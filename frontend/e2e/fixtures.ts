import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

// Brave profile path with Leo Wallet installed
const BRAVE_PROFILE_PATH = '/Users/east/Library/Application Support/BraveSoftware/Brave-Browser/Profile 22';
const BRAVE_EXECUTABLE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

// Extended test fixture that uses Brave with Leo Wallet
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // Override context to use persistent Brave profile
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(BRAVE_PROFILE_PATH, {
      headless: false,
      executablePath: BRAVE_EXECUTABLE,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
      viewport: { width: 1280, height: 720 },
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    await use(context);
    // Give extra time for browser cleanup
    await context.close().catch(() => {});
  },

  // Get Leo Wallet extension ID (useful for interacting with extension pages)
  extensionId: async ({ context }, use) => {
    // Leo Wallet extension ID - may need to be updated
    // You can find it at brave://extensions
    let extensionId = '';

    // Try to find the extension ID from service workers
    const serviceWorkers = context.serviceWorkers();
    for (const worker of serviceWorkers) {
      const url = worker.url();
      if (url.includes('chrome-extension://')) {
        const match = url.match(/chrome-extension:\/\/([^/]+)/);
        if (match) {
          extensionId = match[1];
          break;
        }
      }
    }

    await use(extensionId);
  },
});

export { expect } from '@playwright/test';

// Helper to wait for wallet connection
export async function waitForWalletConnection(context: BrowserContext, timeout = 30000) {
  const page = context.pages()[0];

  // Wait for wallet adapter to be ready
  await page.waitForFunction(() => {
    return (window as any).__ALEO_WALLET_CONNECTED__ === true;
  }, { timeout });
}

// Helper to approve wallet transaction popup
export async function approveWalletTransaction(context: BrowserContext) {
  // Wait for new page (popup) to appear
  const popupPromise = context.waitForEvent('page');
  const popup = await popupPromise;

  // Wait for popup to load
  await popup.waitForLoadState('domcontentloaded');

  // Click approve/confirm button (adjust selector based on Leo Wallet UI)
  const approveButton = popup.getByRole('button', { name: /approve|confirm|sign/i });
  if (await approveButton.isVisible()) {
    await approveButton.click();
  }
}
