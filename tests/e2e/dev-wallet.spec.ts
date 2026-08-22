import { test, expect } from '@playwright/test';
import { loginOnCurrentPage, openWalletMenu } from './helpers';

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
		await openWalletMenu(page);

		await expect(page.locator('.dev-key-input')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 5000 });
	});

	test('should have connect button disabled with empty key', async ({ page }) => {
		await gotoHomeReliably(page);
		await openWalletMenu(page);

		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.dev-key-connect')).toBeDisabled({ timeout: 5000 });
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await gotoHomeReliably(page);
		await loginOnCurrentPage(page);

		await expect(page.locator('button.mdc-top-app-bar__action-item')).toContainText('...', {
			timeout: 10000
		});
	});

	test('should disconnect wallet via menu', async ({ page }) => {
		await gotoHomeReliably(page);
		await loginOnCurrentPage(page);

		const walletBtn = page.locator('button.mdc-top-app-bar__action-item');
		await walletBtn.click();

		const disconnectItem = page.locator('li', { hasText: 'Disconnect' }).first();
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		await expect(page.locator('button.mdc-top-app-bar__action-item')).toContainText('Connect', {
			timeout: 5000
		});
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await gotoHomeReliably(page);
		await openWalletMenu(page);

		await expect(page.locator('.dev-key-input')).toBeVisible({ timeout: 5000 });
		await page.locator('.dev-key-input').fill('abc123');

		await expect(page.locator('.dev-key-connect')).toBeDisabled();
	});
});
