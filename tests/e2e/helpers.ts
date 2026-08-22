import { expect, type Page } from '@playwright/test';

export const TEST_PRIVATE_KEY = 'df4642ef258f9aef2adb6c148590208b20387fb067f2c0907d6c85697c27928c';

/** Selector for the header Connect button. Distinct from body buttons on protected pages. */
const HEADER_CONNECT_BTN = 'button.mdc-top-app-bar__action-item';
/** Selector for the Dev Private Key input rendered inside the opened wallet menu. */
const DEV_KEY_INPUT = '.dev-key-input';

/**
 * Open the header wallet-connect menu deterministically.
 *
 * Why this exists: on a cold start (especially the first test on a worker) the SvelteKit
 * dev server can return HTML before hydration has attached SMUI click handlers. A single
 * click on the header button then does nothing — no menu opens, no `.dev-key-input` ever
 * appears, and the test fails with `expect(...).toBeVisible()` timeout. The previous
 * mitigation was a fixed `page.waitForTimeout(2000)` sleep before clicking, but that is
 * not reliable under CI load.
 *
 * Strategy: click the header button, then poll for `.dev-key-input` with a short timeout.
 * If it doesn't appear, the click was lost to a not-yet-hydrated handler — close any
 * open overlay (Escape), click again, and retry. After `MAX_ATTEMPTS` failed clicks,
 * fall through to the final visibility assertion which surfaces the real failure
 * with its diagnostic message intact.
 */
export async function openWalletMenu(page: Page) {
	const MAX_ATTEMPTS = 5;
	const PER_ATTEMPT_TIMEOUT_MS = 3000;

	await expect(page.locator(HEADER_CONNECT_BTN)).toBeVisible({ timeout: 15000 });

	const keyInput = page.locator(DEV_KEY_INPUT);
	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		await page.locator(HEADER_CONNECT_BTN).click();
		try {
			await expect(keyInput).toBeVisible({ timeout: PER_ATTEMPT_TIMEOUT_MS });
			return;
		} catch {
			// Click was dropped (handler not hydrated yet, or menu was already open
			// and the click closed it). Dismiss any open overlay and retry.
			await page.keyboard.press('Escape').catch(() => {});
		}
	}

	// Final attempt: surface the real diagnostic instead of swallowing the last
	// per-attempt timeout error.
	await expect(keyInput).toBeVisible({ timeout: PER_ATTEMPT_TIMEOUT_MS });
}

/**
 * Login via the top-bar wallet connect menu's "Dev Private Key" input.
 * The page must already be loaded. Works on any page with the top-bar.
 *
 * IMPORTANT: On pages with ConnectionRequired (e.g. /register, /domain/.../transfer),
 * there are TWO "Connect" buttons — one in the header (top navbar) and one in the page
 * body. Each has its own SMUI Menu anchor. We MUST click the header one specifically.
 *
 * Strategy: Target the button via the SMUI TopAppBar action-item CSS class
 * (.mdc-top-app-bar__action-item) which only exists on the header button.
 * This is more reliable than text matching since the button text changes
 * after login (from "Connect Wallet" to "0033...8f2c").
 */
export async function loginOnCurrentPage(page: Page) {
	// CI flakiness: the SvelteKit dev server can return 500 on cold start or be slow to hydrate.
	// Wait for the page to be fully loaded and not showing an error page.
	// If we see a 500 error page, wait and reload.
	const errorIndicator = page.locator('text=Internal Error');
	if (await errorIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
		await page.waitForTimeout(2000);
		await page.reload({ waitUntil: 'networkidle' });
	}

	// Open the wallet menu with retry — see openWalletMenu() for the rationale.
	await openWalletMenu(page);

	// Wait for any loading spinners to disappear (page still fetching data)
	await page.waitForLoadState('networkidle');

	// Fill the dev private key and submit.
	const keyInput = page.locator(DEV_KEY_INPUT);
	await keyInput.fill(TEST_PRIVATE_KEY);

	// Click the Connect button next to the input (inside the menu, not the header button)
	const devConnectBtn = page.locator('.dev-key-connect').first();
	await expect(devConnectBtn).toBeEnabled({ timeout: 5000 });
	await devConnectBtn.click();

	// Verify wallet is connected — the header button text changes to a short address
	await expect(page.locator(HEADER_CONNECT_BTN)).toContainText('...', { timeout: 10000 });
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
