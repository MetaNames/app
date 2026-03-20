import { test, expect } from '@playwright/test';

/**
 * Domain Renewal feature tests.
 * test.mpc is a known registered domain on testnet.
 */

test.describe('Feature 5: Domain Renewal', () => {
	const registeredDomain = 'test.mpc';

	test('4.1 - Renew domain - renew page loads with domain name', async ({ page }) => {
		// Navigate directly to renew page (Renew button only visible to domain owner)
		await page.goto(`/domain/${registeredDomain}/renew`);

		// Renew heading must be visible
		await expect(page.locator('h2:has-text("Renew")')).toBeVisible({ timeout: 15000 });

		// Domain name in payment card must be visible
		const domainCard = page.locator('h4').filter({ hasText: registeredDomain });
		await expect(domainCard).toBeVisible({ timeout: 5000 });
	});

	test('4.2 - See renewal fees - displays fee breakdown on renew page', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}/renew`);

		// Renew heading must appear
		await expect(page.locator('h2:has-text("Renew")')).toBeVisible({ timeout: 15000 });

		// Domain name must appear in payment card
		const domainCard = page.locator('h4').filter({ hasText: registeredDomain });
		await expect(domainCard).toBeVisible({ timeout: 5000 });

		// Years selector must be visible (starts at 1 year)
		const yearsDisplay = page.locator('.years span').first();
		await expect(yearsDisplay).toBeVisible({ timeout: 5000 });

		// Payment token selector must be visible
		const tokenSelect = page.locator('.coin select, [data-testid="payment-token-select"]').first();
		await expect(tokenSelect).toBeVisible({ timeout: 5000 });

		// Price breakdown section must be visible
		const priceBreakdown = page.locator('[data-testid="price-breakdown-section"]');
		await expect(priceBreakdown).toBeVisible({ timeout: 5000 });
	});
});
