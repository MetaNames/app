import { test, expect } from '@playwright/test';

const TEST_PRIVATE_KEY = '07375d80367a5f19a22509df960a5cfce5b683728d3c930f8f918aeb091dfad8';

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

test.describe('Feature 6: Domain Transfer', () => {
	test('6.1 - Transfer page URL is correct', async ({ page }) => {
		await loginWithPrivateKey(page);
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });

		// URL should contain domain name and transfer
		await expect(page).toHaveURL(/\/domain\/test\.mpc\/transfer/);
	});

	test('6.2 - Transfer page has input field', async ({ page }) => {
		await loginWithPrivateKey(page);
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });

		// Should have at least one input (recipient address)
		const inputs = page.locator('input');
		await expect(inputs.first()).toBeVisible({ timeout: 5000 });
	});
});
