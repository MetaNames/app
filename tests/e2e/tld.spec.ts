import { test, expect } from '@playwright/test';

test.describe('TLD Page', () => {
	test('TLD page loads and shows .mpc domain card', async ({ page }) => {
		await page.goto('/tld', { waitUntil: 'networkidle' });

		// Domain card must render
		const domainCard = page.locator('.domain-container');
		await expect(domainCard).toBeVisible({ timeout: 15000 });

		// Avatar must render
		const avatar = page.locator('.avatar svg').first();
		await expect(avatar).toBeVisible({ timeout: 5000 });
	});

	test('TLD page shows Whois with contract owner', async ({ page }) => {
		await page.goto('/tld', { waitUntil: 'networkidle' });
		await expect(page.locator('.domain-container')).toBeVisible({ timeout: 15000 });

		// Whois section must show owner (contract address)
		const ownerChip = page.getByRole('button', { name: /Owner 0/i });
		await expect(ownerChip).toBeVisible({ timeout: 10000 });
	});

	test('TLD page does NOT show settings tab (isTld=true)', async ({ page }) => {
		await page.goto('/tld', { waitUntil: 'networkidle' });
		await expect(page.locator('.domain-container')).toBeVisible({ timeout: 15000 });

		// Settings tab must NOT exist for TLD
		const settingsTab = page.locator('button:has-text("settings")');
		await expect(settingsTab).not.toBeVisible();
	});

	test('the title names the TLD the page shows', async ({ page }) => {
		await page.goto('/tld', { waitUntil: 'networkidle' });
		const heading = await page.locator('h1').textContent();
		await expect(page).toHaveTitle(`${heading?.trim()} | Meta Names`);
	});
});
