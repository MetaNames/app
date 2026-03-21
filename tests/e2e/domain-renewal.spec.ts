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

test.describe('Feature 5: Domain Renewal (Authenticated)', () => {
	test('5.1 - Renew page accessible after wallet login', async ({ page }) => {
		// Login first
		await loginWithPrivateKey(page);

		// Navigate to renew page - server-side load() runs analyze()
		await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });

		// Should show "Renew domain" heading (h2.mt-0) if domain analyzed successfully
		const renewHeading = page.locator('h2:has-text("Renew domain")');
		await expect(renewHeading).toBeVisible({ timeout: 10000 });
	});

	test('5.2 - Renewal page URL is correct', async ({ page }) => {
		await loginWithPrivateKey(page);

		// Go to renew page directly
		await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });

		// URL should be correct
		await expect(page).toHaveURL(/\/domain\/test\.mpc\/renew/);
	});
});
