import { test, expect } from '@playwright/test';

/**
 * Domain Management feature tests.
 * test.mpc is a known registered domain on testnet.
 */

test.describe('Feature 4: Domain Management', () => {
	const registeredDomain = 'test.mpc';

	test('3.1 - View domain details - domain page loads with name and avatar', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Domain heading must appear
		const domainHeading = page.locator('h5.domain');
		await expect(domainHeading).toBeVisible({ timeout: 15000 });
		await expect(domainHeading).toContainText(/test/i);

		// Avatar must be visible (SVG identicon)
		const avatar = page.locator('.avatar svg, .avatar img').first();
		await expect(avatar).toBeVisible({ timeout: 5000 });
	});

	test('3.2 - View domain records - shows Whois info with owner and expiry', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Whois section must be visible
		const whoisHeading = page.locator('h5:has-text("Whois")');
		await expect(whoisHeading).toBeVisible({ timeout: 10000 });

		// Owner button must be visible with address
		const ownerButton = page.getByRole('button', { name: /Owner 0/i });
		await expect(ownerButton).toBeVisible({ timeout: 5000 });

		// Expiry button must be visible
		const expiryButton = page.getByRole('button', { name: /Expires/i });
		await expect(expiryButton).toBeVisible({ timeout: 5000 });
	});

	test('3.3 - See if I am the owner - owner address is displayed', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Owner button must be visible
		const ownerButton = page.getByRole('button', { name: /Owner 0/i });
		await expect(ownerButton).toBeVisible({ timeout: 10000 });
	});

	test('3.4 - Navigate to owner - owner address displayed', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`);

		// Wait for domain to load
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		// Owner button must be visible in Whois section
		const ownerButton = page.getByRole('button', { name: /Owner 0/i });
		await expect(ownerButton).toBeVisible({ timeout: 5000 });
	});
});
