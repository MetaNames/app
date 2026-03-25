import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 *
 * Strategy: The SMUI Menu renders as a child of the anchor div inside the header.
 * The dev-key input is always in the DOM on testnet but hidden when the menu
 * is closed (CSS visibility). We click the top-bar Connect button, then wait
 * for the dev-key-input to become visible.
 */
export async function loginOnCurrentPage(page: Page) {
	// Allow SvelteKit hydration to complete.
	await page.waitForTimeout(3000);

	// Use text filter to reliably find the Connect Wallet button in the header.
	// SMUI TopAppBar renders as a div structure, not native <header>.
	const topBar = page.locator('header').first();
	const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
	await expect(connectBtn).toBeVisible({ timeout: 15000 });

	// Click the Connect button.
	await connectBtn.click();

	// Wait for the dev-key-input to appear and be visible.
	// Use expect with toBeVisible which polls internally — more reliable than manual count checks.
	// The element only appears when both: (1) menu is open AND (2) isTestnet is true.
	const keyInput = page.locator('.dev-key-input');
	await expect(keyInput).toBeVisible({ timeout: 15000 });
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input
	const devConnectBtn = page.locator('.dev-key-connect').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the button text changes to a short address (e.g. "0033...8f2c")
	await expect(topBar.locator('button', { hasText: /\d{4}\.\.\.[a-f0-9]{4}/ }).first()).toBeVisible({ timeout: 10000 });
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
