import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

// Use the .mdc-top-app-bar__action-item class to target the header button specifically.
// This avoids matching the ConnectionRequired body button on protected pages.
const headerBtnSelector = 'button.mdc-top-app-bar__action-item';

/**
 * Helper: navigate to homepage, handle 500 errors from cold SvelteKit dev server.
 */
async function gotoHomeReliably(page: import('@playwright/test').Page) {
	await page.goto('/', { waitUntil: 'networkidle' });
	// CI: SvelteKit dev server can 500 on cold start. Detect and retry.
	if (
		await page
			.locator('text=Internal Error')
			.isVisible({ timeout: 1000 })
			.catch(() => false)
	) {
		await page.waitForTimeout(2000);
		await page.reload({ waitUntil: 'networkidle' });
	}
}

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	test('should show dev key input in wallet menu on testnet', async ({ page }) => {
		await gotoHomeReliably(page);

		const connectBtn = page.locator(headerBtnSelector);
		await expect(connectBtn).toBeVisible({ timeout: 15000 });

		// Allow SvelteKit hydration to complete.
		await page.waitForTimeout(2000);
		await connectBtn.click();

		// Wait for dev-key-input to be visible (15s timeout handles hydration delays).
		await expect(page.locator('.dev-key-input')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 5000 });
	});

	test('should have connect button disabled with empty key', async ({ page }) => {
		await gotoHomeReliably(page);

		const connectBtn = page.locator(headerBtnSelector);
		await expect(connectBtn).toBeVisible({ timeout: 15000 });

		// Allow SvelteKit hydration to complete.
		await page.waitForTimeout(2000);
		await connectBtn.click();

		// Wait for dev-key-connect button to be visible (15s timeout handles hydration delays).
		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.dev-key-connect')).toBeDisabled({ timeout: 5000 });
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await gotoHomeReliably(page);
		await loginOnCurrentPage(page);

		const connectBtn = page.locator(headerBtnSelector);
		await expect(connectBtn).toContainText('...', { timeout: 10000 });
	});

	test('should disconnect wallet via menu', async ({ page }) => {
		await gotoHomeReliably(page);
		await loginOnCurrentPage(page);

		const walletBtn = page.locator(headerBtnSelector);
		await walletBtn.click();

		const disconnectItem = page.locator('li', { hasText: 'Disconnect' }).first();
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		await expect(page.locator(headerBtnSelector)).toContainText('Connect', { timeout: 5000 });
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await gotoHomeReliably(page);

		const connectBtn = page.locator(headerBtnSelector);
		await expect(connectBtn).toBeVisible({ timeout: 15000 });

		// Allow SvelteKit hydration to complete.
		await page.waitForTimeout(2000);
		await connectBtn.click();

		// Wait for dev-key-input to be visible (15s timeout handles hydration delays).
		await expect(page.locator('.dev-key-input')).toBeVisible({ timeout: 15000 });
		await page.locator('.dev-key-input').fill('abc123');

		await expect(page.locator('.dev-key-connect')).toBeDisabled();
	});
});
