import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 *
 * Strategy: The SMUI Menu renders as a child of the anchor div inside the header.
 * The dev-key input is always in the DOM on testnet but hidden when the menu
 * is closed (CSS visibility). We click the top-bar Connect button, then wait
 * for the dev-key-input to become visible.
 */
export async function loginOnCurrentPage(page: Page) {
	// The top-bar wallet button is inside a header element.
	// On pages with ConnectionRequired (e.g. /register), there may be a second
	// Connect button in the page body. We target the header's button.
	const topBar = page.locator('header').first();
	const connectBtn = topBar.locator('button', { hasText: /Connect/ }).first();
	await expect(connectBtn).toBeVisible({ timeout: 15000 });

	// Allow SvelteKit hydration to complete. Use a combination approach:
	// 1. Wait for the button to have a parent with a click handler (Svelte attaches event listeners to the root)
	// 2. Then click via evaluate to bypass Playwright's actionability checks
	await page.waitForTimeout(2000);

	// Click via page.evaluate to ensure the click event is dispatched directly to the element,
	// bypassing any Playwright/Svelte event delegation timing issues in CI.
	await page.evaluate(() => {
		const btns = document.querySelectorAll('header button');
		for (const btn of btns) {
			if (btn.textContent?.trim().includes('Connect')) {
				btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
				break;
			}
		}
	});

	// Wait for the dev-key-input to appear in the DOM.
	await page.waitForFunction(
		() => document.querySelector('.dev-key-input') !== null,
		{ timeout: 15000 }
	);

	// Now the element is in the DOM — wait for it to be visible (animation complete).
	const keyInput = page.locator('.dev-key-input');
	await expect(keyInput).toBeVisible({ timeout: 10000 });
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input
	const devConnectBtn = page.locator('.dev-key-connect').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the button text changes to a short address containing "..."
	await expect(topBar.locator('button', { hasText: '...' }).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Login via wallet connect menu at homepage, then navigate via SPA link click.
 * Use when you need wallet state preserved across navigation.
 */
export async function loginAtHome(page: Page) {
	await page.goto('/', { waitUntil: 'networkidle' });
	await loginOnCurrentPage(page);
}

/**
 * SPA-navigate to a path by evaluating goto() in the browser.
 * This preserves Svelte stores (unlike page.goto which does a full reload).
 */
export async function spaNavigate(page: Page, path: string) {
	await page.evaluate(async (p) => {
		const { goto } = await import('$app/navigation');
		await goto(p);
	}, path);
	await page.waitForLoadState('networkidle');
}
