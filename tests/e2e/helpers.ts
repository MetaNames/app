import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 *
 * Uses the wallet-connect class unique to WalletConnectStatus (top-bar only)
 * to distinguish from in-page ConnectionRequired buttons.
 */
export async function loginOnCurrentPage(page: Page) {
	// The top-bar wallet button is wrapped in a div.wallet-connect (WalletConnectStatus.svelte).
	// ConnectionRequired does NOT use this wrapper — it renders WalletConnectButton directly.
	const walletConnectDiv = page.locator('.wallet-connect').first();
	const connectBtn = walletConnectDiv.locator('button').first();
	await expect(connectBtn).toBeVisible({ timeout: 15000 });
	await connectBtn.click();

	// Wait for the menu to open and dev-key input to render.
	// The menu renders as a sibling of the button inside the same anchor div,
	// so we search from the page level for the visible dev-key-input.
	const keyInput = page.locator('.dev-key-input:visible').first();
	await expect(keyInput).toBeVisible({ timeout: 5000 });
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input
	const devConnectBtn = page.locator('.dev-key-connect:visible').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the wallet-connect button changes to show a short address
	await expect(walletConnectDiv.locator('button', { hasText: '...' }).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Login via wallet connect menu at homepage, then navigate via SPA link click.
 * Use when you need wallet state preserved across navigation.
 */
export async function loginAtHome(page: Page) {
	await page.goto('/', { waitUntil: 'networkidle' });
	await loginOnCurrentPage(page);
}

/**
 * SPA-navigate to a path by evaluating goto() in the browser.
 * This preserves Svelte stores (unlike page.goto which does a full reload).
 */
export async function spaNavigate(page: Page, path: string) {
	await page.evaluate(async (p) => {
		const { goto } = await import('$app/navigation');
		await goto(p);
	}, path);
	await page.waitForLoadState('networkidle');
}
