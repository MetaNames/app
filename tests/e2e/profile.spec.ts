import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 8: User Profile', () => {
	test('8.1 - Disconnected: shows connect message, no table/search/pagination', async ({
		page
	}) => {
		await page.goto('/profile', { waitUntil: 'networkidle' });

		await expect(page.locator('text=Connect your wallet to see your domains')).toBeVisible({
			timeout: 10000
		});

		// None of the authenticated UI should render
		await expect(page.locator('h2.domains')).not.toBeVisible();
		await expect(page.locator('.chip')).not.toBeVisible();
		await expect(page.locator('.search-bar')).not.toBeVisible();
		await expect(page.locator('table[aria-label="Domain list"]')).not.toBeVisible();
		await expect(page.locator('.mdc-data-table__pagination')).not.toBeVisible();
	});

	test('the profile page sets a document title', async ({ page }) => {
		await page.goto('/profile');

		await expect(page).toHaveTitle('Profile | Meta Names');
	});

	test.describe('Authenticated', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/profile', { waitUntil: 'networkidle' });
			await loginOnCurrentPage(page);
		});

		test('8.2 - Shows address chip and "Domains" heading', async ({ page }) => {
			await expect(page.locator('.chip').first()).toBeVisible({ timeout: 10000 });

			const domainsHeading = page.locator('h2.domains');
			await expect(domainsHeading).toBeVisible({ timeout: 10000 });
			await expect(domainsHeading).toHaveText('Domains');
		});

		test('8.3 - Domains table contains test.mpc', async ({ page }) => {
			const domainsTable = page.locator('table[aria-label="Domain list"]');
			await expect(domainsTable).toBeVisible({ timeout: 15000 });

			await expect(domainsTable.locator('a', { hasText: 'test.mpc' })).toBeVisible({
				timeout: 10000
			});
		});

		test('8.4 - Search bar visible', async ({ page }) => {
			await expect(page.locator('h2.domains')).toBeVisible({ timeout: 10000 });
			await expect(page.locator('.search-bar')).toBeVisible({ timeout: 5000 });
		});

		test('8.5 - Domain link navigates to domain page', async ({ page }) => {
			const domainsTable = page.locator('table[aria-label="Domain list"]');
			await expect(domainsTable).toBeVisible({ timeout: 15000 });

			const testDomainLink = domainsTable.locator('a', { hasText: 'test.mpc' });
			await expect(testDomainLink).toBeVisible({ timeout: 10000 });
			await testDomainLink.click();

			await page.waitForURL(/\/domain\/test\.mpc/, { timeout: 10000 });
			await expect(page.locator('h1.domain')).toBeVisible({ timeout: 15000 });
		});
	});
});
