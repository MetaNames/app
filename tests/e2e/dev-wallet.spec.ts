import { test, expect } from '@playwright/test';

const TEST_PRIVATE_KEY = '07375d80367a5f19a22509df960a5cfce5b683728d3c930f8f918aeb091dfad8';

/**
 * Helper: Login with private key via DevWalletPanel
 * Call this at the start of every test that needs wallet authentication.
 */
async function loginWithPrivateKey(page: any) {
	await page.goto('/', { waitUntil: 'networkidle' });
	const devWalletBtn = page.locator('.dev-toggle');
	await expect(devWalletBtn).toBeVisible({ timeout: 10000 });
	await devWalletBtn.click();

	const devPanel = page.locator('.dev-panel');
	await expect(devPanel).toBeVisible({ timeout: 5000 });
	await devPanel.locator('input[type="password"]').fill(TEST_PRIVATE_KEY);
	devPanel.locator('button').filter({ hasText: 'Connect' }).click();
	await expect(devPanel.locator('.wallet-status')).toBeVisible({ timeout: 5000 });
}

test.describe('Feature: DevWalletPanel Private Key Login', () => {
	test('should open dev wallet panel on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		const devWalletBtn = page.locator('.dev-toggle');
		await expect(devWalletBtn).toBeVisible({ timeout: 10000 });
		await devWalletBtn.click();
		await expect(page.locator('.dev-panel')).toBeVisible({ timeout: 5000 });
	});

	test('should login with valid private key', async ({ page }) => {
		await loginWithPrivateKey(page);
		// Wallet status should show connected address
		await expect(page.locator('.dev-panel .wallet-status')).toContainText('...');
	});

	test('should disconnect wallet', async ({ page }) => {
		await loginWithPrivateKey(page);
		// Click disconnect
		page.locator('.dev-panel .disconnect').click();
		await expect(page.locator('.dev-panel input[type="password"]')).toBeVisible({ timeout: 5000 });
	});
});
