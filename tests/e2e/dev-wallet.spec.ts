import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	test('should show dev key input in wallet menu on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });
		await connectBtn.click();

		// Wait for the dev-key-input to be added to the DOM (SMUI {#if} block renders it when menu opens).
		await page.waitForFunction(
			() => document.querySelector('.dev-key-input') !== null,
			{ timeout: 10000 }
		);
		await expect(page.locator('.dev-key-input').first()).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.dev-key-connect').first()).toBeVisible({ timeout: 5000 });
	});

	test('should have connect button disabled with empty key', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const topBar = page.locator('header').first();
		topBar.locator('button', { hasText: /Connect/ }).first().click();

		await expect(page.locator('.dev-key-connect').first()).toBeDisabled({ timeout: 5000 });
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
		topBar.locator('button', { hasText: /Connect/ }).first().click();

		// Wait for the dev-key-input to be added to the DOM.
		await page.waitForFunction(
			() => document.querySelector('.dev-key-input') !== null,
			{ timeout: 10000 }
		);
		const keyInput = page.locator('.dev-key-input').first();
		await expect(keyInput).toBeVisible({ timeout: 5000 });
		await keyInput.fill('abc123');

		await expect(page.locator('.dev-key-connect').first()).toBeDisabled();
	});
});
