import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 3: Domain Registration', () => {
	test('3.1 - Checkout form visible for available domain', async ({ page }) => {
		const domainName = `e2ereg${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });

		// Checkout content must be visible
		const checkoutContent = page.locator('.content.checkout');
		await expect(checkoutContent).toBeVisible({ timeout: 15000 });
	});

	test('3.2 - Payment token dropdown visible and populated', async ({ page }) => {
		const domainName = `e2etoken${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		// Payment token section must be visible
		const paymentTokenSection = page.locator('[data-testid="payment-token-section"]');
		await expect(paymentTokenSection).toBeVisible({ timeout: 10000 });

		// Token select must be present
		const tokenSelect = page.locator('[data-testid="payment-token-select"]');
		await expect(tokenSelect).toBeVisible({ timeout: 5000 });
	});

	test('3.3 - Year selector works (add/remove years)', async ({ page }) => {
		const domainName = `e2eyears${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		const addYearBtn = page.locator('[aria-label="add-year"]');
		const removeYearBtn = page.locator('[aria-label="remove-year"]');
		await expect(addYearBtn).toBeVisible({ timeout: 5000 });
		await expect(removeYearBtn).toBeVisible({ timeout: 5000 });

		// Should start at 1 year
		await expect(page.locator('.years span').filter({ hasText: /1 year/ })).toBeVisible({
			timeout: 3000
		});

		// Click add year → 2 years
		await addYearBtn.click();
		await expect(page.locator('.years span').filter({ hasText: /2 years/ })).toBeVisible({
			timeout: 3000
		});

		// Click remove year → back to 1 year
		await removeYearBtn.click();
		await expect(page.locator('.years span').filter({ hasText: /1 year/ })).toBeVisible({
			timeout: 3000
		});
	});

	test('3.4 - Subdomain registration shows parent and FREE price', async ({ page }) => {
		const subdomain = `sub.test.mpc`;
		await page.goto(`/register/${subdomain}`, { waitUntil: 'networkidle' });

		// Domain title must show subdomain
		const domainTitle = page.locator('h4.domain-title');
		await expect(domainTitle).toBeVisible({ timeout: 15000 });
		await expect(domainTitle).toContainText(subdomain);

		// Parent chip must show test.mpc
		const parentChip = page.locator('.chip').filter({ hasText: 'test.mpc' });
		await expect(parentChip).toBeVisible({ timeout: 5000 });

		// Must show FREE for subdomain
		await expect(page.locator('text=FREE')).toBeVisible({ timeout: 5000 });
	});

	test('3.5 - Price breakdown section visible', async ({ page }) => {
		const domainName = `e2efees${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		const priceBreakdown = page.locator('[data-testid="price-breakdown-section"]');
		await expect(priceBreakdown).toBeVisible({ timeout: 10000 });
	});

	test('3.6 - Already registered domain redirects to domain page', async ({ page }) => {
		await page.goto('/register/test.mpc', { waitUntil: 'networkidle' });

		// Must redirect to domain page
		await page.waitForURL(/\/domain\/test\.mpc/, { timeout: 15000 });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
	});

	test.describe('Authenticated', () => {
		test('3.7 - Checkout hides connect wallet prompt when logged in', async ({ page }) => {
			const domainName = `authtest${Date.now()}.mpc`;
			await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
			await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// "Connect your wallet" prompt must NOT be visible
			await expect(page.locator('text=Connect your wallet')).not.toBeVisible();
		});

		test('3.8 - Token select visible when wallet connected', async ({ page }) => {
			const domainName = `authtoken${Date.now()}.mpc`;
			await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
			await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			const tokenSelect = page.locator('[data-testid="payment-token-select"]');
			await expect(tokenSelect).toBeVisible({ timeout: 10000 });
		});
	});
});
