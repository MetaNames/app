import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 * Scopes to the top-app-bar <header> to avoid conflicts with in-page
 * ConnectionRequired buttons on registration pages.
 */
export async function loginOnCurrentPage(page: Page) {
	// Scope to the top app bar header
	const topBar = page.locator('header').first();

	// Wait for Svelte hydration — the wallet connect button renders in the top bar
	const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
	await expect(connectBtn).toBeVisible({ timeout: 15000 });
	await connectBtn.click();

	// The dev key input is always visible in the menu on testnet (no extra click needed)
	const keyInput = topBar.locator('.dev-key-input').first();
	await expect(keyInput).toBeVisible({ timeout: 5000 });
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input
	const devConnectBtn = topBar.locator('.dev-key-connect').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the button text changes to a short address containing "..."
	await expect(topBar.locator('button', { hasText: '...' }).first()).toBeVisible({ timeout: 10000 });
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
