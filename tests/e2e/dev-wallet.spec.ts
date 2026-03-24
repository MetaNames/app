import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	/**
	 * All tests scope to the top-bar <header> to avoid conflicts
	 * with the in-page ConnectionRequired wallet button.
	 */

	test('should show Dev Private Key option in wallet menu on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });
		await connectBtn.click();

		const devKeyItem = topBar.locator('li', { hasText: 'Dev Private Key' }).first();
		await expect(devKeyItem).toBeVisible({ timeout: 5000 });
	});

	test('should expand private key input when clicking Dev Private Key', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await connectBtn.click();

		const devKeyItem = topBar.locator('li', { hasText: 'Dev Private Key' }).first();
		await devKeyItem.click();

		const keyInput = topBar.locator('.dev-key-input').first();
		await expect(keyInput).toBeVisible({ timeout: 5000 });

		const devConnectBtn = topBar.locator('.dev-key-connect').first();
		await expect(devConnectBtn).toBeDisabled();
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		const topBar = page.locator('header').first();
		await expect(topBar.locator('button', { hasText: '...' }).first()).toBeVisible({ timeout: 10000 });
	});

	test('should disconnect wallet via menu', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		const topBar = page.locator('header').first();
		const walletBtn = topBar.locator('button', { hasText: '...' }).first();
		await walletBtn.click();

		const disconnectItem = topBar.locator('li', { hasText: 'Disconnect' }).first();
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		await expect(topBar.locator('button', { hasText: /Connect/ }).first()).toBeVisible({ timeout: 5000 });
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await connectBtn.click();

		const devKeyItem = topBar.locator('li', { hasText: 'Dev Private Key' }).first();
		await devKeyItem.click();

		const keyInput = topBar.locator('.dev-key-input').first();
		await keyInput.fill('abc123');

		const devConnectBtn = topBar.locator('.dev-key-connect').first();
		await expect(devConnectBtn).toBeDisabled();
	});
});
