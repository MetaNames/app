import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 3: Domain Registration', () => {
	test('3.1 - Checkout form visible for available domain', async ({ page }) => {
		const domainName = `e2ereg${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });

		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });
	});

	test('3.2 - Payment token dropdown visible', async ({ page }) => {
		const domainName = `e2etoken${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		await expect(page.locator('[data-testid="payment-token-section"]')).toBeVisible({
			timeout: 10000
		});
		await expect(page.locator('[data-testid="payment-token-select"]')).toBeVisible({
			timeout: 5000
		});
	});

	test('3.3 - Year selector increments and decrements', async ({ page }) => {
		const domainName = `e2eyears${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		const addBtn = page.locator('[aria-label="add-year"]');
		const removeBtn = page.locator('[aria-label="remove-year"]');
		await expect(addBtn).toBeVisible({ timeout: 5000 });

		// Starts at 1 year
		await expect(page.locator('.years span').filter({ hasText: /1 year/ })).toBeVisible({
			timeout: 3000
		});

		// Add → 2 years
		await addBtn.click();
		await expect(page.locator('.years span').filter({ hasText: /2 years/ })).toBeVisible({
			timeout: 3000
		});

		// Remove → 1 year
		await removeBtn.click();
		await expect(page.locator('.years span').filter({ hasText: /1 year/ })).toBeVisible({
			timeout: 3000
		});
	});

	test('3.4 - Subdomain shows parent chip and FREE price', async ({ page }) => {
		await page.goto('/register/sub.test.mpc', { waitUntil: 'networkidle' });

		const domainTitle = page.locator('h4.domain-title');
		await expect(domainTitle).toBeVisible({ timeout: 15000 });
		await expect(domainTitle).toContainText('sub.test.mpc');

		await expect(page.locator('.chip').filter({ hasText: 'test.mpc' })).toBeVisible({
			timeout: 5000
		});
		await expect(page.locator('text=FREE')).toBeVisible({ timeout: 5000 });
	});

	test('3.5 - Price breakdown section visible', async ({ page }) => {
		const domainName = `e2efees${Date.now()}`;
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

		await expect(page.locator('[data-testid="price-breakdown-section"]')).toBeVisible({
			timeout: 10000
		});
	});

	test('3.6 - Registered domain redirects to domain page', async ({ page }) => {
		await page.goto('/register/test.mpc', { waitUntil: 'networkidle' });

		await page.waitForURL(/\/domain\/test\.mpc/, { timeout: 15000 });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
	});

	test.describe('Authenticated', () => {
		test('3.7 - No "Connect wallet" prompt when logged in', async ({ page }) => {
			const domainName = `authtest${Date.now()}.mpc`;
			await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
			await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			await expect(page.locator('text=Connect your wallet')).not.toBeVisible();
		});

		test('3.8 - Token select visible when wallet connected', async ({ page }) => {
			const domainName = `authtoken${Date.now()}.mpc`;
			await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
			await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			await expect(page.locator('[data-testid="payment-token-select"]')).toBeVisible({
				timeout: 10000
			});
		});

		test('3.9 - Subdomain register button visible when logged in as parent owner', async ({
			page
		}) => {
			const subdomain = `sub${Date.now()}.test.mpc`;
			await page.goto(`/register/${subdomain}`, { waitUntil: 'networkidle' });

			await expect(page.locator('h4.domain-title')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			await expect(page.locator('button:has-text("Register")')).toBeVisible({ timeout: 10000 });
		});
	});

	test('3.10 - subdomain of an unregistered parent lands on the parent checkout', async ({
		page
	}) => {
		// A parent nobody has registered, so `/api/domains/.../check` reports parentPresent:false
		// and the page redirects to the parent's own registration URL.
		const parent = `nope${Date.now()}.mpc`;

		await page.goto(`/register/sub.${parent}`);
		await page.waitForURL(`**/register/${parent}`);

		await expect(page.locator('[data-testid="checkout-content"] h4')).toHaveText(parent);
	});
});
