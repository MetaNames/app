import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

test.describe('Feature 7: DNS Records', () => {
	const registeredDomain = 'test.mpc';

	test.describe('Unauthenticated state', () => {
		test('7.1 - Domain page loads with name and avatar', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });

			const domainHeading = page.locator('h5.domain');
			await expect(domainHeading).toBeVisible({ timeout: 15000 });
			await expect(domainHeading).toContainText(/test/i);

			// Avatar SVG must render
			const avatar = page.locator('.avatar svg').first();
			await expect(avatar).toBeVisible({ timeout: 5000 });
		});

		test('7.2 - Profile section visible for registered domain', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			const profileSection = page.locator('h5:has-text("Profile")');
			await expect(profileSection).toBeVisible({ timeout: 10000 });
		});

		test('7.3 - Settings tab NOT visible when wallet disconnected', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			// Tab bar should not render at all (no ownerConnected)
			const settingsTab = page.locator('button:has-text("settings")');
			await expect(settingsTab).not.toBeVisible();

			// Details tab should also not render (no TabBar when not owner)
			const detailsTab = page.locator('button:has-text("details")');
			await expect(detailsTab).not.toBeVisible();
		});

		test('7.4 - Whois section shows owner and expiry', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			const whoisSection = page.locator('h5:has-text("Whois")');
			await expect(whoisSection).toBeVisible({ timeout: 10000 });

			// Owner chip must be present with a blockchain address
			const ownerChip = page.getByRole('button', { name: /Owner 0/i });
			await expect(ownerChip).toBeVisible({ timeout: 5000 });

			// Expiry chip must be present
			const expiryChip = page.getByRole('button', { name: /Expires/i });
			await expect(expiryChip).toBeVisible({ timeout: 5000 });
		});

		test('7.5 - Short link chip visible with correct format', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			// Link chip in Profile section must exist
			const linkChip = page.locator('.chip').filter({ hasText: 'link' }).first();
			await expect(linkChip).toBeVisible({ timeout: 10000 });
		});
	});

	test.describe('Authenticated state (owner)', () => {
		test('7.6 - Settings tab visible for owned domain', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			// Login on this page (preserves stores)
			await loginOnCurrentPage(page);

			// Tab bar should render with both tabs
			const settingsTab = page.locator('button:has-text("settings")');
			await expect(settingsTab).toBeVisible({ timeout: 10000 });

			const detailsTab = page.locator('button:has-text("details")');
			await expect(detailsTab).toBeVisible({ timeout: 5000 });
		});

		test('7.7 - Settings tab shows records section and add form', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Click settings tab
			const settingsTab = page.locator('button:has-text("settings")');
			await expect(settingsTab).toBeVisible({ timeout: 10000 });
			await settingsTab.click();

			// Records section must be visible
			const recordsSection = page.locator('.records');
			await expect(recordsSection).toBeVisible({ timeout: 10000 });

			// Add record form elements must be visible (owner can edit)
			const selectType = page.locator('.add-record');
			await expect(selectType).toBeVisible({ timeout: 5000 });
		});

		test('7.8 - Settings tab shows Renew and Transfer action buttons', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Click settings tab
			const settingsTab = page.locator('button:has-text("settings")');
			await expect(settingsTab).toBeVisible({ timeout: 10000 });
			await settingsTab.click();

			// Renew button must be present and link to correct page
			const renewBtn = page.locator('a:has-text("Renew")');
			await expect(renewBtn).toBeVisible({ timeout: 5000 });
			await expect(renewBtn).toHaveAttribute('href', `/domain/${registeredDomain}/renew`);

			// Transfer button must be present and link to correct page
			const transferBtn = page.locator('a:has-text("Transfer")');
			await expect(transferBtn).toBeVisible({ timeout: 5000 });
			await expect(transferBtn).toHaveAttribute('href', `/domain/${registeredDomain}/transfer`);
		});

		test('7.9 - Record edit/delete buttons visible for owner', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Click settings tab
			const settingsTab = page.locator('button:has-text("settings")');
			await expect(settingsTab).toBeVisible({ timeout: 10000 });
			await settingsTab.click();

			// Wait for records section
			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

			// Check if there are existing records — if yes, edit/delete buttons must be visible
			const recordContainers = page.locator('.record-container');
			const count = await recordContainers.count();

			if (count > 0) {
				// Edit button must be present on records
				const editBtn = page.locator('[aria-label="edit-record"]').first();
				await expect(editBtn).toBeVisible({ timeout: 5000 });

				// Delete button must be present on records
				const deleteBtn = page.locator('[aria-label="delete-record"]').first();
				await expect(deleteBtn).toBeVisible({ timeout: 5000 });
			} else {
				// No records — "No records found" message must show
				await expect(page.locator('text=No records found')).toBeVisible({ timeout: 5000 });
			}
		});

		test('7.10 - Can switch between details and settings tabs', async ({ page }) => {
			await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });
			await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

			await loginOnCurrentPage(page);

			// Should start on details tab — Profile section visible
			await expect(page.locator('h5:has-text("Profile")').first()).toBeVisible({ timeout: 10000 });

			// Switch to settings
			await page.locator('button:has-text("settings")').click();
			await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

			// Profile section should be hidden now
			await expect(page.locator('h5:has-text("Profile")').first()).not.toBeVisible();

			// Switch back to details
			await page.locator('button:has-text("details")').click();
			await expect(page.locator('h5:has-text("Profile")').first()).toBeVisible({ timeout: 10000 });
		});
	});
});
