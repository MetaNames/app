import { test, expect } from '@playwright/test';

/**
 * User Profile feature tests.
 * Wallet is NOT connected in CI — tests verify disconnected state only.
 */

test.describe('Feature 7: User Profile', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/profile');
	});

	test('7.1 - View profile - shows connect wallet message when not connected', async ({ page }) => {
		// Must show connect wallet message
		const connectMessage = page.locator('text=Connect your wallet to see your domains');
		await expect(connectMessage).toBeVisible({ timeout: 10000 });

		// Must NOT show the domains heading
		const domainsHeading = page.locator('h4.domains');
		await expect(domainsHeading).not.toBeVisible();

		// Must NOT show address chip
		const addressChip = page.locator('.chip');
		await expect(addressChip).not.toBeVisible();
	});

	test('7.2 - Search domains - not visible without wallet connection', async ({ page }) => {
		// Search bar must not be visible when wallet is disconnected
		const searchBar = page.locator('.search-bar');
		await expect(searchBar).not.toBeVisible();

		// Must show connect wallet message instead
		const connectMessage = page.locator('text=Connect your wallet to see your domains');
		await expect(connectMessage).toBeVisible({ timeout: 5000 });
	});

	test('7.3 - Access domain from profile - domains table not visible without wallet', async ({ page }) => {
		// Domains table must not be visible when wallet is disconnected
		const domainsTable = page.locator('table[aria-label="Domain list"]');
		await expect(domainsTable).not.toBeVisible();

		// Must show connect wallet message instead
		const connectMessage = page.locator('text=Connect your wallet to see your domains');
		await expect(connectMessage).toBeVisible({ timeout: 5000 });
	});

	test('7.4 - Pagination not visible without wallet connection', async ({ page }) => {
		// Pagination must not be visible when wallet is disconnected
		const pagination = page.locator('.mdc-data-table__pagination');
		await expect(pagination).not.toBeVisible();

		// Must show connect wallet message instead
		const connectMessage = page.locator('text=Connect your wallet to see your domains');
		await expect(connectMessage).toBeVisible({ timeout: 5000 });
	});
});
