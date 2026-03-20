import { test, expect } from '@playwright/test';

test.describe('Feature 1: Domain Search & Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('1.1 - Search for domain name on homepage', async ({ page }) => {
		const searchInput = page.locator('input').first();
		await expect(searchInput).toBeVisible();

		await searchInput.click();
		await page.keyboard.type('test', { delay: 50 });

		// Wait for debounced search (400ms) + blockchain API response
		// First request may be slow due to cold start (~10-20s)
		const domainCard = page.locator('.domain-link').first();
		await expect(domainCard).toBeVisible({ timeout: 30000 });
	});

	test('1.2 - Validate domain names before registration', async ({ page }) => {
		const searchInput = page.locator('input').first();
		await expect(searchInput).toBeVisible();

		// Type invalid chars (spaces/special chars fail STD3 ASCII rules in tr46)
		await searchInput.click();
		await page.keyboard.type('test!@#', { delay: 50 });

		// The input should be marked as invalid
		const invalidField = page.locator('.mdc-text-field--invalid');
		await expect(invalidField).toBeVisible({ timeout: 10000 });
	});

	test('1.3 - See domain availability status', async ({ page }) => {
		const searchInput = page.locator('input').first();
		await expect(searchInput).toBeVisible();

		const randomDomain = `zzztest${Date.now()}`;
		await searchInput.click();
		await page.keyboard.type(randomDomain, { delay: 20 });

		// Wait for either "Available" or "Registered" chip (blockchain response ~5s)
		await expect(
			page.locator('.chip.available, .chip.registered').first()
		).toBeVisible({ timeout: 15000 });
	});
});
