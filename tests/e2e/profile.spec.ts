import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 8: User Profile', () => {
	test.describe('Disconnected state', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
		});

		test('8.1 - Shows connect wallet message when not connected', async ({ page }) => {
			// Must show connect wallet message
			const connectMessage = page.locator('text=Connect your wallet to see your domains');
			await expect(connectMessage).toBeVisible({ timeout: 10000 });

			// Must NOT show the domains heading
			await expect(page.locator('h4.domains')).not.toBeVisible();

			// Must NOT show address chip
			await expect(page.locator('.chip')).not.toBeVisible();
		});

		test('8.2 - Search bar not visible without wallet', async ({ page }) => {
			await expect(page.locator('.search-bar')).not.toBeVisible();
			await expect(page.locator('text=Connect your wallet to see your domains')).toBeVisible({
				timeout: 5000
			});
		});

		test('8.3 - Domains table not visible without wallet', async ({ page }) => {
			await expect(page.locator('table[aria-label="Domain list"]')).not.toBeVisible();
			await expect(page.locator('text=Connect your wallet to see your domains')).toBeVisible({
				timeout: 5000
			});
		});

		test('8.4 - Pagination not visible without wallet', async ({ page }) => {
			await expect(page.locator('.mdc-data-table__pagination')).not.toBeVisible();
		});
	});

	test.describe('Authenticated state', () => {
		test('8.5 - Profile shows address chip when logged in', async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);

			// Address chip must be visible with the wallet address
			const addressChip = page.locator('.chip').first();
			await expect(addressChip).toBeVisible({ timeout: 10000 });
		});

		test('8.6 - Profile shows "Domains" heading when logged in', async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);

			// "Domains" heading must appear
			const domainsHeading = page.locator('h4.domains');
			await expect(domainsHeading).toBeVisible({ timeout: 10000 });
			await expect(domainsHeading).toHaveText('Domains');
		});

		test('8.7 - Profile shows domains table with test.mpc when logged in', async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);

			// Domains table must be visible
			const domainsTable = page.locator('table[aria-label="Domain list"]');
			await expect(domainsTable).toBeVisible({ timeout: 15000 });

			// test.mpc must be in the table (owned by this wallet)
			const testDomainLink = domainsTable.locator('a', { hasText: 'test.mpc' });
			await expect(testDomainLink).toBeVisible({ timeout: 10000 });
		});

		test('8.8 - Profile search bar visible when logged in', async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);

			// Wait for domains heading to confirm authenticated state
			await expect(page.locator('h4.domains')).toBeVisible({ timeout: 10000 });

			// Search bar must be visible
			const searchBar = page.locator('.search-bar');
			await expect(searchBar).toBeVisible({ timeout: 5000 });
		});

		test('8.9 - Profile domain link navigates to domain page', async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);

			// Wait for table
			const domainsTable = page.locator('table[aria-label="Domain list"]');
			await expect(domainsTable).toBeVisible({ timeout: 15000 });

			// Click on test.mpc link
			const testDomainLink = domainsTable.locator('a', { hasText: 'test.mpc' });
			await expect(testDomainLink).toBeVisible({ timeout: 10000 });
			await testDomainLink.click();

			// Should navigate to domain page
			await page.waitForURL(/\/domain\/test\.mpc/, { timeout: 10000 });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
		});
	});
});
