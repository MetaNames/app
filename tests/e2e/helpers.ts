import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 *
 * IMPORTANT: On pages with ConnectionRequired (e.g. /register, /domain/.../transfer),
 * there are TWO "Connect" buttons — one in the header (top navbar) and one in the page
 * body. Each has its own SMUI Menu anchor. We MUST click the header one specifically.
 *
 * Strategy: Target the button via the SMUI TopAppBar action-item CSS class
 * (.mdc-top-app-bar__action-item) which only exists on the header button.
 * This is more reliable than text matching since the button text changes
 * after login (from "Connect Wallet" to "0033...8f2c").
 */
export async function loginOnCurrentPage(page: Page) {
	// CI flakiness: the SvelteKit dev server can return 500 on cold start or be slow to hydrate.
	// Wait for the page to be fully loaded and not showing an error page.
	// If we see a 500 error page, wait and reload.
	const errorIndicator = page.locator('text=Internal Error');
	if (await errorIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
		await page.waitForTimeout(2000);
		await page.reload({ waitUntil: 'networkidle' });
	}

	// Use data-testid which is unique to the header wallet connect button.
	// WalletConnectStatus passes testid="wallet-connect-btn" to WalletConnectButton.
	const connectBtn = page.locator('[data-testid="wallet-connect-btn"]');
	await expect(connectBtn).toBeVisible({ timeout: 15000 });

	// Wait for SvelteKit hydration — the SMUI button needs JS to handle click events.
	// Without this, clicking the button does nothing (no menu opens).
	await page.waitForTimeout(2000);

	// Wait for any loading spinners to disappear (page still fetching data)
	await page.waitForLoadState('networkidle');

	// Click the Connect button.
	await connectBtn.click();

	// Wait for the dev-key-input to appear and be visible.
	// The SMUI Menu opens anchored to the header div — the dev-key-input appears inside it.
	// On testnet, the dev-key section is always rendered when the menu is open.
	const keyInput = page.locator('.dev-key-input');
	await expect(keyInput).toBeVisible({ timeout: 15000 });
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input (inside the menu, not the header button)
	const devConnectBtn = page.locator('.dev-key-connect').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the header button text changes to a short address
	await expect(connectBtn).toContainText('...', { timeout: 10000 });
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
