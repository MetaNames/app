import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via DevWalletPanel on the CURRENT page (no page.goto).
 * The page must already be loaded. Avoids clearing Svelte stores.
 * Waits for hydration before interacting with the dev panel.
 */
export async function loginOnCurrentPage(page: Page) {
	// Wait for Svelte hydration — the dev-toggle only renders when {#if isTestnet} evaluates
	const devWalletBtn = page.locator('.dev-toggle');
	await expect(devWalletBtn).toBeVisible({ timeout: 15000 });
	await devWalletBtn.click();

	const devPanel = page.locator('.dev-panel');
	await expect(devPanel).toBeVisible({ timeout: 5000 });
	await devPanel.locator('input[type="password"]').fill(TEST_PRIVATE_KEY);
	await devPanel.locator('button').filter({ hasText: 'Connect' }).click();
	await expect(devPanel.locator('.wallet-status')).toBeVisible({ timeout: 10000 });
}

/**
 * Login via DevWalletPanel at homepage, then navigate via SPA link click.
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
