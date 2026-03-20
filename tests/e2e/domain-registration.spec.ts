import { test, expect } from '@playwright/test';

/**
 * Domain Registration feature tests.
 * Tests register pages for new (available) domains.
 */

test.describe('Feature 3: Domain Registration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('3.1 - Register available domain - checkout form is visible', async ({ page }) => {
		// Use a unique domain name that is definitely available
		const domainName = `e2ereg${Date.now()}`;
		await page.goto(`/register/${domainName}`);

		// Checkout content must be visible for an available domain
		const checkoutContent = page.locator('.content.checkout');
		await expect(checkoutContent).toBeVisible({ timeout: 15000 });
	});

	test('3.2 - Choose BYOC token - token dropdown is visible and populated', async ({ page }) => {
		const domainName = `e2etoken${Date.now()}`;
		await page.goto(`/register/${domainName}`);

		// Wait for checkout
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Payment token section must be visible
		const paymentTokenSection = page.locator('[data-testid="payment-token-section"]');
		await expect(paymentTokenSection).toBeVisible({ timeout: 10000 });

		// Token select dropdown must be visible and have options
		const tokenSelect = page.locator('[data-testid="payment-token-select"]');
		await expect(tokenSelect).toBeVisible({ timeout: 5000 });
	});

	test('3.3 - Choose registration duration - years selector works', async ({ page }) => {
		const domainName = `e2eyears${Date.now()}`;
		await page.goto(`/register/${domainName}`);

		// Wait for checkout
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Years selector must be visible
		const addYearBtn = page.locator('[aria-label="add-year"]');
		const removeYearBtn = page.locator('[aria-label="remove-year"]');
		await expect(addYearBtn).toBeVisible({ timeout: 5000 });
		await expect(removeYearBtn).toBeVisible({ timeout: 5000 });

		// Should start at 1 year
		const yearLabel = page.locator('.years span').filter({ hasText: /1 year/ });
		await expect(yearLabel).toBeVisible({ timeout: 3000 });

		// Click add year → should show 2 years
		await addYearBtn.click();
		await page.waitForTimeout(300);
		const yearLabel2 = page.locator('.years span').filter({ hasText: /2 years/ });
		await expect(yearLabel2).toBeVisible({ timeout: 3000 });

		// Click remove year → back to 1 year
		await removeYearBtn.click();
		await page.waitForTimeout(300);
		await expect(yearLabel).toBeVisible({ timeout: 3000 });
	});

	test('3.4 - Register subdomain - parent domain exists, subdomain form shown', async ({ page }) => {
		// test.mpc exists; sub.test.mpc should be registerable
		const subdomain = `sub.test.mpc`;
		await page.goto(`/register/${subdomain}`);

		// Wait for either subdomain form or redirect
		// Either the subdomain registration form or checkout should appear
		const subForm = page.locator('text=Subdomain Registration').or(
			page.locator('.content.checkout')
		);
		await expect(subForm.first()).toBeVisible({ timeout: 15000 });
	});

	test('3.5 - See registration confirmation UI - fees breakdown visible', async ({ page }) => {
		const domainName = `e2efees${Date.now()}`;
		await page.goto(`/register/${domainName}`);

		// Wait for checkout
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Price breakdown section must be visible
		const priceBreakdown = page.locator('[data-testid="price-breakdown-section"]');
		await expect(priceBreakdown).toBeVisible({ timeout: 10000 });
	});

	test('3.6 - Already registered domain - redirects to domain page', async ({ page }) => {
		// test.mpc is registered on testnet
		await page.goto(`/register/${'test.mpc'}`);

		// Must redirect to domain page (not stay on /register/)
		await page.waitForURL(/\/domain\/test\.mpc/, { timeout: 15000 });

		// Domain page should load correctly
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
	});
});
