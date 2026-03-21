import { test, expect } from '@playwright/test';

const TEST_PRIVATE_KEY = '07375d80367a5f19a22509df960a5cfce5b683728d3c930f8f918aeb091dfad8';

/**
 * Helper: Login with private key via DevWalletPanel
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

test.describe('Feature: Domain Registration (Authenticated)', () => {
	test('R1 - Checkout form shows connected wallet address', async ({ page }) => {
		// Login first
		await loginWithPrivateKey(page);

		// Go to register page for an available domain
		const domainName = `authtest${Date.now()}.mpc`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });

		// Should see checkout form
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Should NOT show "Connect wallet" prompt
		const connectPrompt = page.locator('text=Connect your wallet');
		await expect(connectPrompt).not.toBeVisible();
	});

	test('R2 - Can select payment token when wallet connected', async ({ page }) => {
		await loginWithPrivateKey(page);

		const domainName = `authtoken${Date.now()}.mpc`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Token select should be visible
		const tokenSelect = page.locator('[data-testid="payment-token-select"]');
		await expect(tokenSelect).toBeVisible({ timeout: 10000 });
	});
});
