import { test, expect } from '@playwright/test';
import { TEST_PRIVATE_KEY, loginOnCurrentPage } from './helpers';

test.describe('Feature: Dev Private Key Login (Wallet Menu)', () => {
	test('should show Dev Private Key option in wallet menu on testnet', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		// Open wallet connect menu
		const connectBtn = page.locator('button:has-text("Connect Wallet"), button:has-text("Connect")').first();
		await expect(connectBtn).toBeVisible({ timeout: 15000 });
		await connectBtn.click();

		// Dev Private Key option must be visible
		const devKeyItem = page.locator('text=Dev Private Key');
		await expect(devKeyItem).toBeVisible({ timeout: 5000 });
	});

	test('should expand private key input when clicking Dev Private Key', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const connectBtn = page.locator('button:has-text("Connect Wallet"), button:has-text("Connect")').first();
		await connectBtn.click();

		const devKeyItem = page.locator('text=Dev Private Key');
		await devKeyItem.click();

		// Input field must appear
		const keyInput = page.locator('.dev-key-input');
		await expect(keyInput).toBeVisible({ timeout: 5000 });

		// Connect button must be disabled (no key entered)
		const devConnectBtn = page.locator('.dev-key-connect');
		await expect(devConnectBtn).toBeDisabled();
	});

	test('should login with valid private key and show address', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		// The wallet button should now show a truncated address with "..."
		await expect(page.locator('button:has-text("...")')).toBeVisible({ timeout: 10000 });
	});

	test('should disconnect wallet via menu', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });
		await loginOnCurrentPage(page);

		// Open menu again — should show Disconnect
		const walletBtn = page.locator('button:has-text("...")');
		await walletBtn.click();

		const disconnectItem = page.locator('text=Disconnect');
		await expect(disconnectItem).toBeVisible({ timeout: 5000 });
		await disconnectItem.click();

		// Should revert to "Connect Wallet" text
		await expect(page.locator('button:has-text("Connect Wallet"), button:has-text("Connect")').first()).toBeVisible({ timeout: 5000 });
	});

	test('should reject invalid private key (wrong length)', async ({ page }) => {
		await page.goto('/', { waitUntil: 'networkidle' });

		const connectBtn = page.locator('button:has-text("Connect Wallet"), button:has-text("Connect")').first();
		await connectBtn.click();

		const devKeyItem = page.locator('text=Dev Private Key');
		await devKeyItem.click();

		// Fill with too-short key
		const keyInput = page.locator('.dev-key-input');
		await keyInput.fill('abc123');

		// Connect button should be disabled (key !== 64 chars)
		const devConnectBtn = page.locator('.dev-key-connect');
		await expect(devConnectBtn).toBeDisabled();
	});
});
