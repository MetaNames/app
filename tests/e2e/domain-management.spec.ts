import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

/**
 * Feature 4: Domain Management
 * test.mpc is a known registered domain on testnet, owned by the test wallet.
 */

test.describe('Feature 4: Domain Management', () => {
	const registeredDomain = 'test.mpc';

	test('4.1 - Domain page loads with name, avatar, profile, and whois', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });

		// Domain heading with correct text
		const domainHeading = page.locator('h1.domain');
		await expect(domainHeading).toBeVisible({ timeout: 15000 });
		await expect(domainHeading).toContainText(/test/i);

		// Avatar SVG identicon
		await expect(page.locator('.avatar svg').first()).toBeVisible({ timeout: 5000 });

		// Profile section
		await expect(page.locator('h2:has-text("Profile")')).toBeVisible({ timeout: 10000 });

		// Short link chip
		await expect(page.locator('.chip').filter({ hasText: 'link' }).first()).toBeVisible({
			timeout: 5000
		});

		// Whois section with owner and expiry
		await expect(page.locator('h2:has-text("Whois")')).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('button', { name: /Owner 0/i })).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('button', { name: /Expires/i })).toBeVisible({ timeout: 5000 });
	});

	test('4.2 - Non-existent domain redirects to register page', async ({ page }) => {
		const fakeDomain = `nonexistent${Date.now()}.mpc`;
		await page.goto(`/domain/${fakeDomain}`, { waitUntil: 'networkidle' });

		// App calls find() → null → redirects to /register/{name}
		await page.waitForURL(/\/register\//, { timeout: 15000 });
	});

	test('4.3 - Owner sees TabBar with details and settings tabs', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h1.domain')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		await expect(page.locator('button:has-text("details")')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('button:has-text("settings")')).toBeVisible({ timeout: 5000 });
	});

	test('4.4 - Non-owner does NOT see TabBar', async ({ page }) => {
		await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h1.domain')).toBeVisible({ timeout: 15000 });

		await expect(page.locator('button:has-text("details")')).not.toBeVisible();
		await expect(page.locator('button:has-text("settings")')).not.toBeVisible();
	});

	test('shows more than a stub of the owner address on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });

		const ownerValue = page.locator('button.chip', { hasText: 'Owner' }).locator('.value');
		await expect(ownerValue).toBeVisible();
		// The old hard 100px fit ~11 characters of 14px Roboto (7.79px per ch plus 1.25px of
		// letter-spacing); the address is 42. min(28ch, 60vw) resolves to 218px here.
		const width = (await ownerValue.boundingBox())!.width;
		expect(width).toBeGreaterThan(180);
	});
});
