import { test, expect } from '@playwright/test';
import { loginOnCurrentPage } from './helpers';

/**
 * Blockchain operation tests: register domain, add/update/delete records.
 * These submit real transactions to testnet.
 *
 * MUST run sequentially — testnet cannot process > 1 tx/second.
 * Uses test.describe.serial() to enforce order.
 */

// Generate a unique 8-char domain name for this test run
const domainName = `t${Date.now().toString(36).slice(-7)}`;
const fullDomain = `${domainName}.mpc`;

test.describe.serial('Blockchain Operations (sequential)', () => {
	test.describe.configure({ retries: 1 }); // Allow 1 retry — blockchain txns can be slow
	test.setTimeout(120_000); // 2 min per test — blockchain txns are slow

	test('B1 - Register a new domain', async ({ page }) => {
		await page.goto(`/register/${domainName}`, { waitUntil: 'networkidle' });
		await expect(page.locator('.content.checkout')).toBeVisible({ timeout: 15000 });
		await loginOnCurrentPage(page);

		// Wait for fee data to load
		await expect(page.locator('[data-testid="total-fees"]')).toBeVisible({ timeout: 30000 });

		// Click "Approve fees"
		const approveBtn = page.locator('button:has-text("Approve fees")');
		await expect(approveBtn).toBeVisible({ timeout: 10000 });
		await expect(approveBtn).toBeEnabled({ timeout: 5000 });
		await approveBtn.click();

		// Wait for transaction to complete — snackbar appears
		await expect(page.locator('text=New Transaction submitted')).toBeVisible({ timeout: 60000 });

		// "Register domain" button should now be enabled
		const registerBtn = page.locator('button:has-text("Register domain")');
		await expect(registerBtn).toBeEnabled({ timeout: 30000 });

		// Wait for testnet to process previous tx
		await page.waitForTimeout(2000);

		await registerBtn.click();

		// Wait for success message and redirect to domain page
		await expect(page.locator('text=Domain registered successfully')).toBeVisible({
			timeout: 60000
		});
		await page.waitForURL(/\/domain\//, { timeout: 30000 });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
	});

	test('B2 - Add a DNS record to the new domain', async ({ page }) => {
		await page.goto(`/domain/${fullDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		// Click settings tab
		const settingsTab = page.locator('role=tab[name="settings"]');
		await expect(settingsTab).toBeVisible({ timeout: 10000 });
		await settingsTab.click();

		await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

		// Should show "No records found" for new domain
		await expect(page.locator('text=No records found')).toBeVisible({ timeout: 5000 });

		// Select record type "Bio"
		const typeSelect = page.locator('.add-record select, .add-record .mdc-select').first();
		await typeSelect.click();
		await page.locator('.mdc-deprecated-list-item', { hasText: 'Bio' }).click();

		// Fill record value
		const valueInput = page
			.locator('.add-record .value input, .add-record .value textarea')
			.first();
		await valueInput.fill('Integration test bio');

		// Click "Add record"
		const addBtn = page.locator('button:has-text("Add record")');
		await expect(addBtn).toBeEnabled({ timeout: 5000 });
		await addBtn.click();

		// Wait for transaction
		await expect(page.locator('text=New Transaction submitted')).toBeVisible({ timeout: 60000 });

		// Wait for testnet confirmation
		await page.waitForTimeout(3000);

		// Record should appear (Bio with our value inside disabled textbox)
		await expect(page.locator('.record-container').first()).toBeVisible({ timeout: 15000 });
		// Use toHaveValue on the disabled textbox directly (text= doesn't search disabled inputs)
		await expect(page.locator('.record-container textarea[disabled]')).toHaveValue(
			'Integration test bio'
		);
	});

	test('B3 - Edit the DNS record', async ({ page }) => {
		await page.goto(`/domain/${fullDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		// Navigate to settings
		await page.locator('button:has-text("settings")').click();
		await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

		// Click edit on the Bio record
		const editBtn = page.locator('[aria-label="edit-record"]').first();
		await expect(editBtn).toBeVisible({ timeout: 5000 });
		await editBtn.click();

		// Save and cancel buttons should appear
		await expect(page.locator('[aria-label="save-record"]').first()).toBeVisible({ timeout: 5000 });

		// Clear and type new value
		const textarea = page.locator('.record-container textarea').first();
		await textarea.fill('Updated bio value');

		// Click save
		await page.locator('[aria-label="save-record"]').first().click();

		// Wait for transaction
		await expect(page.locator('text=New Transaction submitted')).toBeVisible({ timeout: 60000 });

		// Wait for testnet confirmation
		await page.waitForTimeout(3000);

		// Edit button should reappear (back to view mode)
		await expect(page.locator('[aria-label="edit-record"]').first()).toBeVisible({
			timeout: 15000
		});

		// Value should be updated (check the disabled textarea)
		await expect(page.locator('.record-container textarea[disabled]')).toHaveValue(
			'Updated bio value'
		);
	});

	test('B4 - Delete the DNS record', async ({ page }) => {
		await page.goto(`/domain/${fullDomain}`, { waitUntil: 'networkidle' });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });

		await loginOnCurrentPage(page);

		// Navigate to settings tab (use tab role + text to be specific)
		await page.locator('role=tab[name="settings"]').click();
		await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

		// Record should exist
		await expect(page.locator('.record-container').first()).toBeVisible({ timeout: 5000 });

		// Click delete
		const deleteBtn = page.locator('[aria-label="delete-record"]').first();
		await expect(deleteBtn).toBeVisible({ timeout: 5000 });
		await deleteBtn.click();

		// Confirmation dialog should appear
		await expect(page.locator('text=Do you really want to remove the record')).toBeVisible({
			timeout: 5000
		});

		// Click "Yes" to confirm
		await page.locator('.mdc-dialog button:has-text("Yes")').click();

		// Wait for transaction
		await expect(page.locator('text=New Transaction submitted')).toBeVisible({ timeout: 60000 });

		// Wait for testnet confirmation + page refresh
		await page.waitForTimeout(3000);

		// Reload and click settings tab to ensure we're on the right tab
		await page.reload({ waitUntil: 'networkidle' });
		await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
		await loginOnCurrentPage(page);
		await page.locator('role=tab[name="settings"]').click();
		await expect(page.locator('.records')).toBeVisible({ timeout: 10000 });

		// Record should be gone — "No records found" should show
		await expect(page.locator('text=No records found')).toBeVisible({ timeout: 15000 });
	});
});
