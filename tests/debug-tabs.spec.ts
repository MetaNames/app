import { test, expect } from '@playwright/test';

test('debug tabs on test.mpc domain page', async ({ page }) => {
	await page.goto('/domain/test.mpc');
	await expect(page.locator('h5.domain')).toBeVisible({ timeout: 15000 });
	
	// Get all tab buttons
	const tabs = await page.locator('[role="tab"]').all();
	console.log('Number of tabs:', tabs.length);
	for (const tab of tabs) {
		const text = await tab.textContent();
		console.log('Tab:', text);
	}
	
	await page.screenshot({ path: 'test-results/debug-tabs.png', fullPage: true });
});
