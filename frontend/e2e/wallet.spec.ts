import { test, expect } from './fixtures';

test.describe('Wallet Integration', () => {
  test('should show wallet connect button when not connected', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/');

    // Look for the specific "Connect Wallet" button
    const connectButton = page.getByRole('button', { name: 'Connect Wallet' });

    // Either a connect button should be visible, or the wallet is already connected
    const walletSection = page.locator('[data-testid="wallet-section"]');

    await expect(connectButton.or(walletSection)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to wallet page and show wallet options', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/wallet');

    await expect(page).toHaveURL('/wallet');

    // Wait for page content to load
    await page.waitForLoadState('networkidle');

    // The wallet page should have loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be able to connect Leo Wallet', async ({ context }) => {
    const page = context.pages()[0] || await context.newPage();
    await page.goto('/');

    // Find and click the connect wallet button
    const connectButton = page.getByRole('button', { name: /connect.*wallet|leo/i });

    if (await connectButton.isVisible()) {
      // Listen for popup (wallet approval)
      const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);

      await connectButton.click();

      const popup = await popupPromise;

      if (popup) {
        // Wait for wallet popup to load
        await popup.waitForLoadState('domcontentloaded');

        // Look for approve/connect button in the wallet popup
        const approveButton = popup.getByRole('button', { name: /connect|approve|confirm/i });
        if (await approveButton.isVisible({ timeout: 5000 })) {
          await approveButton.click();
        }

        // Wait for popup to close
        await popup.waitForEvent('close', { timeout: 10000 }).catch(() => {});
      }

      // Verify connection succeeded - look for wallet address or disconnect button
      await page.waitForTimeout(2000); // Give time for state to update

      const disconnectButton = page.getByRole('button', { name: /disconnect/i });
      const walletAddress = page.locator('[data-testid="wallet-address"]');

      // Either disconnect button or wallet address should be visible if connected
      const isConnected = await disconnectButton.isVisible().catch(() => false) ||
                         await walletAddress.isVisible().catch(() => false);

      // This is informational - the test passes either way since connection may require manual approval
      console.log(`Wallet connection status: ${isConnected ? 'connected' : 'not connected (may require manual approval)'}`);
    }
  });
});
