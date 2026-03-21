import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 3: Subdomain Registration (Authenticated)', () => {
	test('3.9 - Subdomain register button visible when logged in as parent owner', async ({
		page
	}) => {
		// test.mpc is owned by test wallet, so sub.test.mpc registration should allow register
		const subdomain = `sub${Date.now()}.test.mpc`;
		await page.goto(`/register/${subdomain}`, { waitUntil: 'networkidle' });

		// Wait for page to load
		const domainTitle = page.locator('h4.domain-title');
		await expect(domainTitle).toBeVisible({ timeout: 15000 });

		// Login on this page
		await loginOnCurrentPage(page);

		// Register button should be visible (owner of parent)
		const registerBtn = page.locator('button:has-text("Register")');
		await expect(registerBtn).toBeVisible({ timeout: 10000 });
	});
});
