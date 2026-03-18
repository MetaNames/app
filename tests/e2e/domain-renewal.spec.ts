import { test, expect } from '@playwright/test';

test.describe('Feature 5: Domain Renewal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('4.1 - Renew domain - navigate to renew page from domain page', async ({ page }) => {
		// First find a known domain that exists
		const knownDomain = 'test.ppg';

		// Navigate to domain page
		await page.goto(`/domain/${knownDomain}`);

		// Wait for domain to load
		await page.waitForTimeout(3000);

		// Look for the Renew button in Actions section
		const renewButton = page.locator('a:has-text("Renew"), button:has-text("Renew")').first();
		await expect(renewButton).toBeVisible();

		// Click the Renew button
		await renewButton.click();

		// Should navigate to renew page
		await page.waitForURL(`**/domain/${knownDomain}/renew**`);

		// Should show "Renew domain" heading
		const renewHeading = page.locator('h2:has-text("Renew")').first();
		await expect(renewHeading).toBeVisible();

		// Should show the domain name in the payment card
		const domainCard = page.locator('h4').filter({ hasText: knownDomain }).first();
		await expect(domainCard).toBeVisible();
	});

	test('4.2 - See renewal fees - displays fee breakdown for domain renewal', async ({ page }) => {
		// Navigate directly to renew page for a known domain
		const knownDomain = 'test.ppg';
		await page.goto(`/domain/${knownDomain}/renew`);

		// Wait for page to load
		await page.waitForTimeout(3000);

		// Should show "Renew domain" heading
		const renewHeading = page.locator('h2:has-text("Renew")').first();
		await expect(renewHeading).toBeVisible();

		// Should show the domain name in the payment card
		const domainCard = page.locator('h4').filter({ hasText: knownDomain }).first();
		await expect(domainCard).toBeVisible();

		// Should show years selector with default of 1 year
		const yearsDisplay = page.locator('.years span').first();
		await expect(yearsDisplay).toBeVisible();

		// Should show Payment token selector
		const tokenSelect = page.locator('.coin select').first();
		await expect(tokenSelect).toBeVisible();

		// Should show Price breakdown section
		const priceBreakdown = page.locator('.fees .title:has-text("Price breakdown")').first();
		await expect(priceBreakdown).toBeVisible();

		// Wait for fees to load
		await page.waitForTimeout(2000);

		// Should show total fees (data-testid="total-fees")
		const totalFees = page.locator('[data-testid="total-fees"]').first();
		await expect(totalFees).toBeVisible();

		// Should show "Approve fees" button
		const approveButton = page.locator('button:has-text("Approve fees")').first();
		await expect(approveButton).toBeVisible();

		// Should show "Renew domain" button (disabled until fees approved)
		const renewButton = page.locator('button:has-text("Renew"), button:has-text("Renew domain")').first();
		await expect(renewButton).toBeVisible();
	});
});
