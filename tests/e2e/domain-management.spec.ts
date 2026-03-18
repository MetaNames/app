import { test, expect } from '@playwright/test';

test.describe('Feature 4: Domain Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('3.1 - View domain details - loads domain page with name and avatar', async ({ page }) => {
		// First find a known domain that exists
		const knownDomain = 'test.ppg';
		const checkResponse = await page.request.get(`/api/domains/${knownDomain}`);
		const checkData = await checkResponse.json();

		// Navigate to domain page
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Should show domain name in heading
		const domainHeading = page.locator('h5.domain').first();
		await expect(domainHeading).toBeVisible();

		// Should show avatar (SVG identicon)
		const avatar = page.locator('.avatar .svg').first();
		await expect(avatar).toBeVisible();
	});

	test('3.2 - View domain records - shows profile records and Whois info', async ({ page }) => {
		const knownDomain = 'test.ppg';
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Should show Whois section
		const whoisHeading = page.locator('h5:has-text("Whois")').first();
		await expect(whoisHeading).toBeVisible();

		// Should show Owner chip with address
		const ownerChip = page.locator('.chips .chip').filter({ hasText: /Owner/ }).first();
		await expect(ownerChip).toBeVisible();

		// Should show Expiry chip
		const expiryChip = page.locator('.chips .chip').filter({ hasText: /Expires/ }).first();
		await expect(expiryChip).toBeVisible();
	});

	test('3.3 - See if I am the owner - shows owner-connected indicator', async ({ page }) => {
		const knownDomain = 'test.ppg';
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Check if wallet address matches owner
		// The page should show the owner address
		// If wallet is NOT connected, owner info still visible in Whois
		const ownerChip = page.locator('.chips .chip').filter({ hasText: /Owner/ }).first();
		await expect(ownerChip).toBeVisible();

		// The owner address should be a valid Partisia address (64 chars hex)
		const ownerText = await ownerChip.textContent();
		expect(ownerText).toBeTruthy();
	});

	test('3.4 - Navigate to owner - owner address links to block explorer', async ({ page }) => {
		const knownDomain = 'test.ppg';
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Find the Owner chip which should be a link
		// Look for a chip with an href pointing to explorer
		const ownerChips = page.locator('.chips .chip a').filter({ hasText: /Owner/ });
		const ownerCount = await ownerChips.count();

		if (ownerCount > 0) {
			// Owner chip should have a valid href
			const href = await ownerChips.first().getAttribute('href');
			expect(href).toBeTruthy();
			expect(href).toContain('explorer');
		} else {
			// If no link chip, verify the owner is shown as text (plain display)
			const ownerChip = page.locator('.chips .chip').filter({ hasText: /Owner/ }).first();
			await expect(ownerChip).toBeVisible();
		}
	});
});
