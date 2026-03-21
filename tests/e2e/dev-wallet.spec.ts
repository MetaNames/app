import { test, expect } from '@playwright/test';

const TEST_PRIVATE_KEY = '07375d80367a5f19a22509df960a5cfce5b683728d3c930f8f918aeb091dfad8';
const TEST_ADDRESS = '00aab9940ad6e20e16102106895592f03c66005840';

test.describe('DevWalletPanel: Private Key Login', () => {
	test('should login with private key and show connected state', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		// Click dev wallet button
		const devWalletBtn = page.locator('.dev-toggle');
		await expect(devWalletBtn).toBeVisible({ timeout: 10000 });
		await devWalletBtn.click();

		// Fill private key in dev panel
		const devPanel = page.locator('.dev-panel');
		await expect(devPanel).toBeVisible({ timeout: 5000 });
		const pkInput = devPanel.locator('input[type="password"]');
		await pkInput.fill(TEST_PRIVATE_KEY);

		// Click connect in dev panel
		devPanel.locator('button').filter({ hasText: 'Connect' }).click();

		// Should show wallet status with connected address
		await expect(devPanel.locator('.wallet-status')).toBeVisible({ timeout: 5000 });
		await expect(devPanel.locator('.wallet-status')).toContainText('...');
	});

	test('should persist wallet state on profile page', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		// Login
		await page.locator('.dev-toggle').click();
		const devPanel = page.locator('.dev-panel');
		devPanel.locator('input[type="password"]').fill(TEST_PRIVATE_KEY);
		devPanel.locator('button').filter({ hasText: 'Connect' }).click();
		await expect(devPanel.locator('.wallet-status')).toBeVisible({ timeout: 5000 });

		// Navigate to profile (keep same page context)
		await page.goto('/profile');

		// Should see address chip and domains heading (not "connect wallet" message)
		const connectMsg = page.locator('text=Connect your wallet to see your domains');
		await expect(connectMsg).not.toBeVisible({ timeout: 10000 });

		const addressChip = page.locator('.chip');
		await expect(addressChip).toBeVisible({ timeout: 10000 });
	});
});
