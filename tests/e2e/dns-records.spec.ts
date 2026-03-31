import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

/**
 * Feature 7: DNS Records & Settings
 * test.mpc is owned by the test wallet on testnet.
 * Domain page structure (Profile, Whois, avatar) is covered in Feature 4.
 * These tests focus on the Settings tab and record management.
 */

test.describe('Feature 7: DNS Records & Settings', () => {
	const registeredDomain = 'test.mpc';

	test.describe('Unauthenticated', () => {
		test('7.1 - No tabs visible when not logged in', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('[data-testid="domain-title"]')).toBeVisible({ timeout: 15000 });

			await expect(page.locator('button:has-text("settings")')).not.toBeVisible();
			await expect(page.locator('button:has-text("details")')).not.toBeVisible();
		});
	});

	test.describe('Authenticated (owner)', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('[data-testid="domain-title"]')).toBeVisible({ timeout: 15000 });
			await loginOnCurrentPage(page);
		});

		test('7.2 - Both tabs visible after login', async ({ page }) => {
			await expect(page.locator('button:has-text("settings")')).toBeVisible({ timeout: 10000 });
			await expect(page.locator('button:has-text("details")')).toBeVisible({ timeout: 5000 });
		});

		test('7.3 - Settings tab shows records section and add-record form', async ({ page }) => {
			await page.locator('button:has-text("settings")').click();

			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });
			await expect(page.locator('.add-record')).toBeVisible({ timeout: 5000 });
		});

		test('7.4 - Settings tab shows Renew and Transfer buttons with correct links', async ({
			page
		}) => {
			await page.locator('button:has-text("settings")').click();

			const renewBtn = page.locator('a:has-text("Renew")');
			await expect(renewBtn).toBeVisible({ timeout: 5000 });
			await expect(renewBtn).toHaveAttribute('href', `/domain/${registeredDomain}/renew`);

			const transferBtn = page.locator('a:has-text("Transfer")');
			await expect(transferBtn).toBeVisible({ timeout: 5000 });
			await expect(transferBtn).toHaveAttribute('href', `/domain/${registeredDomain}/transfer`);
		});

		test('7.5 - Records visible with edit/delete buttons', async ({ page }) => {
			await page.locator('button:has-text("settings")').click();
			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

			// test.mpc has records (Bio, Price) — record containers must exist
			await expect(page.locator('.record-container').first()).toBeVisible({ timeout: 5000 });

			// Edit and delete buttons must be present
			await expect(page.locator('[data-testid="edit-record"]').first()).toBeVisible({
				timeout: 5000
			});
			await expect(page.locator('[data-testid="delete-record"]').first()).toBeVisible({
				timeout: 5000
			});
		});

		test('7.6 - Clicking edit shows save/cancel, cancel restores edit button', async ({ page }) => {
			await page.locator('button:has-text("settings")').click();
			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

			const editBtn = page.locator('[data-testid="edit-record"]').first();
			await editBtn.click({ force: true });

			await expect(page.locator('[data-testid="save-record"]').first()).toBeVisible({
				timeout: 10000
			});
			await expect(page.locator('[data-testid="cancel-edit"]').first()).toBeVisible({
				timeout: 5000
			});

			// Cancel and verify edit button returns
			await page.locator('[data-testid="cancel-edit"]').first().click();
			await expect(editBtn).toBeVisible({ timeout: 5000 });
		});

		test('7.7 - Tab switching: details → settings → details', async ({ page }) => {
			// Starts on details — Profile visible
			await expect(page.locator('h5:has-text("Profile")').first()).toBeVisible({ timeout: 10000 });

			// Switch to settings
			await page.locator('button:has-text("settings")').click();
			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });
			await expect(page.locator('h5:has-text("Profile")').first()).not.toBeVisible();

			// Switch back
			await page.locator('button:has-text("details")').click();
			await expect(page.locator('h5:has-text("Profile")').first()).toBeVisible({ timeout: 10000 });
		});
	});
});
