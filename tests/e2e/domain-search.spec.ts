import { test, expect } from '@playwright/test';

/**
 * These tests require live blockchain interaction (SDK calls to testnet).
 * They are skipped in CI since the blockchain state is not available.
 * To run these tests locally:
 * 1. Ensure you have TESTNET_PRIVATE_KEY set
 * 2. Run: CI=false npm run test:integration
 */

const testWithBlockchain = process.env.CI === 'true' ? test.skip : test;

test.describe('Feature 1: Domain Search & Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	testWithBlockchain('1.1 - Search for domain name on homepage', async ({ page }) => {
		// Find the search input - SMUI Textfield renders input inside div with class "mdc-text-field"
		const searchInput = page.locator('.mdc-text-field input[type="text"]').first();
		await expect(searchInput).toBeVisible();

		// Enter a domain name
		await searchInput.fill('test');

		// Wait for debounced search (400ms) + API response
		await page.waitForTimeout(1500);

		// Should show a result card (available or registered) or loading state
		// Result cards have class "domain-link"
		const domainCard = page.locator('.domain-link').first();
		await expect(domainCard).toBeVisible({ timeout: 10000 });
	});

	testWithBlockchain('1.2 - Validate domain names before registration', async ({ page }) => {
		// Find the search input - SMUI Textfield renders input inside div with class "mdc-text-field"
		const searchInput = page.locator('.mdc-text-field input[type="text"]').first();
		await expect(searchInput).toBeVisible();

		// Enter an invalid domain (too short - should trigger validation)
		await searchInput.fill('ab');

		// Blur the field to trigger validation display
		await searchInput.blur();

		// Wait for debounce and validation
		await page.waitForTimeout(600);

		// Should show validation error in helper text
		const helperText = page.locator('.mdc-text-field-helper-text');
		await expect(helperText).toBeVisible({ timeout: 10000 });
	});

	testWithBlockchain('1.3 - See domain availability status', async ({ page }) => {
		// Find the search input - SMUI Textfield renders input inside div with class "mdc-text-field"
		const searchInput = page.locator('.mdc-text-field input[type="text"]').first();
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
