import { test, expect } from '@playwright/test';

/**
 * DNS Records feature tests.
 * test.mpc is a known registered domain on testnet.
 */

test.describe('Feature 7: DNS Records', () => {
	const registeredDomain = 'test.mpc';

	test('7.1 - View domain page - domain loads and displays correctly', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Domain page must load and show the domain heading
		const domainHeading = page.locator('h5.domain');
		await expect(domainHeading).toBeVisible({ timeout: 15000 });

		// Must contain the domain name — wait for it to settle
		await expect(domainHeading).toContainText(/test/i, { timeout: 5000 });
	});

	test('7.2 - DNS records display - profile section is visible for registered domain', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to fully load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Profile section must be visible (test.mpc has DNS records)
		const profileSection = page.locator('h5:has-text("Profile")');
		await expect(profileSection).toBeVisible({ timeout: 10000 });
	});

	test('7.3 - DNS records - settings tab is NOT visible when wallet disconnected', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to fully load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Settings tab must not be visible when wallet is not connected
		const settingsTab = page.locator('button:has-text("settings")');
		await expect(settingsTab).not.toBeVisible();
	});

	test('7.4 - Domain whois section - Whois info is visible for registered domain', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to fully load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Whois section must be visible for registered domain
		const whoisSection = page.locator('h5:has-text("Whois")');
		await expect(whoisSection).toBeVisible({ timeout: 10000 });
	});
});
