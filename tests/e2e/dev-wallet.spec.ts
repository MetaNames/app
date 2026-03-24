import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	test('should show dev key input in wallet menu on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });

		// Allow SvelteKit hydration to complete.
		await page.waitForTimeout(2000);
		await connectBtn.click();

		// Wait for dev-key-input to be visible (15s timeout handles hydration delays).
		await expect(page.locator('.dev-key-input')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 5000 });
	});

	test('should have connect button disabled with empty key', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });

		// Allow SvelteKit hydration to complete.
		await page.waitForTimeout(2000);
		await connectBtn.click();

		// Wait for dev-key-connect button to be visible (15s timeout handles hydration delays).
		await expect(page.locator('.dev-key-connect')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('.dev-key-connect')).toBeDisabled({ timeout: 5000 });
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

		const disconnectItem = page.locator('li', { hasText: 'Disconnect' }).first();
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		await expect(topBar.locator('button', { hasText: /Connect/ }).first()).toBeVisible({ timeout: 5000 });
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
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
