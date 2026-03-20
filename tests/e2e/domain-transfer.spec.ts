import { test, expect } from '@playwright/test';

/**
 * Domain Transfer feature tests.
 * test.mpc is a known registered domain on testnet.
 */

test.describe('Feature 6: Domain Transfer', () => {
	const registeredDomain = 'test.mpc';

	test('5.1 - Transfer domain - transfer page loads with domain name and warning', async ({ page }) => {
		// Navigate directly to transfer page (Transfer button only visible to domain owner)
		await page.goto(`/domain/${registeredDomain}/transfer`);

		// Transfer heading must be visible
		await expect(page.locator('h2:has-text("Transfer")')).toBeVisible({ timeout: 15000 });

		// Domain name in card must be visible
		const domainCard = page.locator('h4').filter({ hasText: registeredDomain });
		await expect(domainCard).toBeVisible({ timeout: 5000 });

		// Warning about irreversible transfer must be visible
		const warning = page.locator('text=irreversible');
		await expect(warning).toBeVisible({ timeout: 5000 });
	});

	test('5.2 - Validate recipient address - transfer page loads with form', async ({
		page
	}) => {
		await page.goto(`/domain/${registeredDomain}/transfer`);

		// Transfer heading must appear
		await expect(page.locator('h2:has-text("Transfer")')).toBeVisible({ timeout: 15000 });

		// Recipient address input must be visible
		const addressInput = page.getByRole('textbox', { name: /recipient address/i });
		await expect(addressInput).toBeVisible({ timeout: 10000 });

		// Warning about irreversible transfer must be visible
		const warning = page.locator('text=irreversible');
		await expect(warning).toBeVisible({ timeout: 5000 });

		// Input must accept text
		await addressInput.fill('not-a-valid-address');
		await expect(addressInput).toHaveValue('not-a-valid-address');
	});
});
