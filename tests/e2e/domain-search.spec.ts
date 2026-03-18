import { test, expect } from '@playwright/test';

test.describe('Feature 1: Domain Search & Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('1.1 - Search for domain name on homepage', async ({ page }) => {
		// Find the search input
		const searchInput = page.locator('input[type="text"], input.mdc-text-field__input').first();
		await expect(searchInput).toBeVisible();

		// Enter a domain name
		await searchInput.fill('test');

		// Wait for debounced search (400ms) + API response
		await page.waitForTimeout(1500);

		// Should show a result card (available or registered)
		const domainCard = page.locator('.domain-link').first();
		await expect(domainCard).toBeVisible();
	});

	test('1.2 - Validate domain names before registration', async ({ page }) => {
		// Find the search input
		const searchInput = page.locator('input[type="text"], input.mdc-text-field__input').first();
		await expect(searchInput).toBeVisible();

		// Enter an invalid domain (too short - should trigger validation)
		await searchInput.fill('ab');

		// Wait for debounce
		await page.waitForTimeout(600);

		// Should show validation error
		const helperText = page.locator('.mdc-text-field-helper-text').first();
		await expect(helperText).toBeVisible();
	});

	test('1.3 - See domain availability status', async ({ page }) => {
		// Find the search input
		const searchInput = page.locator('input[type="text"], input.mdc-text-field__input').first();
		await expect(searchInput).toBeVisible();

		// Search for a domain that might be available (random string to minimize collision)
		const randomDomain = `zzztest${Date.now()}`;
		await searchInput.fill(randomDomain);

		// Wait for search to complete
		await page.waitForTimeout(2000);

		// Should show either "Available" or "Registered" chip
		const availableChip = page.locator('.chip.available');
		const registeredChip = page.locator('.chip.registered');
		const hasAvailable = await availableChip.count() > 0;
		const hasRegistered = await registeredChip.count() > 0;

		expect(hasAvailable || hasRegistered).toBeTruthy();
	});
});
