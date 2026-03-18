import { test, expect } from '@playwright/test';

test.describe('Feature 6: Domain Transfer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('5.1 - Transfer domain - navigate to transfer page from domain page', async ({ page }) => {
		// Find a known domain that exists
		const knownDomain = 'test.ppg';

		// Navigate to domain page
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Look for the Transfer button in Actions section
		const transferButton = page.locator('a:has-text("Transfer"), button:has-text("Transfer")').first();
		await expect(transferButton).toBeVisible();

		// Click the Transfer button
		await transferButton.click();

		// Should navigate to transfer page
		await page.waitForURL(`**/domain/${knownDomain}/transfer**`);

		// Should show "Transfer domain" heading
		const transferHeading = page.locator('h2:has-text("Transfer")').first();
		await expect(transferHeading).toBeVisible();

		// Should show the domain name in the card
		const domainCard = page.locator('h4').filter({ hasText: knownDomain }).first();
		await expect(domainCard).toBeVisible();

		// Should show warning about irreversible transfers
		const warning = page.locator('text=irreversible').first();
		await expect(warning).toBeVisible();
	});

	test('5.2 - Validate recipient address - shows validation errors for invalid address', async ({ page }) => {
		// Navigate directly to transfer page for a known domain
		const knownDomain = 'test.ppg';
		await page.goto(`/domain/${knownDomain}/transfer`);

		// Wait for page to load
		await page.waitForTimeout(3000);

		// Should show "Transfer domain" heading
		const transferHeading = page.locator('h2:has-text("Transfer")').first();
		await expect(transferHeading).toBeVisible();

		// Should show recipient address input
		const addressInput = page.locator('input[label="Recipient address"], input[placeholder*="address" i]').first();
		await expect(addressInput).toBeVisible();

		// Should show Transfer domain button (disabled until valid address)
		const transferButton = page.locator('button:has-text("Transfer domain")').first();
		await expect(transferButton).toBeVisible();

		// Type an invalid address
		await addressInput.fill('invalid-address');

		// Wait for validation
		await page.waitForTimeout(500);

		// Should show validation error
		const errorText = page.locator('text=invalid').first();
		await expect(errorText).toBeVisible();
	});
});
