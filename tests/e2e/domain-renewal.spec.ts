import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 5: Domain Renewal', () => {
	test('5.1 - Page loads with heading, year selector, and go-back button', async ({ page }) => {
		await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });

		await expect(page.locator('h2:has-text("Renew domain")')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('[aria-label="add-year"]')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('[aria-label="remove-year"]')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('a:has-text("Go back"), button:has-text("Go back")')).toBeVisible({
			timeout: 5000
		});
	});

	test('5.2 - URL is correct', async ({ page }) => {
		await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
		await expect(page).toHaveURL(/\/domain\/test\.mpc\/renew/);
	});

	test('5.3 - Shows payment token and fees when logged in', async ({ page }) => {
		await page.goto('/domain/test.mpc/renew', { waitUntil: 'networkidle' });
		await expect(page.locator('h2:has-text("Renew domain")')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		await expect(page.locator('[data-testid="payment-token-section"]')).toBeVisible({
			timeout: 10000
		});
		await expect(page.locator('[data-testid="price-breakdown-section"]')).toBeVisible({
			timeout: 10000
		});
	});
});
