import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: DevWalletPanel Private Key Login', () => {
	test('should open dev wallet panel on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		const devWalletBtn = page.locator('.dev-toggle');
		await expect(devWalletBtn).toBeVisible({ timeout: 10000 });
		await devWalletBtn.click();
		await expect(page.locator('.dev-panel')).toBeVisible({ timeout: 5000 });
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		// Must show a truncated address with "..." (e.g. "✅ 0012345678...abcdef")
		const walletStatus = page.locator('.dev-panel .wallet-status');
		await expect(walletStatus).toBeVisible({ timeout: 5000 });
		await expect(walletStatus).toContainText('...');
		// Must show the checkmark prefix
		await expect(walletStatus).toContainText('✅');
	});

	test('should disconnect wallet and show input again', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		// Verify connected first
		await expect(page.locator('.dev-panel .wallet-status')).toBeVisible({ timeout: 5000 });

		// Click disconnect
		await page.locator('.dev-panel .disconnect').click();

		// Input must reappear (wallet disconnected)
		await expect(page.locator('.dev-panel input[type="password"]')).toBeVisible({ timeout: 5000 });

		// Wallet status must be gone
		await expect(page.locator('.dev-panel .wallet-status')).not.toBeVisible();
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		const devWalletBtn = page.locator('.dev-toggle');
		await devWalletBtn.click();

		const devPanel = page.locator('.dev-panel');
		await expect(devPanel).toBeVisible({ timeout: 5000 });

		// Fill with too-short key
		await devPanel.locator('input[type="password"]').fill('abc123');

		// Connect button should be disabled (key !== 64 chars)
		const connectBtn = devPanel.locator('button').filter({ hasText: 'Connect' });
		await expect(connectBtn).toBeDisabled();
	});
});
