import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 6: Domain Transfer', () => {
	test.describe('Unauthenticated', () => {
		test('6.1 - Transfer page URL is correct', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page).toHaveURL(/\/domain\/test\.mpc\/transfer/);
		});

		test('6.2 - Transfer page shows heading and domain name', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });

			// "Transfer domain" heading must appear
			const heading = page.locator('h2:has-text("Transfer domain")');
			await expect(heading).toBeVisible({ timeout: 15000 });

			// Domain name must appear in card
			const domainTitle = page.locator('h4:has-text("test.mpc")');
			await expect(domainTitle).toBeVisible({ timeout: 5000 });
		});

		test('6.3 - Transfer page shows recipient address input', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

			// Recipient address input must be visible
			const recipientInput = page.locator('input');
			await expect(recipientInput.first()).toBeVisible({ timeout: 5000 });
		});

		test('6.4 - Transfer button requires wallet connection', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

			// Without wallet, should show connection required (wallet connect button instead of transfer)
			// "Transfer domain" button should NOT be visible (ConnectionRequired hides it)
			const transferBtn = page.locator('button:has-text("Transfer domain")');
			await expect(transferBtn).not.toBeVisible();
		});
	});

	test.describe('Authenticated', () => {
		test('6.5 - Transfer button visible when logged in', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Transfer button must now be visible
			const transferBtn = page.locator('button:has-text("Transfer domain")');
			await expect(transferBtn).toBeVisible({ timeout: 10000 });
		});

		test('6.6 - Warning text about irreversible transfer visible', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

			// Warning text must be present
			await expect(page.locator('text=all transfers are irreversible')).toBeVisible({
				timeout: 5000
			});
			await expect(page.locator('text=Verify the address is correct')).toBeVisible({
				timeout: 5000
			});
		});

		test('6.7 - Go back button present on transfer page', async ({ page }) => {
			await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

			const goBackBtn = page.locator('a:has-text("Go back"), button:has-text("Go back")');
			await expect(goBackBtn).toBeVisible({ timeout: 5000 });
		});
	});
});
