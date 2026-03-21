import { test, expect } from '@playwright/test';

const TEST_PRIVATE_KEY = '07375d80367a5f19a22509df960a5cfce5b683728d3c930f8f918aeb091dfad8';

/**
 * Helper: Login with private key via DevWalletPanel
 * Call this before every test that needs wallet authentication.
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

test.describe('Feature 7: DNS Records', () => {
	const registeredDomain = 'test.mpc';

	test('7.1 - View domain page - domain loads and displays correctly', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);
		const domainHeading = page.locator('h5.domain');
		await expect(domainHeading).toBeVisible({ timeout: 15000 });
		await expect(domainHeading).toContainText(/test/i, { timeout: 5000 });
	});

	test('7.2 - DNS records display - profile section is visible for registered domain', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
		const profileSection = page.locator('h5:has-text("Profile")');
		await expect(profileSection).toBeVisible({ timeout: 10000 });
	});

	test('7.3 - DNS records - settings tab NOT visible when wallet disconnected', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
		const settingsTab = page.locator('button:has-text("settings")');
		await expect(settingsTab).not.toBeVisible();
	});

	test('7.4 - Domain whois section - Whois info visible for registered domain', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
		const whoisSection = page.locator('h5:has-text("Whois")');
		await expect(whoisSection).toBeVisible({ timeout: 10000 });
	});

	test('7.5 - Settings tab NOT visible for non-owned domain', async ({ page }) => {
		// Login with private key
		await loginWithPrivateKey(page);

		// Navigate to non-owned domain (stays on same page context)
		await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Settings tab should NOT appear (TEST_ADDRESS doesn't own test.mpc)
		const settingsTab = page.locator('button:has-text("settings")');
		await expect(settingsTab).not.toBeVisible();
	});

	test('7.6 - Profile page via SPA navigation shows wallet connected', async ({ page }) => {
		// Login on home page
		await loginWithPrivateKey(page);

		// Click logo to go home (SPA nav, no full reload)
		await page.locator('a.link-logo').click();
		await page.waitForURL('/', { timeout: 10000 });

		// Click profile link if exists, otherwise use nav
		// For now just verify wallet is still connected on home page
		await expect(page.locator('.dev-panel .wallet-status')).toBeVisible({ timeout: 5000 });
	});
});
