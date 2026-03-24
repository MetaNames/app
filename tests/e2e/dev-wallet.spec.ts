import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	/**
	 * Tests use .wallet-connect class (unique to WalletConnectStatus in top-bar)
	 * to scope the wallet button, avoiding conflicts with ConnectionRequired.
	 */

	test('should show dev key input in wallet menu on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const walletDiv = page.locator('.wallet-connect').first();
		const connectBtn = walletDiv.locator('button').first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });
		await connectBtn.click();

		await expect(page.locator('.dev-key-input:visible').first()).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.dev-key-connect:visible').first()).toBeVisible({ timeout: 5000 });
	});

	test('should have connect button disabled with empty key', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const walletDiv = page.locator('.wallet-connect').first();
		walletDiv.locator('button').first().click();

		const devConnectBtn = page.locator('.dev-key-connect:visible').first();
		await expect(devConnectBtn).toBeDisabled();
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		const walletDiv = page.locator('.wallet-connect').first();
		await expect(walletDiv.locator('button', { hasText: '...' }).first()).toBeVisible({ timeout: 10000 });
	});

	test('should disconnect wallet via menu', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		const walletDiv = page.locator('.wallet-connect').first();
		const walletBtn = walletDiv.locator('button', { hasText: '...' }).first();
		await walletBtn.click();

		const disconnectItem = page.locator('li:visible', { hasText: 'Disconnect' }).first();
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		await expect(walletDiv.locator('button', { hasText: /Connect/ }).first()).toBeVisible({ timeout: 5000 });
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const walletDiv = page.locator('.wallet-connect').first();
		walletDiv.locator('button').first().click();

		const keyInput = page.locator('.dev-key-input:visible').first();
		await expect(keyInput).toBeVisible({ timeout: 5000 });
		await keyInput.fill('abc123');

		const devConnectBtn = page.locator('.dev-key-connect:visible').first();
		await expect(devConnectBtn).toBeDisabled();
	});
});
