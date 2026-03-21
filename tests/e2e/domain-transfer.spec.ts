import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 6: Domain Transfer', () => {
	test('6.1 - Page loads with heading, domain name, warnings, input, and go-back', async ({
		page
	}) => {
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });

		await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });
		await expect(page.locator('h4:has-text("test.mpc")')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('text=all transfers are irreversible')).toBeVisible({
			timeout: 5000
		});
		await expect(page.locator('text=Verify the address is correct')).toBeVisible({
			timeout: 5000
		});
		await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
		await expect(page.locator('a:has-text("Go back"), button:has-text("Go back")')).toBeVisible({
			timeout: 5000
		});
	});

	test('6.2 - URL is correct', async ({ page }) => {
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
		await expect(page).toHaveURL(/\/domain\/test\.mpc\/transfer/);
	});

	test('6.3 - Transfer button hidden without wallet (ConnectionRequired)', async ({ page }) => {
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
		await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

		await expect(page.locator('button:has-text("Transfer domain")')).not.toBeVisible();
	});

	test('6.4 - Transfer button visible when logged in', async ({ page }) => {
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
		await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		await expect(page.locator('button:has-text("Transfer domain")')).toBeVisible({
			timeout: 10000
		});
	});

	test('6.5 - Invalid address shows validation error', async ({ page }) => {
		await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
		await expect(page.locator('h2:has-text("Transfer domain")')).toBeVisible({ timeout: 15000 });

		await page.locator('input').first().fill('not-a-valid-address');

		await expect(page.locator('.mdc-text-field--invalid')).toBeVisible({ timeout: 5000 });
	});
});
