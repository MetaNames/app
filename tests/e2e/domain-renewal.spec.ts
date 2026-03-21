import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 5: Domain Renewal', () => {
	test.describe('Unauthenticated', () => {
		test('5.1 - Renewal page loads with correct heading', async ({ page }) => {
			await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });

			// "Renew domain" heading must be visible (server load() analyzes the domain)
			const renewHeading = page.locator('h2:has-text("Renew domain")');
			await expect(renewHeading).toBeVisible({ timeout: 15000 });
		});

		test('5.2 - Renewal page URL is correct', async ({ page }) => {
			await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
			await expect(page).toHaveURL(/\/domain\/test\.mpc\/renew/);
		});

		test('5.3 - Renewal page shows year selector', async ({ page }) => {
			await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Renew domain")')).toBeVisible({ timeout: 15000 });

			// Year add/remove buttons must be present
			await expect(page.locator('[aria-label="add-year"]')).toBeVisible({ timeout: 5000 });
			await expect(page.locator('[aria-label="remove-year"]')).toBeVisible({ timeout: 5000 });
		});
	});

	test.describe('Authenticated', () => {
		test('5.4 - Renewal page shows payment token and fees when logged in', async ({ page }) => {
			await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Renew domain")')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Payment token section must be visible
			const paymentTokenSection = page.locator('[data-testid="payment-token-section"]');
			await expect(paymentTokenSection).toBeVisible({ timeout: 10000 });

			// Price breakdown must be visible
			const priceBreakdown = page.locator('[data-testid="price-breakdown-section"]');
			await expect(priceBreakdown).toBeVisible({ timeout: 10000 });
		});

		test('5.5 - Go back button present on renewal page', async ({ page }) => {
			await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
			await expect(page.locator('h2:has-text("Renew domain")')).toBeVisible({ timeout: 15000 });

			// Go back button should exist
			const goBackBtn = page.locator('a:has-text("Go back"), button:has-text("Go back")');
			await expect(goBackBtn).toBeVisible({ timeout: 5000 });
		});
	});
});
